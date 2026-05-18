import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { IUserPayload } from "../../middlewares/roleGuard";
import { Orders } from "../orders/orders.model";
import mongoose from "mongoose";
import ApiError from "../../errors/ApiError";
import { Reviews } from "./review.model";
import { Product } from "../product/product.model";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";

const addReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId;

  const order = await Orders.findOne({
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    _id: new mongoose.Types.ObjectId(orderId || "n/a"),
    orderStatus: "Delivered",
  });

  if (!order) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found or not delivered");
  }

  if (!order.customer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not authorized to give review on this order");
  }

  if (!order.driver) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Driver not found on this order");
  }

  try {
    const result = await Reviews.create({
      ...req.body,
      ["driver.id"]: order.driver,
      ["product.id"]: order.product,
      customer: user.id,
    });

    const productRating = await Reviews.aggregate([
      { $match: { "product.id": new mongoose.Types.ObjectId(order.product) } },
      {
        $group: {
          _id: "$product.id",
          averageRating: { $avg: "$product.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    await Product.findByIdAndUpdate(order.product, {
      review_count: productRating[0].totalReviews || 0,
      review_rating: productRating[0].averageRating || 0,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review added successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This review already exists");
    }
  }
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const basePipeline = [
    {
      $match: {
        "product.id": new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $project: {
        "customer.password": 0,
        "customer.__v": 0,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(Reviews, basePipeline, req.query)
    .filter()
    .sort("-createdAt")
    .paginate();

  const result = await queryBuilder.buildWithMeta();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product reviews retrieved successfully",
    data: result,
  });
});

const getDriverReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const basePipeline = [
    {
      $match: {
        "driver.id": new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $project: {
        "customer.password": 0,
        "customer.__v": 0,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(Reviews, basePipeline, req.query)
    .filter()
    .sort("-createdAt")
    .paginate();

  const result = await queryBuilder.buildWithMeta();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver reviews retrieved successfully",
    data: result,
  });
});

const getDriverSelfReviews = catchAsync(async (req: Request, res: Response) => {
  const userPayload = req.user;

  const driverId = userPayload?.id

  console.log(driverId)

  if (!driverId || !mongoose.Types.ObjectId.isValid(driverId as string)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid driver ID");
  }

  const basePipeline = [
    {
      $match: {
        "driver.id": new mongoose.Types.ObjectId(driverId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
    },
    {
      $project: {
        "customer.password": 0,
        "customer.__v": 0,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(Reviews, basePipeline, req.query)
    .filter()
    .sort("-createdAt")
    .paginate();

  const result = await queryBuilder.buildWithMeta();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver self reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = {
  addReview,
  getProductReviews,
  getDriverReviews,
  getDriverSelfReviews,
};
