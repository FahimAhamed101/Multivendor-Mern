import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { UserModel } from "../user/user.model";
import mongoose from "mongoose";
import { IUserPayload } from "../../middlewares/roleGuard";
import paginationBuilder from "../../utils/paginationBuilder";
import { Showroom } from "../showroom/showroom.model";
import { Product } from "../product/product.model";
import ApiError from "../../errors/ApiError";
import { CDesign } from "./design.model";
import { Orders } from "../orders/orders.model";
import { CustomOrders } from "../orders/customOrders.model";

const getAllVendorForCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const filter = (req.query.filter as string) || "all";
    const searchQ = req.query.searchQ as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const user = req.user as IUserPayload;
    let query: any = {
      isDeleted: false,
      isVerified: true,
      role: "vendor",
      _id: { $ne: new mongoose.Types.ObjectId(user.id || "n/a") },
    };
    if (filter === "top") {
      query.topVendor = true;
    }
    if (searchQ?.trim()) {
      query.$or = [
        {
          name: { $regex: searchQ, $options: "i" },
        },
        {
          username: { $regex: searchQ, $options: "i" },
        },
      ];
    }
    const result = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .select("name image bio username");
    const totalData = await UserModel.countDocuments(query);
    const pagination = paginationBuilder({
      totalData,
      currentPage: page,
      limit,
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get vendors list",
      data: result,
      pagination,
    });
  },
);
const getVendorShowroom = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const vendorId = req.params.vendorId as string;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;
  let query: any = {
    isApprove: true,
    owner: new mongoose.Types.ObjectId(vendorId || "n/a"),
  };
  const result = await Showroom.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .select("showroom_name logo bio location");
  const totalData = await Showroom.countDocuments(query);
  const pagination = paginationBuilder({
    totalData,
    currentPage: page,
    limit,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get vendor showroom list",
    data: result,
    pagination,
  });
});

const getShowroomProducts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filterBy = req.query.filterBy as string;
  const category = req.query.category as string;
  const searchQ = req.query.searchQ as string;
  const showroomId = req.params.showroomId as string;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;
  let sortBy: any = { createdAt: -1 };
  let query: any = {
    isDeleted: false,
    showroom: new mongoose.Types.ObjectId(showroomId || "n/a"),
  };
  if (filterBy === "hotDeal") {
    sortBy = { "discount.percentage": -1 };
    query["discount.isValid"] = true;
    query["discount.percentage"] = { $gt: 0 };
    query["discount.exp"] = { $gte: new Date() };
  } else if (filterBy === "topRated") {
    sortBy = { review_rating: -1 };
  } else if (filterBy === "newArrival") {
  } else if (filterBy === "topProduct") {
    sortBy = { sale_count: -1 };
  }
  if (searchQ?.trim()) {
    query.$or = [
      {
        product_name: { $regex: searchQ, $options: "i" },
      },
      {
        product_category: { $regex: searchQ, $options: "i" },
      },
    ];
  }
  if (category?.trim()) {
    query.product_category = { $regex: category, $options: "i" };
  }

  let result = await Product.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("showroom", "showroom_name logo")
    .select(
      "showroom discount createdAt product_category review_rating review_count product_name product_price isMixable product_stocks",
    )
    .lean();
  const totalData = await Product.countDocuments(query);
  const response = result.map((element) => {
    return {
      ...element,
      product_stocks: element.product_stocks ? true : false,
      discount: element.discount.percentage,
    };
  });
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get showroom products",
    data: response,
    pagination,
  });
});

const addDesignRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const productId = req.params.productId as string;
  const product = await Product.findOne({
    isCustom: true,
    isDeleted: false,
    _id: new mongoose.Types.ObjectId(productId || "n/a"),
  });
  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This product is not eligible for custom design",
    );
  }
  const result = await CDesign.findOneAndUpdate(
    {
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      showroom: product.showroom,
      measurementType: req.body.measurementType,
    },
    {
      ...req.body,
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      showroom: product.showroom,
    },
    { new: true, runValidators: true, upsert: true },
  ).lean();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Custom design request send successfully",
    data: result,
  });
});
const vendorDashboardStacks = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IUserPayload;
    const showroom = req.get("showroom") as string;

    // Total Product
    const totalProduct = await Product.countDocuments({
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
    });

    // Pending Orders
    const pendingOrders = await Orders.countDocuments({
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      orderStatus: { $ne: "Delivered" },
    });

    // Completed Orders
    const completedOrders = await Orders.countDocuments({
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      orderStatus: "Delivered",
    });

    // Total Order Sales Amount
    const totalOrderSalesAmount = await Orders.aggregate([
      {
        $match: {
          showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: "_id",
          total: { $sum: "$price.amount" },
        },
      },

      {
        $project: {
          total: 1,
        },
      },
    ]);

    const totalCustomDesignSalesAmount = await CustomOrders.aggregate([
      {
        $match: {
          showroomId: new mongoose.Types.ObjectId(showroom || "n/a"),
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: "_id",
          total: { $sum: { $multiply: ["$price.amount", "$quantity"] } },
        },
      },

      {
        $project: {
          total: 1,
        },
      },
    ]);

    // Recent Added Products
    const recentProducts = await Product.find({
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    // Recent Orders
    const recentOrders = await Orders.find({
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Vendor dashboard stacks",
      data: {
        totalProduct: totalProduct ?? 0,
        pendingOrders: pendingOrders ?? 0,
        completedOrders: completedOrders ?? 0,
        totalSalesAmount: {
          total: totalOrderSalesAmount[0]?.total + totalCustomDesignSalesAmount[0]?.total ?? 0,
          description: "Total Delivered Main Order & Custom Order Sales Amount"
        },
        recentProducts: recentProducts ?? [],
        recentOrders: recentOrders ?? [],
      },
    });
  },
);
export const VendorController = {
  getAllVendorForCustomer,
  getVendorShowroom,
  getShowroomProducts,
  addDesignRequest,
  vendorDashboardStacks,
};
