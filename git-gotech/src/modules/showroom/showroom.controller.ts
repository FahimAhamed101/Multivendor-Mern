import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Showroom } from "./showroom.model";
import { IUserPayload } from "../../middlewares/roleGuard";
import mongoose from "mongoose";
import ApiError from "../../errors/ApiError";
import { Product } from "../product/product.model";
import { FindQueryBuilder } from "../../utils/FindQueryBuilder";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";
import { TShowroom } from "./showroom.interface";
import { UserModel } from "../user/user.model";
import { Orders } from "../orders/orders.model";

const getAllShowrooms = catchAsync(async (req: Request, res: Response) => {
  const result = await Showroom.find({
    isDeleted: false,
    isApprove: true,
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  const modified = result?.map((showr: TShowroom) => {
    return {
      _id: showr?._id,
      logo: showr?.logo,
      showroom_name: showr?.showroom_name,
      isApprove: showr?.isApprove,
      createdAt: showr?.createdAt,
      showroom_address: showr?.showroom_address,
      location: showr?.location,
    };
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get my all showrooms",
    data: modified,
  });
});

const addShowroom = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const files = req.files as any;

  const nidImage = files?.nidImage?.[0]?.filename
  const ownerImage = files?.ownerImage?.[0]?.filename
  const logo = files?.logo?.[0]?.filename

  if (!nidImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "NID image is required");
  }
  if (!ownerImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Owner image is required");
  }
  if (!logo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Logo is required");
  }

  if (req.body?.showroom_category) {
    req.body.showroom_category = JSON.parse(req.body.showroom_category);
  }
  if (req.body?.location) {
    req.body.location = JSON.parse(req.body.location);
  }
  if (req.body?.showroom_schedule) {
    req.body.showroom_schedule = JSON.parse(req.body.showroom_schedule);
  }

  const result = await Showroom.findOneAndUpdate(
    {
      owner: new mongoose.Types.ObjectId(user.id || "n/a"),
      showroom_name: req.body.showroom_name,
    },
    { ...req.body, nidImage, ownerImage, logo },
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom profile added",
    data: result,
  });
});

const updateShowroom = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.params.id;
  const user = req.user as IUserPayload;
  const files = req.files as any;

  if (files?.nidImage?.[0]?.filename) {
    req.body.nidImage = files?.nidImage?.[0]?.filename
  }

  if (files?.ownerImage?.[0]?.filename) {
    req.body.ownerImage = files?.ownerImage?.[0]?.filename
  }

  if (files?.logo?.[0]?.filename) {
    req.body.logo = files?.logo?.[0]?.filename
  }

  if (req.body?.showroom_category) {
    req.body.showroom_category = JSON.parse(req.body.showroom_category);
  }
  if (req.body?.location) {
    req.body.location = JSON.parse(req.body.location);
  }
  if (req.body?.showroom_schedule) {
    req.body.showroom_schedule = JSON.parse(req.body.showroom_schedule);
  }

  const result = await Showroom.findOneAndUpdate(
    {
      owner: new mongoose.Types.ObjectId(user.id || "n/a"),
      _id: new mongoose.Types.ObjectId(showroomId || "n/a"),
      isDeleted: false,
    },
    { ...req.body },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom profile updated",
    data: result,
  });
});

const getMyShowrooms = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const result = await Showroom.find({
    owner: new mongoose.Types.ObjectId(user.id || "n/a"),
    isDeleted: false,
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  const modifyed = result?.map((showr) => {
    return {
      _id: showr?._id,
      logo: showr?.logo,
      showroom_name: showr?.showroom_name,
      isApprove: showr?.isApprove,
      createdAt: showr?.createdAt,
      showroom_address: showr?.showroom_address,
      location: showr?.location,
    };
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get my all showrooms",
    data: modifyed,
  });
});

const showroomDetails = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.params.id;
  const user = req.user as IUserPayload;
  const result = await Showroom.findOne({
    owner: new mongoose.Types.ObjectId(user.id || "n/a"),
    _id: new mongoose.Types.ObjectId(showroomId || "n/a"),
    isDeleted: false,
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom profile details",
    data: result,
  });
});

const getVendorShowrooms = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Vendor ID is required");
  }

  const vendorProfile = await UserModel.findById(vendorId);

  if (!vendorProfile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Vendor not found");
  }

  const result = await Showroom.find({
    owner: new mongoose.Types.ObjectId(vendorId || "n/a"),
    isDeleted: false,
    isApprove: true,
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  const showrooms = result?.map((showr: any) => {
    return {
      _id: showr?._id,
      logo: showr?.logo,
      showroom_name: showr?.showroom_name,
      isApprove: showr?.isApprove,
      createdAt: showr?.createdAt,
      showroom_address: showr?.showroom_address,
    };
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get vendor showrooms",
    data: {
      showrooms,
      vendorProfile,
    },
  });
});

const getShowroomsProducts = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.params.showroomId;
  const queryBuilder = new FindQueryBuilder(Product.find({
    showroom: new mongoose.Types.ObjectId(showroomId || "n/a"),
    isDeleted: false,
    isPrivate: false,
  }), req.query as Record<string, string>)

  const result = await queryBuilder
    .filter()
    .search(["product_name", "product_description", "product_category"])
    .sort()
    .paginate()
    .fields()
    .buildWithMeta();

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom products",
    data: result,
  });
});

const deleteShowroom = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.params.id;
  const user = req.user as IUserPayload;
  const result = await Showroom.findOneAndUpdate(
    {
      owner: new mongoose.Types.ObjectId(user.id || "n/a"),
      _id: new mongoose.Types.ObjectId(showroomId || "n/a"),
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Showroom profile deleted",
    data: result,
  });
});

const getMostSellingProduct = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.headers["showroom"] as string;
  const user = req.user as IUserPayload;
  req.query.limit = "10";

  if (!showroomId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom ID is required in headers");
  }

  const showroom = await Showroom.findOne({
    _id: new mongoose.Types.ObjectId(showroomId),
    owner: new mongoose.Types.ObjectId(user.id || "n/a"),
    isDeleted: false,
  });

  if (!showroom) {
    throw new ApiError(httpStatus.NOT_FOUND, "Showroom not found or not authorized");
  }

  const basePipeline = [
    {
      $match: {
        showroom: new mongoose.Types.ObjectId(showroomId),
        isPrivate: false,
        isDeleted: false,
        sale_count: { $gte: 1 },
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(Product, basePipeline, req.query)
    .filter()
    .search(["product_name", "product_category"])
    .sort("-sale_count")
    .paginate();

  const result = await queryBuilder.buildWithMeta();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Most selling products retrieved successfully",
    data: result,
  });
});

export const ShowroomController = {
  addShowroom,
  updateShowroom,
  getMyShowrooms,
  showroomDetails,
  deleteShowroom,
  getVendorShowrooms,
  getShowroomsProducts,
  getAllShowrooms,
  getMostSellingProduct
};
