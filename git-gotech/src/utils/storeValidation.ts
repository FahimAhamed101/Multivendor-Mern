import { NextFunction, Request, Response } from "express";
import catchAsync from "./catchAsync";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { Showroom } from "../modules/showroom/showroom.model";
import mongoose from "mongoose";
import { IUserPayload } from "../middlewares/roleGuard";

export const storeValidation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const storeId = req.get("showroom") as string;
    const user = req.user as IUserPayload;
    if (!storeId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Showroom not found in header",
      );
    }
    const findStore = await Showroom.countDocuments({
      isApprove: true,
      owner: new mongoose.Types.ObjectId(user.id || "n/a"),
      _id: new mongoose.Types.ObjectId(storeId || "n/a"),
    });
    if (!findStore) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "This selected showroom is not valid or verified. Please contact support",
      );
    }
    next();
  },
);
