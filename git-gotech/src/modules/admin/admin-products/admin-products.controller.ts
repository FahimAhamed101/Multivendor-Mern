import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { Product } from "../../product/product.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";
import mongoose from "mongoose";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: { isDeleted: false },
    },
    {
      $lookup: {
        from: "showrooms",
        localField: "showroom",
        foreignField: "_id",
        as: "showroom",
        pipeline: [
          {
            $project: {
              showroom_name: 1,
              logo: 1,
              location: 1,
              ownerImage: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$showroom",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
              image: 1,
              phone: 1,
              email: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$vendor",
        preserveNullAndEmptyArrays: true,
      },
    }
  ];

  const queryBuilder = new AggregateQueryBuilder(
    Product,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["product_name", "product_category"])
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getProductDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, isDeleted: false })
    .populate("showroom", "showroom_name logo location ownerImage")
    .populate("vendor", "name username image phone email");

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product details retrieved successfully",
    data: product,
  });
});

const togglePrivateStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPrivate, privateReason } = req.body;

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  if (isPrivate === true && !privateReason) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Private reason is required when marking a product as private.");
  }

  const result = await Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      isPrivate: !!isPrivate,
      privateReason: isPrivate ? privateReason : null,
    },
    { new: true, runValidators: true }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product marked as ${isPrivate ? "private" : "public"} successful`,
    data: result,
  });
});

export const AdminProductController = {
  getAllProducts,
  getProductDetails,
  togglePrivateStatus,
};
