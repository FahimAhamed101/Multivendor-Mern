import mongoose from "mongoose";
import { IUserPayload } from "../../middlewares/roleGuard";
import { Categorie, Product, SaveProduct } from "./product.model";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import paginationBuilder from "../../utils/paginationBuilder";
import { Reviews } from "../reviews/review.model";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";

const addProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const showroom = req.get("showroom") as string;

  if (req.files as Express.Multer.File[] && Array.isArray(req.files as Express.Multer.File[])) {
    req.body.product_images = (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename);
  }

  const result = await Product.findOneAndUpdate(
    {
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
      product_name: req.body.product_name,
    },
    req.body,
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New product added",
    data: result,
  });
});

const editProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const productId = req.params.productId as string;
  const showroom = req.get("showroom") as string;
  const productInfo = await Product.findOne({
    _id: new mongoose.Types.ObjectId(productId || "n/a"),
    vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
    showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
    isDeleted: false,
  });

  if (!productInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }


  if (req.files as Express.Multer.File[] && Array.isArray(req.files as Express.Multer.File[])) {
    req.body.product_images = (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename);
    req.body.product_images = [...productInfo?.product_images, ...req.body.product_images];
  }

  const product = await Product.findOne({
    _id: new mongoose.Types.ObjectId(productId || "n/a"),
    vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
    showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
    isDeleted: false,
  });

  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }

  const result = await Product.findOneAndUpdate(
    {
      vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
      _id: new mongoose.Types.ObjectId(productId || "n/a"),
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      isDeleted: false,
    },
    req.body,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated now",
    data: result,
  });
});

const detailsProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const result = await Product.findOne({
    _id: new mongoose.Types.ObjectId(productId || "n/a"),
    isDeleted: false,
    isPrivate: false,
  }).select("-showroom -vendor -isDeleted");
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product details",
    data: result,
  });
});

const detailsCustomerProduct = catchAsync(
  async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const result = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId || "n/a"),
      isDeleted: false,
      isPrivate: false,
    }).populate("showroom", "showroom_name image location logo ownerImage").populate("vendor", "name image phone email");
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
    }
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product details",
      data: result,
    });
  },
);

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const productId = req.params.productId as string;
  const showroom = req.get("showroom") as string;
  const result = await Product.findOneAndUpdate(
    {
      vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
      _id: new mongoose.Types.ObjectId(productId || "n/a"),
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
    },
    {
      isDeleted: true,
    },
  );
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted",
    data: productId,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.get("showroom") as string;
  const user = req.user as IUserPayload;

  let query: any = {
    vendor: new mongoose.Types.ObjectId(user.id || "n/a"),
    showroom: new mongoose.Types.ObjectId(showroomId || "n/a"),
    isDeleted: false,
    isPrivate: false,
  };

  const pipeline = [
    {
      $match: query
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
      $unwind: "$showroom"
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
      $unwind: "$vendor"
    }
  ]

  const queryBuilder = new AggregateQueryBuilder(Product, pipeline, req.query as Record<string, string>)
    .filter()
    .search(['product_name', 'product_category'])
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta()
  ])

  const response = data.map((element) => {
    return {
      ...element,
      product_stocks: element.product_stocks ? true : false,
    };
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get Products",
    data: {
      meta,
      data: response
    },
  });
});

const getCustomerProducts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filterBy = req.query.filterBy as string;
  let category: string[] | undefined;
  if (req.query.category) {
    if (Array.isArray(req.query.category)) {
      category = req.query.category as string[];
    } else {
      category = (req.query.category as string).split(",");
    }
  }
  const showroom = req.query.showroom as string;
  const searchQ = req.query.searchQ as string;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;
  let sortBy: any = { createdAt: -1 };
  let query: any = {
    isDeleted: false,
    isPrivate: false,
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
      {
        showroom: { $eq: new mongoose.Types.ObjectId(searchQ || "n/a") },
      }
    ];
  }
  if (category) {
    query.product_category = { $in: category };
  }
  if (showroom?.trim()) {
    query.showroom = { $eq: new mongoose.Types.ObjectId(showroom || "n/a") };
  }

  let result = await Product.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("showroom", "showroom_name logo")
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
    message: "Get Products",
    data: response,
    pagination,
  });
});

