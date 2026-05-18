import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";
import mongoose from "mongoose";
import { Document } from "../../document/document.model";
import { emitNotification } from "../../../utils/socket";
import {
  sendRequestApprovalEmail,
  sendRequestDeclineEmail,
} from "../../user/user.utils";
import { sendPushNotification } from "../../notifications/pushNotification/pushNotification.controller";

type TRequestType = "vendor" | "driver" | "all";

// ─── GET ALL REQUESTS (VENDORS + DRIVERS) ────────────────────────────────────

/**
 * GET /admin/requests
 * Returns vendor and/or driver requests in one list.
 *
 * Query params:
 *   ?type=vendor  → vendors only  (details, no documents)
 *   ?type=driver  → drivers only  (details + submitted documents, all 5 required)
 *   (no type)     → both vendors and drivers combined
 *
 * Also supports: search (name/email/phone), filter, sort, paginate.
 */
const getAllRequests = catchAsync(async (req: Request, res: Response) => {
  const type = (req.query.type as TRequestType) || "all";

  // Build the initial $match based on requested type
  const roleMatch: any =
    type === "vendor"
      ? { role: "vendor" }
      : type === "driver"
        ? { role: "driver" }
        : { role: { $in: ["vendor", "driver"] } };

  const basePipeline: any[] = [
    {
      $match: {
        ...roleMatch,
        isDeleted: false,
      },
    },
    // Join documents — vendors won't match any doc, so they get an empty array
    {
      $lookup: {
        from: "documents",
        localField: "_id",
        foreignField: "driver",
        as: "documents",
      },
    },
    {
      $unwind: {
        path: "$documents",
        preserveNullAndEmptyArrays: true, // keep vendors (no docs) in result
      },
    },
    // For drivers: only show them when all 5 documents are uploaded.
    // For vendors: always pass through (documents field will be null).
    {
      $match: {
        $or: [
          { role: "vendor" },
          {
            role: "driver",
            "documents.isNationalIdUpload": true,
            "documents.isDrivingLicenseUpload": true,
            "documents.isVehicleDetailsUpload": true,
            "documents.isInsuranceUpload": true,
            "documents.isSelfieUpload": true,
          },
        ],
      },
    },
    // Sort key: send → 0 (top), deny → 1, approve → 2 (bottom)
    {
      $addFields: {
        _requestSort: {
          $switch: {
            branches: [
              { case: { $eq: ["$isRequest", "send"] }, then: 0 },
              { case: { $eq: ["$isRequest", "deny"] }, then: 1 },
              { case: { $eq: ["$isRequest", "approve"] }, then: 2 },
            ],
            default: 0,
          },
        },
      },
    },
    { $sort: { _requestSort: 1, createdAt: -1 } },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        image: 1,
        address: 1,
        role: 1,
        blockStatus: 1,
        isRequest: 1,
        isVerified: 1,
        createdAt: 1,
        // Include documents only for drivers; omit field entirely for vendors
        documents: {
          $cond: {
            if: { $eq: ["$role", "driver"] },
            then: {
              _id: "$documents._id",
              isNationalIdUpload: "$documents.national_id",
              isDrivingLicenseUpload: "$documents.driving_license",
              isVehicleDetailsUpload: "$documents.vehicle_details",
              isInsuranceUpload: "$documents.insurance",
              isSelfieUpload: "$documents.selfi",
            },
            else: "$$REMOVE",
          },
        },
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(
    UserModel,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["name", "email", "phone"])
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  const typeLabel =
    type === "vendor" ? "Vendor" : type === "driver" ? "Driver" : "All";

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${typeLabel} requests retrieved successfully`,
    data: { meta, data },
  });
});

// ─── GET SINGLE REQUEST DETAILS ───────────────────────────────────────────────

/**
 * GET /admin/requests/:id
 * Returns details for a single vendor or driver request.
 * - Vendor → just account details
 * - Driver → account details + full submitted documents
 */
const getRequestDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await UserModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    role: { $in: ["vendor", "driver"] },
    isDeleted: false,
  }).select("-password -__v");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
  }

  // If driver, also fetch their submitted documents
  let documents = null;
  if (user.role === "driver") {
    documents = await Document.findOne({
      driver: new mongoose.Types.ObjectId(id),
    }).lean();
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${user.role === "vendor" ? "Vendor" : "Driver"} request details retrieved successfully`,
    data: {
      ...user.toObject(),
      ...(user.role === "driver" && { documents: documents || null }),
    },
  });
});

