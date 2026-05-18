import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { Types } from "mongoose";
import { UserModel } from "../modules/user/user.model";

export const validateUserLockStatus = async (userId: Types.ObjectId) => {
  const userDetails = await UserModel.findById(userId)
  if (!userDetails) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }

  if (userDetails?.blockStatus) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your account has been blocked. Please contact with support",
    );
  }

  if (userDetails?.isDeleted) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your account has been deleted. Please contact with support",
    );
  }

  if (userDetails.isRequest !== "approve") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your account has not been approved. Please contact with support",
    );
  }

  if (!userDetails?.isVerified && userDetails?.role !== "admin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your account has not been verified. Please contact with support",
    );
  }
  return { balance: userDetails.balance || 0 };
};
