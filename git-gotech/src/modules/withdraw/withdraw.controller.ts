import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WithdrawRequest } from "./withdraw.model";
import mongoose, { Types, isValidObjectId } from "mongoose";
import { WithdrawStatus } from "./withdraw.interface";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status";
import { UserModel } from "../user/user.model";
import { transactionService } from "../transaction/transaction.service";
import { emitNotification } from "../../utils/socket";
import { ETransactionStatus, ETransactionType } from "../transaction/transaction.interface";
import { FindQueryBuilder } from "../../utils/FindQueryBuilder";
import { withdrawRequestSearchableFields } from "./withdraw.constants";
import { platformConfig } from "../../config";

class Controller {
    createWithdrawRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        const payload = req.body;
        const decodedToken = req.user;

        const userId = new Types.ObjectId(decodedToken?.id);

        // (1) Optional rule: only one pending request at a time
        const existingPending = await WithdrawRequest.findOne({
            userId,
            status: WithdrawStatus.PENDING,
        }).lean();

        if (existingPending) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "You already have a pending withdraw request. Wait for it to be accept. Then you can request for new withdraw request."
            );
        }

        const user = await UserModel.findById(decodedToken?.id);
        if (!user) {
            throw new AppError(httpStatus.BAD_REQUEST, "User Not Found!!");
        }

        if (payload.amount! > user.wallet!) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Insufficient withdrawable balance"
            );
        }

        if (payload.amount! < 1) {
            throw new AppError(httpStatus.BAD_REQUEST, "Minimum withdraw amount is $1");
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const platformFee = user.role === "vendor" ? platformConfig.VENDOR_WITHDRAW_PERCENTAGE_RATE : user.role === "customer" ? platformConfig.CUSTOMER_WITHDRAW_PERCENTAGE_RATE : platformConfig.DRIVER_WITHDRAW_PERCENTAGE_RATE;

        try {
            const [newWithdrawRequest] = await WithdrawRequest.create(
                [
                    {
                        userId: decodedToken?.id,
                        platformFee:
                            (Number(payload.amount!) * platformFee) / 100,
                        ...payload,
                    },
                ],
                {
                    session,
                }
            );

            // Deduct Withdrawable Balance
            // user = await User.findOneAndUpdate(
            //   { _id: decodedToken.userId, wallet: { $gte: payload.amount } },
            //   { $inc: { wallet: -payload.amount! } },
            //   { new: true, session }
            // );

            // Send Notification To User
            await emitNotification(
                {
                    userId: decodedToken?.id,
                    userMsgTittle: "Withdraw Request Submitted",
                    userMsg: `Your withdraw request of ₵${payload.amount} has been submitted successfully.`,
                    adminMsgTittle: "New Withdraw Request",
                    adminMsg: `New withdraw request of ₵${payload.amount} from ${user?.name}`,
                }
            )

            // Store Transaction Log
            // await transactionService.recordTransaction(
            //     {
            //         user: decodedToken?.id,
            //         type: ETransactionType.DEBIT,
            //         amount: Number(payload.amount),
            //         description: `Withdrawal requested`,
            //         status: ETransactionStatus.PENDING,
            //         referenceId: String(newWithdrawRequest._id) as string,
            //         session
            //     },
            // )

            await session.commitTransaction();
            session.endSession();

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Withdraw request created successfully",
                data: newWithdrawRequest,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    });

    getAllWithdrawRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // 1) userId required + must be valid
        const decodedToken = req.user;
        const query = req.query;

        if (!decodedToken?.id) {
            throw new AppError(httpStatus.BAD_REQUEST, "userId is required");
        }

        if (!isValidObjectId(decodedToken.id)) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid userId");
        }

        const user = await UserModel.findById(decodedToken.id);
        if (!user) {
            throw new AppError(httpStatus.BAD_REQUEST, "User Not Found!!");
        }

        const queryBuilder = new FindQueryBuilder(
            WithdrawRequest.find({ userId: decodedToken.id }),
            query as Record<string, string>
        );

        const withdrawRequests = queryBuilder
            .search(withdrawRequestSearchableFields)
            .filter()
            .sort()
            .fields()
            .paginate();

        const [data, meta] = await Promise.all([
            queryBuilder.build(),
            queryBuilder.getMeta(),
        ]);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Withdraw requests fetched successfully",
            data: {
                meta,
                data,
            }
        });
    })
}

export const WithdrawController = new Controller();