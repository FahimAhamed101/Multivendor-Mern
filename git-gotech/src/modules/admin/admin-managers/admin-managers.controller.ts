import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../../user/user.model";
import { AggregateQueryBuilder } from "../../../utils/AggregateQueryBuilder";
import { hashPassword, sendManagerInvitationEmail } from "../../user/user.utils";
import Setting from "../../settings/settings.model";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../../errors/ApiError";


const getAllManagers = catchAsync(async (req: Request, res: Response) => {
  const basePipeline = [
    {
      $match: {
        role: "manager",
        isDeleted: false,
      },
    },
    {
      $project: {
        password: 0,
        __v: 0
      }
    }
  ];

  const queryBuilder = new AggregateQueryBuilder(
    UserModel,
    basePipeline,
    req.query as Record<string, string>
  )
    .filter()
    .search(["name", "email", "username"])
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
    message: "Approved managers retrieved successfully",
    data: {
      meta,
      data,
    },
  });
});

const addManager = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, referralCode } = req.body;

  const existingUser = await UserModel.findOne({ email }).select("-password -__v");
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const managerData = {
    name,
    email,
    password: hashedPassword,
    referralCode,
    role: "manager",
    isRequest: "approve",
    username: email,
  };

  const newManager = await UserModel.create(managerData);

  // Send invitation email
  await sendManagerInvitationEmail(name, email);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Manager created and invitation email sent successfully",
    data: newManager,
  });
});

const toggleBlockManager = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { block } = req.body; // Expecting { block: true | false }

  const manager = await UserModel.findOne({ _id: id, role: "manager" }).select("-password -__v");

  if (!manager) {
    throw new ApiError(httpStatus.NOT_FOUND, "Manager not found");
  }

  if (block) {
    manager.blockStatus = true;
  } else {
    manager.blockStatus = false;
  }

  await manager.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Manager ${block ? "blocked" : "unblocked"} successfully`,
    data: manager,
  });
});

const getSingleManager = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const manager = await UserModel.findOne({ _id: id, role: "manager" }).select("-password -__v");

  if (!manager) {
    throw new ApiError(httpStatus.NOT_FOUND, "Manager not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manager details retrieved successfully",
    data: manager,
  });
});

export const AdminManagerController = {
  getAllManagers,
  addManager,
  toggleBlockManager,
  getSingleManager,
};
