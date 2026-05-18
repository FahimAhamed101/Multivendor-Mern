import httpStatus from "http-status";
import { getTrackingNumber } from "../../utils/getTrackingNumber";
import { EStatus, IDeliveryRequest } from "./delivery-request.interface";
import { DeliveryRequestModel } from "./delivery-request.model";
import ApiError from "../../errors/ApiError";
import { UserModel } from "../user/user.model";

const createDeliveryRequestService = async (payload: Partial<IDeliveryRequest>) => {
  const user = await UserModel.findOne({
    _id: payload.user,
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (payload.price?.deliveryFee && payload.price?.tip) {
    const totalCost = payload.price.deliveryFee + payload.price.tip;
    if (user.balance < totalCost) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }
  }

  const trackingNumber = await getTrackingNumber();

  const newRequest = await DeliveryRequestModel.create({ ...payload, trackingNumber, tracking: [{ status: EStatus.PENDING, message: "Delivery request placed successfully." }] });
  return newRequest;
};

const getDeliveryRequestsForDriverService = async () => {
  // Add specific driver-related queries here if necessary (e.g., matching by location, or available status).
  // For now, returning all requests sorted by creation time.
  const requests = await DeliveryRequestModel.find({ status: EStatus.PENDING })
    .populate("user", "name email phone image")
    .sort({ createdAt: -1 });

  return requests;
};

const getDeliveryRequestsByUserService = async (userId: string) => {
  const requests = await DeliveryRequestModel.find({ user: userId })
    .populate("user", "name email phone image")
    .sort({ createdAt: -1 });

  return requests;
};

const getDeliveryRequestByIdService = async (id: string) => {
  return await DeliveryRequestModel.findById(id);
};

export const DeliveryRequestService = {
  createDeliveryRequestService,
  getDeliveryRequestsForDriverService,
  getDeliveryRequestsByUserService,
  getDeliveryRequestByIdService,
};
