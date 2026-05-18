import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { findUserById } from "../user/user.utils";
import { NotificationModel } from "./notification.model";
import catchAsync from "../../utils/catchAsync";
import sendError from "../../utils/sendError";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";
import { sendPushNotificationToMultiple } from "./pushNotification/pushNotification.controller";
import paginationBuilder from "../../utils/paginationBuilder";
import { IUserPayload } from "../../middlewares/roleGuard";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";
import { emitNotification } from "../../utils/socket";

// --- Role-based notification config ---
const roleNotificationConfig = {
  admin: {
    queryKey: "adminId",
    selectFields: "adminMsgTittle adminMsg createdAt updatedAt",
    readField: "isAdminRead",
    msgField: "adminMsg",
  },
  customer: {
    queryKey: "userId",
    selectFields: "userMsg userMsgTittle createdAt updatedAt",
    readField: "isUserRead",
    msgField: "userMsg",
  },
  vendor: {
    queryKey: "userId",
    selectFields: "userMsg userMsgTittle createdAt updatedAt",
    readField: "isUserRead",
    msgField: "userMsg",
  },
  driver: {
    queryKey: "userId",
    selectFields: "userMsg userMsgTittle createdAt updatedAt",
    readField: "isUserRead",
    msgField: "userMsg",
  },
  manager: {
    queryKey: "userId",
    selectFields: "userMsg userMsgTittle createdAt updatedAt",
    readField: "isUserRead",
    msgField: "userMsg",
  },
  support: {
    queryKey: "userId",
    selectFields: "userMsg userMsgTittle createdAt updatedAt",
    readField: "isUserRead",
    msgField: "userMsg",
  },
} as any;

export const getMyNotification = catchAsync(
  async (req: Request, res: Response) => {
    const auth = req.user as IUserPayload;

    if (!auth) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

    const user = await findUserById(auth.id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");

    const config = roleNotificationConfig[user.role as keyof typeof roleNotificationConfig];
    if (!config) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid user role.");
    }

    const query = { [config.queryKey]: user._id };
    const selectFields = config.selectFields;
    const readField = config.readField;
    const msgField = config.msgField;

    const pipeline = [
      {
        $match: {
          $or: [
            { [config.queryKey]: user._id },
            { isBroadcast: true }
          ]
        },
      },
    ];

    // Mark notifications as read
    await NotificationModel.updateMany(
      {
        $or: [
          { [config.queryKey]: user._id },
          { isBroadcast: true }
        ],
        [config.readField]: false
      },
      {
        $set: { [config.readField]: true }
      }
    );

    const queryBuilder = new AggregateQueryBuilder(NotificationModel, pipeline, req.query as Record<string, any>)

    queryBuilder
      .search(selectFields.split(' ') as string[])
      .filter()
      .sort()
      .fields()
      .paginate()

    const [data, meta] = await Promise.all([
      queryBuilder.build(),
      queryBuilder.getMeta()
    ]);


    const formattedNotifications = data.map((notification) => ({
      _id: notification._id,
      isReadable: notification[readField] as boolean,
      msg: notification[msgField] as string,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));

    if (formattedNotifications.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: true,
        message: "You have no notifications.",
        data: { notifications: [], meta },
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Here are your notifications.",
      data: {
        meta,
        notifications: formattedNotifications,
      },
    });
  }
);

export const getUnreadBadgeCount = catchAsync(
  async (req: Request, res: Response) => {
    const auth = req.user as IUserPayload;
    const user = await findUserById(auth.id);
    if (!user) throw new ApiError(404, "User not found");
    const config =
      roleNotificationConfig[user.role as keyof typeof roleNotificationConfig];

    if (!config) {
      return sendError(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Invalid user role.",
      });
    }

    const unreadCount = await NotificationModel.countDocuments({
      $or: [
        { [config.queryKey]: user._id, [config.readField]: false },
        { isBroadcast: true, [config.readField]: false }
      ]
    });

    const rawNotifications = await NotificationModel.find({
      $or: [
        { [config.queryKey]: user._id },
        { isBroadcast: true }
      ],
      [config.msgField]: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select(`${config.msgField} createdAt`)
      .exec();

    const latestNotifications = rawNotifications.map((notification) => ({
      msg: notification[config.msgField] || "",
      createdAt: notification.createdAt,
    }));

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Unread badge count and latest notifications retrieved successfully.",
      data: {
        unreadCount,
        latestNotifications,
      },
    });
  }
);

export const adminSendPushNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;

    // if (!fcmTokens || !title || !body) {
    //   return res.status(400).json({
    //     message: "Missing required fields: fcmTokens, title, and body.",
    //   });
    // }

    // // Ensure fcmTokens is an array of strings
    // let tokens: string[] = [];
    // if (typeof fcmTokens === "string") {
    //   tokens = [fcmTokens];
    // } else if (Array.isArray(fcmTokens)) {
    //   tokens = fcmTokens;
    // } else {
    //   return res.status(400).json({
    //     message: "fcmTokens must be a string or an array of strings.",
    //   });
    // }

    // Send Admin Notification To All
    const response = await NotificationModel.create({
      userId: null,
      isBroadcast: true,
      userMsgTittle: `Notification From Admin - ${payload.title}`,
      userMsg: `Notification From Admin - ${payload.body}`,
      adminMsgTittle: `Send Notification To All Users - ${payload.title}`,
      adminMsg: `Send Notification To All Users - ${payload.body}`,
    });

    // Use the multicast helper to send notifications to all provided tokens
    // const response = await sendPushNotificationToMultiple(tokens, {
    //   title,
    //   body,
    // });

    return res
      .status(200)
      .json({ message: "Push notifications sent successfully.", response });
  } catch (error) {
    next(error);
  }
};

export const readNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const result = await NotificationModel.updateMany(
    { userId: user.id },
    { isRead: true },
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification read successfully",
    data: result,
  });
});