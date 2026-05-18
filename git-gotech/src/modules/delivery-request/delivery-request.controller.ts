import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DeliveryRequestService } from "./delivery-request.service";
import ApiError from "../../errors/ApiError";
import { UserModel } from "../user/user.model";
import { IDeliveryRequest, EStatus } from "./delivery-request.interface";
import { emitNotification } from "../../utils/socket";
import { sendPushNotification } from "../notifications/pushNotification/pushNotification.controller";
import { ETransactionType } from "../transaction/transaction.interface";
import { transactionService } from "../transaction/transaction.service";
import { getTrackingNumber } from "../../utils/getTrackingNumber";

const createDeliveryRequest = catchAsync(async (req: Request, res: Response) => {
  const images: string[] = [];

  // Mutler handles multiple files via req.files Array
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      images.push(file.filename);
    }
  }

  if (images.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "At least one image is required for the delivery request");
  }

  // req.user is populated by roleGuard/auth middleware. Ensure userId is taken.
  const userId = (req as any).user?.id;

  const payload = req.body as Partial<IDeliveryRequest>;
  payload.images = images;
  payload.user = userId;
  payload.trackingNumber = getTrackingNumber().toString();

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const newRequest = await DeliveryRequestService.createDeliveryRequestService(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Delivery request created successfully",
    data: newRequest,
  });
});

const getDeliveryRequestsForDriver = catchAsync(async (req: Request, res: Response) => {
  // Add driver auth checks here if needed, for instance checking (req as any).user.role === 'driver'
  const requests = await DeliveryRequestService.getDeliveryRequestsForDriverService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delivery requests fetched successfully",
    data: requests,
  });
});

const getDeliveryRequestsByUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const requests = await DeliveryRequestService.getDeliveryRequestsByUserService(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delivery requests fetched successfully",
    data: requests,
  });
});

const changeDeliveryRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectedReason } = req.body;

  const driverId = (req as any).user?.id;
  if (!driverId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const deliveryRequest = await DeliveryRequestService.getDeliveryRequestByIdService(id);
  
  if (!deliveryRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Delivery request not found");
  }

  if (status === EStatus.REJECTED && rejectedReason) {
    deliveryRequest.rejectedReason = rejectedReason;
  }

  // Deduct balance when driver accepts the request
  if (status === EStatus.DRIVER_ACCEPTED) {
    // Prevent double deduction if already processed
    if (deliveryRequest.status !== EStatus.DRIVER_ACCEPTED) {
       const totalCost = (deliveryRequest.price?.tip || 0) + (deliveryRequest.price?.deliveryFee || 0);

       if (totalCost > 0) {
         // Use recordTransaction helper to deduct balance and log history
         await transactionService.recordTransaction({
           user: deliveryRequest.user.toString(),
           amount: totalCost,
           type: ETransactionType.DEBIT,
           description: `Payment for delivery request #${(deliveryRequest as any)._id}`,
           referenceId: (deliveryRequest as any)._id.toString(),
         });
       }
    }
  }

  // Refund if request is rejected after being accepted (and charged)
  if (status === EStatus.REJECTED && deliveryRequest.status === EStatus.DRIVER_ACCEPTED) {
    const totalCost = (deliveryRequest.price?.tip || 0) + (deliveryRequest.price?.deliveryFee || 0);
    if (totalCost > 0) {
      await transactionService.recordTransaction({
        user: deliveryRequest.user.toString(),
        amount: totalCost,
        type: ETransactionType.CREDIT,
        description: `Refund for rejected delivery request #${(deliveryRequest as any)._id}`,
        referenceId: (deliveryRequest as any)._id.toString(),
      });
    }
  }

  deliveryRequest.status = status;

  await deliveryRequest.save();
  const populatedRequest: any = await deliveryRequest.populate("user", "name fcmToken");
  
  // Emit in-app notification & push notification
  if (populatedRequest.user) {
    const customerId = populatedRequest.user._id;
    const customerName = populatedRequest.user.name;
    const fcmToken = populatedRequest.user.fcmToken;

    let userMsg = `Hello ${customerName}, your delivery request status has been updated to: ${status}.`;
    let pushTitle = "📦 Delivery Status Update";
    
    if (status === EStatus.DRIVER_ACCEPTED) {
         userMsg = `Good news ${customerName}, a driver has accepted your delivery request!`;
    } else if (status === EStatus.PICKED_UP) {
         userMsg = `Your items have been picked up and are on the way!`;
    } else if (status === EStatus.DELIVERED) {
         pushTitle = "✅ Delivery Completed";
         userMsg = `Your delivery has been successfully completed! Thank you for using our service.`;
    } else if (status === EStatus.REJECTED) {
         pushTitle = "❌ Delivery Rejected";
         userMsg = `Unfortunately, your delivery request was rejected. Reason: ${rejectedReason || 'No reason provided.'}`;
    }

    const notificationPayload = {
      userId: customerId,
      userMsgTittle: pushTitle,
      adminMsgTittle: "📦 Delivery Status Update (Admin)", // Required by emitNotification type
      userMsg: userMsg,
    };
    
    // In-app Socket notification
    await emitNotification(notificationPayload).catch(err => console.error("Socket error", err));

    // FCM Push Notification
    if (fcmToken) {
      try {
        const pushMessage = {
          title: pushTitle,
          body: userMsg,
        };
        await sendPushNotification(fcmToken, pushMessage);
      } catch (err) {
        console.error("Error sending push notification:", err);
      }
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Delivery request status updated to ${status}`,
    data: deliveryRequest,
  });
});

export const DeliveryRequestController = {
  createDeliveryRequest,
  getDeliveryRequestsForDriver,
  changeDeliveryRequestStatus,
  getDeliveryRequestsByUser
};
