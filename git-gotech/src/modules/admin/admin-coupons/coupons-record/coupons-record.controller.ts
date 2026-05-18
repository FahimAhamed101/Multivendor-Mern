import { Request, Response } from "express";
import catchAsync from "../../../../utils/catchAsync";
import sendResponse from "../../../../utils/sendResponse";
import httpStatus from "http-status";
import { CouponRecordModel } from "./coupons-record.model";
import { CouponModel } from "../admin-coupons.model";
import { IUserPayload } from "../../../../middlewares/roleGuard";
import ApiError from "../../../../errors/ApiError";
import { AggregateQueryBuilder } from "../../../../utils/AggregateQueryBuilder";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";

const takeCoupon = catchAsync(async (req: Request, res: Response) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user as IUserPayload;
    const { couponId } = req.body;

    const coupon = await CouponModel.findById(couponId).session(session);
    if (!coupon || coupon.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    if (!coupon.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This coupon is currently inactive");
    }

    const now = new Date();
    if (now < coupon.startAt || now > coupon.expiresAt) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is not valid at this time");
    }

    if (coupon.quantity <= coupon.usedCount) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This coupon has reached its limit");
    }

    const alreadyTaken = await CouponRecordModel.findOne({
      userId: user.id,
      couponId,
      isDeleted: false,
    }).session(session);

    if (alreadyTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You have already taken this coupon");
    }

    const result = await CouponRecordModel.create([{
      userId: user.id,
      couponId,
    }], { session });

    // Increment coupon used count
    await CouponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { session });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Coupon taken successfully",
      data: result[0],
    });

    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const getMyCoupons = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;

  const basePipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(user.id),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "coupons",
        localField: "couponId",
        foreignField: "_id",
        as: "coupon",
      },
    },
    {
      $unwind: "$coupon",
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              role: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: "$user"
    }
  ];

  const queryBuilder = new AggregateQueryBuilder(
    CouponRecordModel,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["coupon.couponName"])
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
    message: "Your coupons retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const toggleUseCoupon = async (user: JwtPayload, body: { isUsed: boolean, whereUsed: string, couponName: string }) => {
  const { isUsed, whereUsed, couponName } = body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const coupon = await CouponModel.findOne({
      couponName: couponName.toLowerCase(),
      isDeleted: false,
    }).session(session);

    if (!coupon) {
      throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    const record = await CouponRecordModel.findOne({
      couponId: coupon._id,
      userId: user.id,
      isDeleted: false,
    }).session(session);

    if (!record) {
      throw new ApiError(httpStatus.NOT_FOUND, "Coupon record not found");
    }

    if (isUsed === true) {
      if (record.isUsed) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is already used");
      }

      if (!coupon || coupon.isDeleted || !coupon.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Underlying coupon is no longer valid");
      }

      const now = new Date();
      if (now < coupon.startAt || now > coupon.expiresAt) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Underlying coupon has expired");
      }

      // Update usage
      record.isUsed = true;
      record.usedAt = new Date();
      record.whereUsed = whereUsed || null;
      await record.save();


      await session.commitTransaction();
      session.endSession();

      return {
        message: "Coupon used successfully",
        isCouponUsed: true,
        record,
      }
    }

    return {
      message: "Unable to make discount from this coupon, please use it again",
      isCouponUsed: false,
      record,
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const { couponName } = req.body;

  const coupon = await CouponModel.findOne({
    couponName: couponName.toLowerCase().trim(),
    isDeleted: false,
  });

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  if (!coupon.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This coupon is currently inactive");
  }

  const now = new Date();
  if (now < coupon.startAt || now > coupon.expiresAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is not valid at this time");
  }

  if (coupon.quantity <= coupon.usedCount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This coupon has reached its limit");
  }

  // Validate The Coupon For The User
  const record = await CouponRecordModel.findOne({
    couponId: coupon._id,
    userId: user.id,
    isUsed: false,
    isDeleted: false,
  }).populate("couponId");

  if (!record) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon record not found");
  }

  if (record.isUsed) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is already used");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon is valid",
    data: coupon,
  });
});

const getSingleCouponRecord = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const { id } = req.params;

  const result = await CouponRecordModel.findOne({
    _id: id,
    userId: user.id,
    isDeleted: false,
  }).populate("couponId");

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon record not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon record retrieved successfully",
    data: result,
  });
});

export const CouponsRecordController = {
  takeCoupon,
  getMyCoupons,
  toggleUseCoupon,
  getSingleCouponRecord,
  validateCoupon
};
