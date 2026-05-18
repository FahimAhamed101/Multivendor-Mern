import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: {
        role: "driver",
        isDeleted: false,
        isRequest: "approve",
      },
    },
    {
      $project: {
        UserId: "$_id",
        name: 1,
        email: 1,
        phone: 1,
        joinDate: "$createdAt",
        location: "$address",
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
    .search(["email", "phone", "location"])
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Approved drivers retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const getDriverDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const driver = await UserModel.findOne({ _id: id, role: "driver" }).select("-password -__v");

  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Driver not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver details retrieved successfully",
    data: driver,
  });
});

const toggleBlockDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { block } = req.body; // Expecting { block: true | false }

  const driver = await UserModel.findOne({ _id: id, role: "driver" }).select("-password -__v");

  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (block) {
    driver.blockStatus = true;
  } else {
    driver.blockStatus = false;
  }

  await driver.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Driver ${driver.blockStatus ? "blocked" : "unblocked"} successfully`,
    data: driver,
  });
});

export const AdminDriverController = {
  getAllDrivers,
  getDriverDetails,
  toggleBlockDriver,
};
