import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";
import { Showroom } from "../../showroom/showroom.model";
import { UserModel } from "../../user/user.model";
import { emitNotification } from "../../../utils/socket";
import { sendPushNotification } from "../../notifications/pushNotification/pushNotification.controller";
import {
  sendVendorApprovalEmail,
  sendVendorDeclineEmail,
} from "../../user/user.utils";

// ─── GET ALL SHOWROOMS ────────────────────────────────────────────────────────

/**
 * GET /admin/showrooms
 * Returns all showrooms — unapproved (isApprove: false) appear first, approved last.
 * Supports search, filter, sort and paginate via AggregateQueryBuilder.
 */
const getAllShowrooms = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: {
        isDeleted: false,
      },
    },
    // Join owner (vendor) details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        showroom_id: "$_id",
        showroom_name: 1,
        showroom_category: 1,
        showroom_address: 1,
        logo: 1,
        isApprove: 1,
        createdAt: 1,
        owner: {
          _id: "$ownerInfo._id",
          name: "$ownerInfo.name",
          email: "$ownerInfo.email",
          phone: "$ownerInfo.phone",
          image: "$ownerInfo.image",
        },
        // Sort key: unapproved (false = 0) come before approved (true = 1)
        _approveSort: { $cond: [{ $eq: ["$isApprove", true] }, 1, 0] },
      },
    },
    // Unapproved on top, approved below
    {
      $sort: { _approveSort: 1, createdAt: -1 },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(
    Showroom,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["showroom_name", "showroom_address", "showroom_category"])
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showrooms retrieved successfully",
    data: { meta, data },
  });
});

// ─── GET SINGLE SHOWROOM ──────────────────────────────────────────────────────

/**
 * GET /admin/showrooms/:id
 * Returns full details of a single showroom including owner info.
 */
const getSingleShowroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const showroom = await Showroom.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        showroom_name: 1,
        showroom_category: 1,
        showroom_address: 1,
        showroom_schedule: 1,
        logo: 1,
        nidImage: 1,
        ownerImage: 1,
        referralCode: 1,
        location: 1,
        isApprove: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          _id: "$ownerInfo._id",
          name: "$ownerInfo.name",
          email: "$ownerInfo.email",
          phone: "$ownerInfo.phone",
          image: "$ownerInfo.image",
          blockStatus: "$ownerInfo.blockStatus",
        },
      },
    },
  ]);

  if (!showroom || showroom.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Showroom not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom details retrieved successfully",
    data: showroom[0],
  });
});

// ─── APPROVE SHOWROOM ─────────────────────────────────────────────────────────

/**
 * PATCH /admin/showrooms/:id/approve
 * Approves a showroom — sets isApprove to true.
 * Sends email + push + socket notification to the vendor owner.
 */
const approveShowroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const showroom = await Showroom.findOne({
    _id: new mongoose.Types.ObjectId(id),
    isDeleted: false,
  });

  if (!showroom) {
    throw new ApiError(httpStatus.NOT_FOUND, "Showroom not found");
  }

  if (showroom.isApprove) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Showroom is already approved"
    );
  }

  showroom.isApprove = true;
  await showroom.save();

  // Fetch the vendor (owner) to send notifications
  const vendor = await UserModel.findById(showroom.owner).select(
    "name email fcmToken _id"
  );

  if (vendor) {
    // 1. Email
    try {
      await sendVendorApprovalEmail(
        vendor.name || "Vendor",
        vendor.email
      );
    } catch (err) {
      console.error("Failed to send showroom approval email:", err);
    }

    // 2. Push notification
    if (vendor.fcmToken) {
      try {
        await sendPushNotification(vendor.fcmToken, {
          title: "Showroom Approved 🎉",
          body: `Your showroom "${showroom.showroom_name}" has been approved! Customers can now discover your store.`,
        });
      } catch (err) {
        console.error("Failed to send push notification:", err);
      }
    }

    // 3. In-app socket notification
    try {
      await emitNotification({
        userId: vendor._id as mongoose.Types.ObjectId,
        userMsgTittle: "Showroom Approved",
        adminMsgTittle: "Showroom Approved",
        userMsg: `Your showroom "${showroom.showroom_name}" has been approved! Customers can now discover your store.`,
        adminMsg: `Showroom "${showroom.showroom_name}" owned by ${vendor.name || vendor.email} has been approved.`,
      });
    } catch (err) {
      console.error("Failed to emit socket notification:", err);
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom approved successfully",
    data: showroom,
  });
});

// ─── DECLINE SHOWROOM ─────────────────────────────────────────────────────────

/**
 * PATCH /admin/showrooms/:id/decline
 * Declines a showroom — sets isApprove to false.
 * Requires { reason: string } in body.
 * Sends email + push + socket notification with the reason to the vendor owner.
 */
const declineShowroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "A decline reason is required");
  }

  const showroom = await Showroom.findOne({
    _id: new mongoose.Types.ObjectId(id),
    isDeleted: false,
  });

  if(showroom?.isApprove){
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom is already approved");
  }

  if (!showroom) {
    throw new ApiError(httpStatus.NOT_FOUND, "Showroom not found");
  }

  if (!showroom.isApprove) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Showroom is already in a declined/pending state"
    );
  }

  showroom.isApprove = false;
  await showroom.save();

  // Fetch the vendor (owner)
  const vendor = await UserModel.findById(showroom.owner).select(
    "name email fcmToken _id"
  );

  if (vendor) {
    // 1. Email with reason
    try {
      await sendVendorDeclineEmail(
        vendor.name || "Vendor",
        vendor.email,
        reason
      );
    } catch (err) {
      console.error("Failed to send showroom decline email:", err);
    }

    // 2. Push notification with reason
    if (vendor.fcmToken) {
      try {
        await sendPushNotification(vendor.fcmToken, {
          title: "Showroom Request Declined",
          body: `Your showroom "${showroom.showroom_name}" was declined. Reason: ${reason}`,
        });
      } catch (err) {
        console.error("Failed to send push notification:", err);
      }
    }

    // 3. In-app socket notification with reason
    try {
      await emitNotification({
        userId: vendor._id as mongoose.Types.ObjectId,
        userMsgTittle: "Showroom Declined",
        adminMsgTittle: "Showroom Declined",
        userMsg: `Your showroom "${showroom.showroom_name}" has been declined. Reason: ${reason}`,
        adminMsg: `Showroom "${showroom.showroom_name}" owned by ${vendor.name || vendor.email} was declined. Reason: ${reason}`,
      });
    } catch (err) {
      console.error("Failed to emit socket notification:", err);
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom declined successfully",
    data: showroom,
  });
});

export const AdminShowroomController = {
  getAllShowrooms,
  getSingleShowroom,
  approveShowroom,
  declineShowroom,
};
