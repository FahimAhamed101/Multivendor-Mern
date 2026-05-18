import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import { Orders } from "../../orders/orders.model";
import { CustomOrders } from "../../orders/customOrders.model";
import { Showroom } from "../../showroom/showroom.model";
import ApiError from "../../../errors/ApiError";
import mongoose from "mongoose";

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: {
        role: "vendor",
        isDeleted: false,
        isRequest: "approve",
      },
    },
    {
      $lookup: {
        from: "showrooms",
        localField: "_id",
        foreignField: "owner",
        as: "showroomInfo",
      },
    },
    {
      $lookup: {
        from: "orders",
        let: { showroomIds: "$showroomInfo._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$showroom", "$$showroomIds"] },
                  { $eq: ["$orderStatus", "Delivered"] },
                ],
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$price.amount" } } },
        ],
        as: "ordersRevenue",
      },
    },
    {
      $lookup: {
        from: "customorders",
        let: { showroomIds: "$showroomInfo._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$showroomId", "$$showroomIds"] },
                  { $eq: ["$orderStatus", "Delivered"] },
                ],
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$price.amount" } } },
        ],
        as: "customOrdersRevenue",
      },
    },
    {
      $addFields: {
        earning: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ["$ordersRevenue.total", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$customOrdersRevenue.total", 0] }, 0] },
          ],
        },
      },
    },
    {
      $project: {
        vendor_id: "$_id",
        name: 1,
        email: 1,
        phone: 1,
        join_date: "$createdAt",
        location: "$address",
        earning: 1,
        topVendor: 1,
        blockStatus: 1,
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
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendors retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getVendorDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const vendor = await UserModel.findOne({ _id: id, role: "vendor" }).select("-password -__v");

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  const showroom = await Showroom.findOne({ owner: vendor._id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor details retrieved successfully",
    data: {
      ...vendor.toObject(),
      showroom,
    },
  });
});

const toggleTopVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { topVendor } = req.body;

  const vendor = await UserModel.findOne({ _id: id, role: "vendor" }).select("-password -__v");

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  if (topVendor) {
    vendor.topVendor = true;
  } else {
    vendor.topVendor = false;
  }

  await vendor.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Vendor ${vendor.topVendor ? "marked as top" : "removed from top"} successfully`,
    data: vendor,
  });
});

const toggleBlockVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { block } = req.body;

  const vendor = await UserModel.findOne({ _id: id, role: "vendor" }).select("-password -__v");

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Vendor not found");
  }

  if (block) {
    vendor.blockStatus = true;
  } else {
    vendor.blockStatus = false;
  }

  await vendor.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Vendor ${vendor.blockStatus ? "blocked" : "unblocked"} successfully`,
    data: vendor,
  });
});

export const AdminVendorController = {
  getAllVendors,
  getVendorDetails,
  toggleTopVendor,
  toggleBlockVendor,
};
