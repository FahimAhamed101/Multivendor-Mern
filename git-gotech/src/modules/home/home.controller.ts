import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { Categorie, Product } from "../product/product.model";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserModel } from "../user/user.model";
import { FindQueryBuilder } from "../../utils/FindQueryBuilder";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";
import { Showroom } from "../showroom/showroom.model";
import paginationBuilder from "../../utils/paginationBuilder";

class controller {
  getCategoryData = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await Categorie.find({ isDeleted: false });
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category data fetched successfully",
        data: result,
      });
    },
  );

  getTopVendors = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const queryBuilder2 = new AggregateQueryBuilder(
        UserModel,
        [
          {
            $match: {
              role: "vendor",
              topVendor: true,
              isVerified: true,
              isRequest: "approve",
            },
          },
          {
            $project: {
              password: 0,
            },
          },
        ],
        req.query as Record<string, string>,
      );
      const result = queryBuilder2
        .search(["name", "username", "email", "address"])
        .filter()
        .sort()
        .paginate()
        .fields();

      const [data, meta] = await Promise.all([
        result.build(),
        result.getMeta(),
      ]);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Top vendors fetched successfully",
        data: {
          meta,
          data,
        },
      });
    },
  );

  getHotDealsProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.query.sort = req.query.sort || "-discount.percentage";

      const currentDate = new Date();
      const baseQuery = Product.find({
        "discount.isValid": true,
        "discount.startDate": { $lte: currentDate },
        "discount.endDate": { $gte: currentDate },
        "discount.percentage": { $ne: null, $gt: 0 },
        isDeleted: false,
        isPrivate: false,
        product_stocks: { $elemMatch: { stock: { $gt: 0 } } },
      });

      console.log(req.query);

      const queryBuilder = new FindQueryBuilder(
        baseQuery,
        req.query as Record<string, string>,
      );

      const result = await queryBuilder
        .filter()
        .search(["product_name", "product_description"])
        .sort()
        .fields()
        .buildWithMeta();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Hot deals products fetched successfully",
        data: result,
      });
    },
  );

  getTopProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.query.sort =
        req.query.sort || "-review_rating -review_count -sale_count";

      const baseQuery = Product.find({
        isDeleted: false,
        isPrivate: false,
        product_stocks: { $elemMatch: { stock: { $gt: 0 } } },
      });

      const queryBuilder = new FindQueryBuilder(
        baseQuery,
        req.query as Record<string, string>,
      );

      const result = queryBuilder
        .search(["product_name", "product_category"])
        .filter()
        .sort()
        .paginate()
        .fields();

      const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta(),
      ]);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Top products fetched successfully",
        data: {
          meta,
          data,
        },
      });
    },
  );

  getTopSavingsProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.query.sort = req.query.sort || "-discount.percentage";

      const currentDate = new Date();
      const baseQuery = Product.find({
        "discount.isValid": true,
        "discount.startDate": { $lte: currentDate },
        "discount.endDate": { $gte: currentDate },
        "discount.percentage": { $ne: null, $gt: 0 },
        isDeleted: false,
        isPrivate: false,
        product_stocks: { $elemMatch: { stock: { $gt: 0 } } },
      });

      // Limit This Results
      req.query.limit = req.query.limit || "10";

      const queryBuilder = new FindQueryBuilder(
        baseQuery,
        req.query as Record<string, string>,
      );

      const result = await queryBuilder
        .filter()
        .search(["product_name", "product_description"])
        .sort()
        .fields()
        .buildWithMeta();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Top savings products fetched successfully",
        data: result,
      });
    },
  );

  getNewestProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.query.sort = req.query.sort || "-createdAt";

      const baseQuery = Product.find({
        isDeleted: false,
        isPrivate: false,
        product_stocks: { $elemMatch: { stock: { $gt: 0 } } },
      });

      const queryBuilder = new FindQueryBuilder(
        baseQuery,
        req.query as Record<string, string>,
      )
        .search(["product_name", "product_category"])
        .filter()
        .sort()
        .paginate()
        .fields();

      const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta(),
      ]);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Newest products fetched successfully",
        data: {
          meta,
          data,
        },
      });
    },
  );

  getProductsByCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const category = req.params.category;

      const baseQuery = Product.find({
        product_category: { $regex: new RegExp(`^${category}$`, "i") },
        isDeleted: false,
        isPrivate: false,
        product_stocks: { $elemMatch: { stock: { $gt: 0 } } },
      });

      const queryBuilder = new FindQueryBuilder(
        baseQuery,
        req.query as Record<string, string>,
      )
        .search(["product_name"])
        .filter()
        .sort()
        .paginate()
        .fields();

      const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta(),
      ]);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category products fetched successfully",
        data: {
          meta,
          data,
        },
      });
    },
  );
  globalSearch = catchAsync(async (req: Request, res: Response) => {
    const q = (req.query.q as string)?.trim();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    if (!q) {
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Search results fetched successfully",
        data: {
          meta: paginationBuilder({ totalData: 0, currentPage: page, limit }),
          result: [],
        },
      });
    }

    const regex = new RegExp(q, "i");

    const productFilter = {
      isDeleted: false,
      isPrivate: false,
      $or: [
        { product_name: regex },
        { product_description: regex },
        { product_category: regex },
      ],
    };

    const vendorFilter = {
      role: "vendor",
      isDeleted: false,
      isRequest: "approve",
      name: regex,
    };

    const showroomFilter = {
      isDeleted: false,
      $or: [
        { showroom_name: regex },
        { showroom_category: regex },
        { showroom_address: regex },
      ],
    };

    const [
      productTotal,
      vendorTotal,
      showroomTotal,
    ] = await Promise.all([
      Product.countDocuments(productFilter),
      UserModel.countDocuments(vendorFilter),
      Showroom.countDocuments(showroomFilter),
    ]);

    const totalData = productTotal + vendorTotal + showroomTotal;

    // Distribute skip/limit across the three collections in order: products → vendors → showrooms
    let remaining = limit;
    let toSkip = skip;

    const productSkip = Math.min(toSkip, productTotal);
    const productLimit = Math.min(remaining, Math.max(0, productTotal - productSkip));
    toSkip = Math.max(0, toSkip - productTotal);
    remaining -= productLimit;

    const vendorSkip = Math.min(toSkip, vendorTotal);
    const vendorLimit = Math.min(remaining, Math.max(0, vendorTotal - vendorSkip));
    toSkip = Math.max(0, toSkip - vendorTotal);
    remaining -= vendorLimit;

    const showroomSkip = Math.min(toSkip, showroomTotal);
    const showroomLimit = Math.min(remaining, Math.max(0, showroomTotal - showroomSkip));

    const [products, vendors, showrooms] = await Promise.all([
      productLimit > 0
        ? Product.find(productFilter)
            .select("_id product_name product_category product_images")
            .skip(productSkip).limit(productLimit).lean()
        : Promise.resolve([]),

      vendorLimit > 0
        ? UserModel.find(vendorFilter)
            .select("_id name image")
            .skip(vendorSkip).limit(vendorLimit).lean()
        : Promise.resolve([]),

      showroomLimit > 0
        ? Showroom.find(showroomFilter)
            .select("_id showroom_name showroom_category logo")
            .skip(showroomSkip).limit(showroomLimit).lean()
        : Promise.resolve([]),
    ]);

    const result = [
      ...products.map((data) => ({ type: "product", data })),
      ...vendors.map((data) => ({ type: "vendor", data })),
      ...showrooms.map((data) => ({ type: "showroom", data })),
    ];

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Search results fetched successfully",
      data: {
        meta: paginationBuilder({ totalData, currentPage: page, limit }),
        result,
      },
    });
  });
}

export const HomeController = new controller();
