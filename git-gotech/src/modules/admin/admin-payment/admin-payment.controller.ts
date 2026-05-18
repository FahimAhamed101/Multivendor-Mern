import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { WithdrawRequest } from "../../withdraw/withdraw.model";
import { WithdrawStatus } from "../../withdraw/withdraw.interface";
import { transactionService } from "../../transaction/transaction.service";
import { ETransactionType, ETransactionStatus } from "../../transaction/transaction.interface";
import { NotificationModel } from "../../notifications/notification.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import { IUserPayload } from "../../../middlewares/roleGuard";
import ApiError from "../../../errors/ApiError";
import { emitNotification } from "../../../utils/socket";
import { sendWithdrawApprovalEmail, sendWithdrawRejectionEmail } from "./admin-payment.utils";

const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $addFields: {
        statusPriority: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", WithdrawStatus.PENDING] }, then: 1 },
            ],
            default: 2,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
              email: 1,
              phone: 1,
              image: 1,
              bio: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { statusPriority: 1, createdAt: -1 } as any },
  ];

  const queryBuilder = new AggregateQueryBuilder(
    WithdrawRequest,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["status", "bankName", "accountName", "accountNumber", "userDetails.name", "userDetails.email"])
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw requests retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getWithdrawDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WithdrawRequest.findById(id).populate({
    path: "userId",
    select: "name email phone image balance",
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Withdraw request not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw request details retrieved successfully",
    data: result,
  });
});

const approveWithdraw = catchAsync(async (req: Request, res: Response) => {
  const admin = req.user as IUserPayload;
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await WithdrawRequest.findById(id).populate("userId", "email name phone username").session(session);
    if (!withdraw) {
      throw new ApiError(httpStatus.NOT_FOUND, "Withdraw request not found");
    }

    if (withdraw.status !== WithdrawStatus.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Withdrawal is already ${withdraw.status}`);
    }

    // 1. Update withdraw request
    withdraw.status = WithdrawStatus.APPROVED;
    withdraw.approvedBy = new mongoose.Types.ObjectId(admin.id);
    withdraw.approvedAt = new Date();
    withdraw.adminNote = req.body.adminNote || withdraw.adminNote;
    await withdraw.save({ session });

    const customer = withdraw.userId as any;
    const customerId = customer?._id || withdraw.userId;

    // 2. Process user transaction (deduction)
    await transactionService.recordTransaction({
      user: customerId,
      amount: withdraw.amount,
      type: ETransactionType.DEBIT,
      description: `Withdrawal amount ${withdraw.amount} request #${withdraw._id?.toString().slice(0, 10)} approved by ${admin.email}`,
      referenceId: withdraw._id?.toString(),
      status: ETransactionStatus.SUCCESS,
      session,
    });

    // 3. Admin cut (10%) and add to admin balance
    const adminCut = withdraw.platformFee;
    await transactionService.recordTransaction({
      user: admin.id,
      amount: adminCut,
      type: ETransactionType.CREDIT,
      description: `${withdraw.platformFee} Platform fee from withdrawal #${withdraw._id?.toString().slice(0, 10)} of user ${customer?.email}`,
      referenceId: withdraw._id?.toString(),
      status: ETransactionStatus.SUCCESS,
      session,
    });

    // 4. Create notification for user
    await emitNotification({
      userId: customerId,
      adminMsgTittle: "Withdrawal Approved",
      adminMsg: `Withdrawal request for ${withdraw.amount} has been approved.`,
      userMsgTittle: "Withdrawal Approved",
      userMsg: `Your withdrawal request for ${withdraw.amount} has been approved and your balance has been updated.`,
    })

    // 5. send email to user
    await sendWithdrawApprovalEmail(customer?.name, customer?.email, withdraw.amount, req.body.adminNote || "No admin note");

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Withdrawal request approved successfully",
      data: withdraw,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const rejectWithdraw = catchAsync(async (req: Request, res: Response) => {
  const admin = req.user as IUserPayload;
  const { id } = req.params;
  const { rejectedReason, adminNote } = req.body;

  if (!rejectedReason) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Rejection reason is required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await WithdrawRequest.findById(id).populate("userId", "email name phone username").session(session);

    const customer = withdraw?.userId as any;
    const customerId = customer?._id || withdraw?.userId;

    if (!withdraw) {
      throw new ApiError(httpStatus.NOT_FOUND, "Withdraw request not found");
    }

    if (withdraw.status !== WithdrawStatus.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Withdrawal is already ${withdraw.status}`);
    }

    // 1. Update withdraw request
    withdraw.status = WithdrawStatus.REJECTED;
    withdraw.rejectedBy = new mongoose.Types.ObjectId(admin.id);
    withdraw.rejectedAt = new Date();
    withdraw.rejectedReason = rejectedReason;
    withdraw.adminNote = adminNote || withdraw.adminNote;
    await withdraw.save({ session });

    // 2. Create notification for user
    await emitNotification({
      userId: customerId,
      adminMsgTittle: "Withdrawal Rejected",
      adminMsg: `Withdrawal request for ${withdraw.amount} has been rejected by admin.`,
      userMsgTittle: "Withdrawal Rejected",
      userMsg: `Your withdrawal request for ${withdraw.amount} has been rejected by ${admin.email}. Reason: ${rejectedReason}`,
    })

    // send email to user
    await sendWithdrawRejectionEmail(customer.name, customer.email, withdraw.amount, rejectedReason, adminNote || "No admin note");

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Withdrawal request rejected successfully",
      data: withdraw,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const AdminPaymentController = {
  getAllWithdrawRequests,
  getWithdrawDetails,
  approveWithdraw,
  rejectWithdraw,
};
