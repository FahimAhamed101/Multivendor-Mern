import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import ApiError from "../../../errors/ApiError";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: { isDeleted: false },
    },
    {
      $project: {
        UserId: "$_id",
        name: 1,
        email: 1,
        phone: 1,
        location: "$address",
        joinDate: "$createdAt",
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
    .fields()
    .dateRange()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const toggleBlockUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { block } = req.body; // Expecting { block: true | false }

  const user = await UserModel.findById(id).select("-password -__v");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // If "block" is provided in the body, use it specifically.
  // Otherwise, if the same API is used for toggle without specific status, we can toggle it.
  // But the user said: "if send unblock then block status false"
  
  if(block){
    user.blockStatus = true;
  }else{
    user.blockStatus = false;
  }

  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${user.blockStatus ? "blocked" : "unblocked"} successfully`,
    data: user,
  });
});

const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserModel.findById(id).select("-password -__v");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User details retrieved successfully",
    data: user,
  });
});

export const AdminUserController = {
  getAllUsers,
  toggleBlockUser,
  getUserDetails,
};