// ─── APPROVE REQUEST (VENDOR OR DRIVER) ───────────────────────────────────────

/**
 * PATCH /admin/requests/:id/approve
 * Approves a vendor or driver account request.
 * Sets isRequest → "approve" and isVerified → true.
 * Sends email (role-conditional), push notification, and socket notification.
 */
const approveRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await UserModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    role: { $in: ["vendor", "driver"] },
    isDeleted: false,
  }).select("-password -__v");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
  }

  if (user.isRequest === "approve") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${user.role === "vendor" ? "Vendor" : "Driver"} request is already approved`
    );
  }

  if (user.isRequest === "deny") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${user.role === "vendor" ? "Vendor" : "Driver"} request is already denied`
    );
  }

  const role = user.role as "vendor" | "driver";
  const label = role === "vendor" ? "Vendor" : "Driver";
  const approvalMsg =
    role === "vendor"
      ? "Your vendor account has been approved! You can now start setting up your store."
      : "Your driver account has been approved! You can now start accepting trips and deliveries.";

  user.isRequest = "approve";
  user.isVerified = true;
  await user.save();

  // 1. Email — same template, conditional content
  try {
    await sendRequestApprovalEmail(user.name || label, user.email, role);
  } catch (err) {
    console.error(`Failed to send ${label} approval email:`, err);
  }

  // 2. Push notification
  if (user.fcmToken) {
    try {
      await sendPushNotification(user.fcmToken, {
        title: "Account Approved 🎉",
        body: approvalMsg,
      });
    } catch (err) {
      console.error("Failed to send push notification:", err);
    }
  }

  // 3. In-app socket notification
  try {
    await emitNotification({
      userId: user._id as mongoose.Types.ObjectId,
      userMsgTittle: "Account Approved",
      adminMsgTittle: `${label} Approved`,
      userMsg: approvalMsg,
      adminMsg: `${label} ${user.name || user.email} has been approved.`,
    });
  } catch (err) {
    console.error("Failed to emit socket notification:", err);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${label} request approved successfully`,
    data: user,
  });
});

// ─── DECLINE REQUEST (VENDOR OR DRIVER) ───────────────────────────────────────

/**
 * PATCH /admin/requests/:id/decline
 * Declines a vendor or driver account request.
 * Requires { reason: string } in request body.
 * Sets isRequest → "deny".
 * Sends email with reason (role-conditional), push notification, and socket notification with reason.
 */
const declineRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "A decline reason is required");
  }

  const user = await UserModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    role: { $in: ["vendor", "driver"] },
    isDeleted: false,
  }).select("-password -__v");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
  }

  if (user.isRequest === "deny") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${user.role === "vendor" ? "Vendor" : "Driver"} request is already declined`
    );
  }

  if (user.isRequest === "approve") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${user.role === "vendor" ? "Vendor" : "Driver"} request is already approved`
    );
  }

  const role = user.role as "vendor" | "driver";
  const label = role === "vendor" ? "Vendor" : "Driver";
  const declineMsg = `Your ${role} account request has been declined. Reason: ${reason}`;

  user.isRequest = "deny";
  await user.save();

  // 1. Email — same template, conditional content + reason
  try {
    await sendRequestDeclineEmail(user.name || label, user.email, role, reason);
  } catch (err) {
    console.error(`Failed to send ${label} decline email:`, err);
  }

  // 2. Push notification with reason
  if (user.fcmToken) {
    try {
      await sendPushNotification(user.fcmToken, {
        title: "Account Request Declined",
        body: declineMsg,
      });
    } catch (err) {
      console.error("Failed to send push notification:", err);
    }
  }

  // 3. In-app socket notification with reason (reason visible in notification)
  try {
    await emitNotification({
      userId: user._id as mongoose.Types.ObjectId,
      userMsgTittle: "Account Request Declined",
      adminMsgTittle: `${label} Declined`,
      userMsg: declineMsg,
      adminMsg: `${label} ${user.name || user.email} request was declined. Reason: ${reason}`,
    });
  } catch (err) {
    console.error("Failed to emit socket notification:", err);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${label} request declined successfully`,
    data: user,
  });
});

export const AdminRequestController = {
  getAllRequests,
  getRequestDetails,
  approveRequest,
  declineRequest,
};