const detailsCustomerProductReviews = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const productId = req.params.productId as string;
    let query = {
      "product.id": new mongoose.Types.ObjectId(productId || "n/a"),
    };
    const result = await Reviews.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("product customer createdAt")
      .populate("customer", "name username image")
      .lean();
    const totalData = await Reviews.countDocuments(query);
    const pagination = paginationBuilder({
      totalData,
      currentPage: page,
      limit,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product reviews",
      data: result,
      pagination,
    });
  },
);

const saveProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const types = ["cart", "wishlist"];
  const productId = req.body.product as string;
  const saveType = req.body.saveType as string;

  if (!types?.includes(saveType)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Valid saveType is required in request body",
    );
  }

  if (!productId?.trim()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product is required in request body",
    );
  }

  const product = await Product.findOne({
    _id: new mongoose.Types.ObjectId(productId || "n/a"),
    isDeleted: false,
    isPrivate: false,
  });

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This is an invalid product so use another product",
    );
  }

  const isExistProduct = await SaveProduct.findOne({
    product: new mongoose.Types.ObjectId(productId || "n/a"),
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    isDeleted: false,
  });

  if (isExistProduct) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This Product already saved so use another product",
    );
  }

  const result = await SaveProduct.findOneAndUpdate(
    {
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      isDeleted: false,
    },
    {
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      saveType: saveType,
    },
    { new: true, upsert: true, runValidators: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product save successfully",
    data: result,
  });
});

const saveProductGet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;
  const types = ["cart", "wishlist"];
  if (!types?.includes(req.query.saveType as string)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Valid saveType is required in request query",
    );
  }
  let query = {
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    saveType: req.query.saveType,
    isDeleted: false,
  };
  const result = await SaveProduct.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "product",
      populate: {
        path: "showroom",
        select: "showroom_name image location",
      },
    })
    .lean();
  const totalData = await SaveProduct.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Save product get successfully",
    data: result,
    pagination,
  });
});

const saveProductDelete = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const productId = req.params.productId as string;
  const result = await SaveProduct.findOneAndDelete(
    {
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    },
  );
  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid product trying to delete",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product delete successfully from save",
    data: true,
  });
});

const updateSaveProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const productId = req.params.productId as string;
  const saveType = req.body.saveType as string;
  const result = await SaveProduct.findOneAndUpdate(
    {
      product: new mongoose.Types.ObjectId(productId || "n/a"),
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    },
    {
      saveType: saveType,
    },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid product trying to update",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product update successfully from save",
    data: result,
  });
});

const addCategory = catchAsync(async (req: Request, res: Response) => {
  const name = req.body.name?.trim()?.toLowerCase() as string;
  const image = req.file?.filename as string;

  if (!image) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Image is required",
    );
  }

  if (!name) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Name is required",
    );
  }

  const isExistCategory = await Categorie.findOne({
    name,
    isDeleted: false,
  });

  if (isExistCategory) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Category already exists",
    );
  }

  const result = await Categorie.create(
    {
      name,
      image,
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New category added",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.categoryId as string;

  const isExistCategory = await Categorie.findOne({
    _id: new mongoose.Types.ObjectId(categoryId || "n/a"),
    isDeleted: false,
  });

  if (!isExistCategory) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid category trying to update",
    );
  }

  const image = req.file?.filename as string || isExistCategory.image;

  const result = await Categorie.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(categoryId || "n/a"),
      isDeleted: false,
    },
    {
      ...req.body,
      image: image || isExistCategory.image,
    },
    { new: true, runValidators: true },
  ).lean();

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid category trying to update",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category update successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = req.params.categoryId as string;

  const isExistCategory = await Categorie.findOne({
    _id: new mongoose.Types.ObjectId(categoryId || "n/a"),
    isDeleted: false,
  });

  if (!isExistCategory) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid category trying to delete",
    );
  }

  const result = await Categorie.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(categoryId || "n/a"),
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    { new: true, runValidators: true },
  ).lean();

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid category trying to delete",
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category delete successfully",
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  let query: any = {
    isDeleted: false,
  };

  const result = await Categorie.find(query).skip(skip).limit(limit).lean();
  const totalData = await Categorie.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get categories",
    data: result,
    pagination,
  });
});

export const ProductController = {
  addProduct,
  editProduct,
  detailsProduct,
  detailsCustomerProduct,
  getProducts,
  deleteProduct,
  getCustomerProducts,
  detailsCustomerProductReviews,
  saveProduct,
  saveProductGet,
  updateSaveProduct,
  saveProductDelete,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategories,
};
