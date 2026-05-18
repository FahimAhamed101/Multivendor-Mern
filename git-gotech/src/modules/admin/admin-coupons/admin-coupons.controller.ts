import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { CouponModel } from "./admin-coupons.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";
import { CouponRecordModel } from "./coupons-record/coupons-record.model";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const { couponName, startAt, expiresAt, percentage, quantity } = req.body;

  const existingCoupon = await CouponModel.findOne({ couponName });
  if (existingCoupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "A coupon with this name already exists");
  }

  // Ensure dates are valid if necessary, otherwise Mongoose will handle the type
  if (new Date(startAt) >= new Date(expiresAt)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Expiry date must be after start date");
  }

  const result = await CouponModel.create({
    couponName: couponName.toLowerCase().trim(),
    startAt,
    expiresAt,
    isActive: true,
    percentage: Number(percentage),
    quantity: Number(quantity),
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  let basePipeline: any[] = [];

  // Check if user is customer
  if (req.user?.role === 'customer') {
    // Get taken coupons for this customer
    const takenRecords = await CouponRecordModel.find({ userId: req.user.id }).select('couponId _id');
    const takenCouponIds = takenRecords.map(record => record.couponId);

    basePipeline = [
      {
        $match: {
          $and: [
            { isDeleted: false },
            { _id: { $nin: takenCouponIds } }
          ]
        }
      }
    ];
  } else {
    // Default pipeline for admin/other roles
    basePipeline = [
      {
        $match: {
          $or: [
            { isDeleted: false },
          ]
        },
      },
    ];
  }

  const queryBuilder = new AggregateQueryBuilder(
    CouponModel,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["couponName", "percentage"])
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
    message: "Coupons retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getSingleCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CouponModel.findById(id);

  if (!result || result.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon details retrieved successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CouponModel.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;

  const coupon = await CouponModel.findById(id);
  if (!coupon || coupon.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  if (body.couponName.toLowerCase().trim() && body.couponName.toLowerCase().trim() !== coupon.couponName.toLowerCase().trim()) {
    const existingCoupon = await CouponModel.findOne({ couponName: body.couponName.toLowerCase().trim() });
    if (existingCoupon) {
      throw new ApiError(httpStatus.BAD_REQUEST, "A coupon with this name already exists");
    }
  }

  const updatedStartAt = body.startAt ? new Date(body.startAt) : coupon.startAt;
  const updatedExpiresAt = body.expiresAt ? new Date(body.expiresAt) : coupon.expiresAt;

  if (updatedStartAt >= updatedExpiresAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Expiry date must be after start date");
  }

  const updatedCoupon = await CouponModel.findByIdAndUpdate(
    id,
    {
      ...body,
      couponName: body.couponName.toLowerCase(),
      startAt: updatedStartAt,
      expiresAt: updatedExpiresAt,
    },
    { new: true }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon updated successfully",
    data: updatedCoupon,
  });
});

export const AdminCouponController = {
  createCoupon,
  getAllCoupons,
  getSingleCoupon,
  deleteCoupon,
  updateCoupon,
};