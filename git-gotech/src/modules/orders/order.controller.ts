import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import {
  customDeliveryCharge,
  deliveryCharge,
  priceCalculation,
  priceCalculationNew,
} from "../../utils/charge";
import ApiError from "../../errors/ApiError";
import { Product, SaveProduct } from "../product/product.model";
import { TAddress, TCustomOrders, TOrders, TReturnOrders } from "./orders.interface";
import { OrderService } from "./order.service";
import mongoose from "mongoose";
import { IUserPayload } from "../../middlewares/roleGuard";
import { Orders } from "./orders.model";
import { validateUserLockStatus } from "../../middlewares/lock";
import { CustomOrders } from "./customOrders.model";
import { ReturnOrders } from "./returnOrders.model";
import paginationBuilder from "../../utils/paginationBuilder";
import { ETransactionType } from "../transaction/transaction.interface";
import { transactionService } from "../transaction/transaction.service";
import { emitNotification } from "../../utils/socket";
import { UserModel } from "../user/user.model";
import { TProduct } from "../product/product.interface";
import { Showroom } from "../showroom/showroom.model";
import { getTrackingNumber } from "../../utils/getTrackingNumber";
import { AggregateQueryBuilder } from "../../utils/AggregateQueryBuilder";
import { FindQueryBuilder } from "../../utils/FindQueryBuilder";
import { DeliveryRequestModel } from "../delivery-request/delivery-request.model";
import { EStatus } from "../delivery-request/delivery-request.interface";
import { logger } from "../../logger/logger";
import { CouponRecordModel } from "../admin/admin-coupons/coupons-record/coupons-record.model";
import { CouponModel } from "../admin/admin-coupons/admin-coupons.model";
import { CouponsRecordController } from "../admin/admin-coupons/coupons-record/coupons-record.controller";
import { JwtPayload } from "jsonwebtoken";
import { ADMIN_EMAIL } from "../../config";

// Add Order
const addOrder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const session = await mongoose.startSession()

  try {
    session.startTransaction();

    const userStatus = await validateUserLockStatus(
      new mongoose.Types.ObjectId(user.id || "n/a"),
    );

    let pickUpAddress: TAddress = {
      name: "",
      address: "",
      country: "",
      state: "",
      zipcode: 0,
      email: "",
      phone: 0,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    };

    let deliveryAddress: TAddress = {
      name: "",
      address: "",
      country: "",
      state: "",
      zipcode: 0,
      email: "",
      phone: 0,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    };

    let productId =
      new mongoose.Types.ObjectId(req.body.product as string) || null;

    if (!productId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product id is required in request body",
      );
    }

    const product = await Product.findOne({ _id: productId, isDeleted: false }).populate("showroom").session(session);

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    const trackingNumber = getTrackingNumber();

    if (req.body.deliveryType === "delivery") {
      const showroomDetails =
        await OrderService.getShowroomByProductId(productId);
      //set pickup address
      pickUpAddress.address = showroomDetails.showroom.showroom_address;
      pickUpAddress.location = showroomDetails.showroom.location;
      pickUpAddress.name = showroomDetails.showroom.showroom_name;
      pickUpAddress.email = showroomDetails.showroom.owner.email;
      pickUpAddress.phone = showroomDetails.showroom.owner.phone;
      //set delivery address
      deliveryAddress = req.body.deliveryInfo;
    }

    if (req.body.deliveryType === "pick-up") {
      const showroomDetails =
        await OrderService.getShowroomByProductId(productId);
      pickUpAddress.address = showroomDetails.showroom.showroom_address;
      pickUpAddress.location = showroomDetails.showroom.location;
      pickUpAddress.name = showroomDetails.showroom.showroom_name;
      pickUpAddress.email = showroomDetails.showroom.owner.email;
      pickUpAddress.phone = showroomDetails.showroom.owner.phone;

      //set delivery address
      deliveryAddress = req.body.deliveryInfo;
    }

    if (req.body.orderType === "vendor") {
      if (!req.body.deliveryInfo) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "For vendor order delivery info is required",
        );
      }

      // rest of the code
    } else if (req.body.orderType === "event") {
      if (!req.body.deliveryInfo) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "For event order delivery info is required",
        );
      }
      // rest of the code
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Something is missing");
    }
    const charge = await deliveryCharge({
      from: {
        latitude: pickUpAddress.location.coordinates[1],
        longitude: pickUpAddress.location.coordinates[0],
      },
      to: {
        latitude: deliveryAddress.location.coordinates[1],
        longitude: deliveryAddress.location.coordinates[0],
      },
      size: req.body.size,
      productId: req.body.product,
    });

    const data: TOrders = {
      customer: new mongoose.Types.ObjectId(user.id || "n/a"),
      showroom: charge.others.showroom,
      ...req.body,
      trackingNumber,
      deliveryInfo: deliveryAddress,
      pickUpInfo: pickUpAddress,
      weight: {
        type: "kg",
        amount: charge.weight.weight,
      },
      price: {
        unit: req.body.price.unit,
        amount: req.body.price.amount,
        tip: req.body.price.tip,
        tax: req.body.price.tax,
        weightCharge: req.body.price.weightCharge,
        coupon: req.body.price.coupon,
        deliveryCharge: req.body.price.deliveryCharge,
      },
      tracking: [
        {
          status: "Order Placed",
          message: "Your order has been placed successfully.",
        },
      ],
    };

    console.log(data)

    let couponDiscount;
    if (req.body.price.coupon) {
      const coupon = await CouponModel.findOne({ couponName: req.body.price.coupon.toLowerCase() }).session(session);
      if (coupon) {
        const couponRecord = await CouponRecordModel.findOne({ userId: req.user?.id, couponId: coupon._id, isDeleted: false }).session(session);

        if (!couponRecord) {
          throw new ApiError(httpStatus.BAD_REQUEST, "You haven't taken this coupon");
        }

        if (couponRecord.isUsed) {
          throw new ApiError(httpStatus.BAD_REQUEST, "You have already used this coupon");
        }

        if (couponRecord) {
          couponDiscount = coupon.percentage;
        }
      }
    }

    const needTotal = req.body.price.amount + req.body.price.tip + req.body.price.deliveryCharge + req.body.price.tax + req.body.price.weightCharge;
    let finalTotal = needTotal;

    if (couponDiscount) {
      finalTotal = needTotal - (needTotal * couponDiscount / 100);
    }

    if (
      userStatus.balance < finalTotal
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Your account balance is low, Need ${finalTotal - userStatus.balance} more`);
    }

    const productInfo = await Product.findById(req.body.product);

    for (const item of req.body.size) {
      const stockItem = productInfo?.product_stocks?.find(
        (s: any) => s.size === item.type
      );

      if (!stockItem || stockItem.stock < item.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Not enough stock for size ${item.type}`);
      }
    }

    const result = await Orders.create(
      [{ ...data, orderStatus: "Order Placed" }], { session });

    if (result && couponDiscount) {
      // Mark as used coupon in coupon record
      await CouponsRecordController.toggleUseCoupon(req.user as JwtPayload, {
        isUsed: true,
        whereUsed: result?.[0]._id as string,
        couponName: req.body.price.coupon,
      })
    }

    // Create Transaction Record For Vendor
    transactionService.recordTransaction({
      user: (product.showroom as any)?.owner as mongoose.Types.ObjectId,
      amount: req.body.price.amount,
      type: ETransactionType.CREDIT,
      description: "Order payment",
      referenceId: result?.[0]._id as string,
    });

    // Cut the price from user wallet and record transaction
    await transactionService.recordTransaction({
      user: user.id,
      amount: finalTotal,
      type: ETransactionType.DEBIT,
      description: `Order payment for tracking #${(result[0] as any).trackingNumber}`,
      referenceId: (result[0] as any)._id.toString(),
    });


    const admin = await UserModel.findOne({ email: ADMIN_EMAIL }).session(session);

    if (!admin) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Admin not found");
    }

    // Add Tax To Admin Wallet
    await transactionService.recordTransaction({
      user: admin._id,
      amount: req.body.price.tax,
      type: ETransactionType.CREDIT,
      description: "Tax payment",
      referenceId: result?.[0]._id as string,
    });

    const updates = req.body.size.map((item: any) => ({
      updateOne: {
        filter: {
          _id: result?.[0].product,
          "product_stocks.size": item.type,
        },
        update: {
          $inc: {
            "product_stocks.$.stock": -item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(updates, { session });

    // Delete Saves
    await SaveProduct.updateMany({
      customer: new mongoose.Types.ObjectId(user.id),
      saveType: "cart",
      product: new mongoose.Types.ObjectId(req.body.product),
      isDeleted: false
    }, { $set: { isDeleted: true } }, { session });

    // Notification To Vendor & Admin
    emitNotification({
      userId: (product.showroom as any)?.owner,
      userMsgTittle: "New Order Placed 🌟",
      userMsg: `Order Placed Successfully for Tracking #${result?.[0].trackingNumber}`,
      adminMsgTittle: "New Order Placed 🌟",
      adminMsg: `Order Placed Successfully for Tracking #${result?.[0].trackingNumber} by ${user.email}`,
    })

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order Placed Successfully",
      data: result?.[0],
    });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// Add Return Order
const addReturn = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId as string;
  const userStatus = await validateUserLockStatus(
    new mongoose.Types.ObjectId(user.id || "n/a"),
  );

  console.log(req.body, req.files)

  const trackingNumber = Math.floor(100000 + Math.random() * 900000);

  const orderInfo = await Orders.findOne({
    _id: new mongoose.Types.ObjectId(orderId || "n/a"),
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    orderStatus: "Delivered",
  }).lean();

  if (!orderInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Not found any valid order for return",
    );
  }

  let deliveryCharge = req.body.price.deliveryCharge || 0;
  let tip = req.body.price.tip || 0;

  const data: TReturnOrders = {
    ...req.body,
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    product: orderInfo?.product,
    showroom: orderInfo?.showroom,
    order: new mongoose.Types.ObjectId(orderId || "n/a"),
    price: {
      unit: "usd",
      tip: tip,
      deliveryCharge: deliveryCharge,
      amount: orderInfo?.price?.amount,
    },
    trackingNumber: trackingNumber,
  };
  console.log(data);
  if (userStatus.balance < deliveryCharge + tip) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your account balance is low");
  }

  const result = await ReturnOrders.create({
    ...data,
    tracking: [
      {
        status: "Return Order Placed",
        message: "Return order placed successfully",
      },
    ],
  });

  const totalAmount = deliveryCharge + tip;

  // cut the price from user wallet and record transaction
  await transactionService.recordTransaction({
    user: user.id,
    amount: totalAmount,
    type: ETransactionType.DEBIT,
    description: `Return order payment, for tracking #${(result as any).trackingNumber}`,
    referenceId: (result as any)._id.toString(),
  });

  const adminUser = await UserModel.findOne({ role: "admin" })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return order placed successfully",
    data: result,
  });
});

// Add Custom Order
const addCustomOrder = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;

  const userStatus = await validateUserLockStatus(
    new mongoose.Types.ObjectId(user.id || "n/a"),
  );

  const trackingNumber = getTrackingNumber()

  const product = await Product.findById(req.body.productId);

  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found");
  }

  if (!product.isCustom) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product is not customizable!!");
  }

  const showroom = await Showroom.findById(product.showroom)
  const showroomOwner = await UserModel.findById(showroom?.owner)

  req.body.pickUpInfo = {
    name: showroom?.showroom_name,
    phone: showroomOwner?.phone,
    address: showroom?.showroom_address,
    location: showroom?.location,
    country: "xxxx",
    state: "xxxx",
    zipcode: 0,
    email: showroomOwner?.email,
  }

  const data: TCustomOrders = {
    ...req.body,

    showroomId: product.showroom,

    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
    referenceImages: (req.files as any)?.map((file: any) => ({
      url: file.filename,
    })) ?? [],

    orderStatus: "Order Placed",

    trackingNumber: trackingNumber,
  };

  const result = await CustomOrders.create({
    ...data,
    orderStatus: "Order Placed",
    tracking: [
      {
        status: "Order Placed",
        message: "Order placed successfully",
      },
    ],
  });

  // Send Notification To Vendor
  emitNotification({
    userId: showroomOwner?._id,
    userMsgTittle: "New Custom Order",
    userMsg: `New custom order #${trackingNumber} placed successfully by ${user.email}`,
    adminMsgTittle: "New Custom Order",
    adminMsg: `New custom order #${trackingNumber} placed successfully by ${user.email}`,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Custom order placed successfully",
    data: result,
  });
});

// Driver Part Get Delivery Request, Vendor, Custom, Return Order - Start 
const getDriverDeliveryRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
  const userLng = parseFloat(req.query.userLng as string) || null;
  const userLat = parseFloat(req.query.userLat as string) || null;
  const skip = (page - 1) * limit;
  const orderType = (req.query.orderType as string) || "new";

  let query: any = {
    driver:
      orderType === "assigned"
        ? new mongoose.Types.ObjectId(user.id || "n/a")
        : null,
  };

  if (orderType !== "assigned") {
    query.status = EStatus.PENDING;
  }

  if (distanceInKm && userLng && userLat && orderType !== "assigned") {
    const earthRadiusInKm = 6378.1;
    const radius = Number(distanceInKm) / earthRadiusInKm;

    query["deliveryAddress.coordinates"] = {
      $geoWithin: {
        $centerSphere: [[Number(userLng), Number(userLat)], radius],
      },
    };
  }

  if (distanceInKm && userLng && userLat) {
    const earthRadiusInKm = 6378.1;
    const radius = Number(distanceInKm) / earthRadiusInKm;

    query["pickupLocation.coordinates"] = {
      $geoWithin: {
        $centerSphere: [[Number(userLng), Number(userLat)], radius],
      },
    };
  }

  const requestInfo = await DeliveryRequestModel.find(query)
    .populate("user", "name email phone image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalData = await DeliveryRequestModel.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delivery request fetched successfully",
    data: requestInfo,
    pagination,
  });
});

const getDriverOrderVendor = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as "vendor" | "return" | "custom" | "delivery-request";

  if (type === "vendor") {
    const user = req.user as IUserPayload;
    await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
    const userLng = parseFloat(req.query.userLng as string) || null;
    const userLat = parseFloat(req.query.userLat as string) || null;
    const skip = (page - 1) * limit;
    const orderType = (req.query.orderType as string) || "new";

    let query: any = {
      driver:
        orderType === "assigned"
          ? new mongoose.Types.ObjectId(user.id || "n/a")
          : null,
    };

    if (orderType !== "assigned") {
      query.orderStatus = "Ready for Pickup";
      query.orderType = "vendor";
      query.deliveryType = "delivery";
    }

    if (distanceInKm && userLng && userLat && orderType !== "assigned") {
      const earthRadiusInKm = 6378.1;
      const radius = Number(distanceInKm) / earthRadiusInKm;

      query["deliveryInfo.location"] = {
        $geoWithin: {
          $centerSphere: [[Number(userLng), Number(userLat)], radius],
        },
      };
    }

    const orderInfo = await Orders.find(query)
      .populate({
        path: "product",
        populate: {
          path: "vendor",
          select: "preference",
        },
      })
      .populate({
        path: "customer",
        select: "preference",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalData = await Orders.countDocuments(query);
    const pagination = paginationBuilder({ totalData, currentPage: page, limit });

    const response = orderInfo.map((order: any) => {
      return {
        _id: order._id,
        deliveryAddress: {
          name: order.deliveryInfo.name,
          adress: order.deliveryInfo.address,
          location: order.deliveryInfo.location,
          state: order.deliveryInfo.state,
          zipcode: order.deliveryInfo.zipcode,
          contact: order.deliveryInfo[order.customer.preference || "email"],
        },
        pickUpAddress: {
          name: order.pickUpInfo.name,
          adress: order.pickUpInfo.address,
          location: order.pickUpInfo.location,
          state: order.pickUpInfo.state,
          zipcode: order.pickUpInfo.zipcode,
          contact: order.pickUpInfo[order.product.vendor.preference || "email"],
        },
        deliveryCharge: order.price.deliveryCharge,
        tip: order.price.tip || 0,
        unit: order.price.unit,
        status: order.orderStatus,
        drop: order.product.showroom,
        pick: order.customer?._id,
        createdAt: order.createdAt,
      };
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order get successfully",
      data: response,
      pagination,
    });
  }
  else if (type === "return") {
    const user = req.user as IUserPayload;
    await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
    const userLng = parseFloat(req.query.userLng as string) || null;
    const userLat = parseFloat(req.query.userLat as string) || null;
    const skip = (page - 1) * limit;
    const orderType = (req.query.orderType as string) || "new";

    let query: any = {
      driver:
        orderType === "assigned"
          ? new mongoose.Types.ObjectId(user.id || "n/a")
          : null,
    };

    if (orderType !== "assigned") {
      query.status = "Vendor Accepted";
    }

    if (distanceInKm && userLng && userLat && orderType !== "assigned") {
      const earthRadiusInKm = 6378.1;
      const radius = Number(distanceInKm) / earthRadiusInKm;
      query["deliveryInfo.location"] = {
        $geoWithin: {
          $centerSphere: [[Number(userLng), Number(userLat)], radius],
        },
      };
    }

    const orderInfo = await ReturnOrders.find(query)
      .populate({
        path: "product",
        populate: {
          path: "vendor",
          select: "preference",
        },
      })
      .populate({
        path: "customer",
        select: "preference",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalData = await ReturnOrders.countDocuments(query);
    const pagination = paginationBuilder({ totalData, currentPage: page, limit });

    const response = orderInfo.map((order: any) => {
      return {
        _id: order._id,
        deliveryAddress: {
          name: order.deliveryInfo.name,
          adress: order.deliveryInfo.address,
          location: order.deliveryInfo.location,
          state: order.deliveryInfo.state,
          zipcode: order.deliveryInfo.zipcode,
          contact: order.deliveryInfo[order.product.vendor.preference || "email"],
        },
        pickUpAddress: {
          name: order.pickUpInfo.name,
          adress: order.pickUpInfo.address,
          location: order.pickUpInfo.location,
          state: order.pickUpInfo.state,
          zipcode: order.pickUpInfo.zipcode,
          contact: order.pickUpInfo[order.customer.preference || "email"],
        },
        deliveryCharge: order.price.deliveryCharge,
        tip: order.price.tip || 0,
        unit: order.price.unit,
        status: order.orderStatus,
        drop: order.product.showroom,
        pick: order.customer?._id,
        trackingNumber: order.trackingNumber,
        orderStatus: order.status,
        createdAt: order.createdAt,
      };
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Return Order get successfully",
      data: response,
      pagination,
    });
  }
  else if (type === "custom") {
    const user = req.user as IUserPayload;
    await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
    const userLng = parseFloat(req.query.userLng as string) || null;
    const userLat = parseFloat(req.query.userLat as string) || null;
    const skip = (page - 1) * limit;
    const orderType = (req.query.orderType as string) || "new";

    let query: any = {
      driver:
        orderType === "assigned"
          ? new mongoose.Types.ObjectId(user.id || "n/a")
          : null,
    };
    if (orderType !== "assigned") {
      query.orderStatus = "Ready for Pickup";
    }

    if (distanceInKm && userLng && userLat && orderType !== "assigned") {
      const earthRadiusInKm = 6378.1;
      const radius = Number(distanceInKm) / earthRadiusInKm;

      query["deliveryInfo.location"] = {
        $geoWithin: {
          $centerSphere: [[Number(userLng), Number(userLat)], radius],
        },
      };
    }

    const orderInfo = await CustomOrders.find(query)
      .populate({
        path: "customer",
        select: "preference",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalData = await CustomOrders.countDocuments(query);
    const pagination = paginationBuilder({ totalData, currentPage: page, limit });
    const response = orderInfo.map((order: any) => {
      return {
        _id: order._id,
        deliveryAddress: {
          name: order.deliveryInfo.name,
          adress: order.deliveryInfo.address,
          location: order.deliveryInfo.location,
          state: order.deliveryInfo.state,
          zipcode: order.deliveryInfo.zipcode,
          contact: order.deliveryInfo.email
            ? order.deliveryInfo.email
            : order.deliveryInfo.phone,
        },
        pickUpAddress: {
          name: order.pickUpInfo.name,
          adress: order.pickUpInfo.address,
          location: order.pickUpInfo.location,
          state: order.pickUpInfo.state,
          zipcode: order.pickUpInfo.zipcode,
          contact: order.deliveryInfo.email
            ? order.deliveryInfo.email
            : order.deliveryInfo.phone,
        },
        deliveryCharge: order.price.deliveryCharge,
        tip: order.price.tip || 0,
        unit: order.price.unit,
        status: order.orderStatus,
        drop: null,
        pick: order.customer?._id,
        createdAt: order.createdAt,
      };
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Custom Order get successfully",
      data: response,
      pagination,
    });
  }
  else if (type === "delivery-request") {
    const user = req.user as IUserPayload;
    await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
    const userLng = parseFloat(req.query.userLng as string) || null;
    const userLat = parseFloat(req.query.userLat as string) || null;
    const skip = (page - 1) * limit;
    const orderType = (req.query.orderType as string) || "new";

    let query: any = {
      driver:
        orderType === "assigned"
          ? new mongoose.Types.ObjectId(user.id || "n/a")
          : null,
    };

    if (orderType !== "assigned") {
      query.status = EStatus.PENDING;
    }

    if (distanceInKm && userLng && userLat && orderType !== "assigned") {
      const earthRadiusInKm = 6378.1;
      const radius = Number(distanceInKm) / earthRadiusInKm;

      query["deliveryAddress.coordinates"] = {
        $geoWithin: {
          $centerSphere: [[Number(userLng), Number(userLat)], radius],
        },
      };
    }

    if (distanceInKm && userLng && userLat) {
      const earthRadiusInKm = 6378.1;
      const radius = Number(distanceInKm) / earthRadiusInKm;

      query["pickupLocation.coordinates"] = {
        $geoWithin: {
          $centerSphere: [[Number(userLng), Number(userLat)], radius],
        },
      };
    }

    const requestInfo = await DeliveryRequestModel.find(query)
      .populate("user", "name email phone image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalData = await DeliveryRequestModel.countDocuments(query);
    const pagination = paginationBuilder({ totalData, currentPage: page, limit });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Delivery request fetched successfully",
      data: requestInfo,
      pagination,
    });
  }

});

const getDriverOrderCustom = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
  const userLng = parseFloat(req.query.userLng as string) || null;
  const userLat = parseFloat(req.query.userLat as string) || null;
  const skip = (page - 1) * limit;
  const orderType = (req.query.orderType as string) || "new";

  let query: any = {
    driver:
      orderType === "assigned"
        ? new mongoose.Types.ObjectId(user.id || "n/a")
        : null,
  };
  if (orderType !== "assigned") {
    query.orderStatus = "Ready for Pickup";
  }

  if (distanceInKm && userLng && userLat && orderType !== "assigned") {
    const earthRadiusInKm = 6378.1;
    const radius = Number(distanceInKm) / earthRadiusInKm;

    query["deliveryInfo.location"] = {
      $geoWithin: {
        $centerSphere: [[Number(userLng), Number(userLat)], radius],
      },
    };
  }

  const orderInfo = await CustomOrders.find(query)
    .populate({
      path: "customer",
      select: "preference",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const totalData = await CustomOrders.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  const response = orderInfo.map((order: any) => {
    return {
      _id: order._id,
      deliveryAddress: {
        name: order.deliveryInfo.name,
        adress: order.deliveryInfo.address,
        location: order.deliveryInfo.location,
        state: order.deliveryInfo.state,
        zipcode: order.deliveryInfo.zipcode,
        contact: order.deliveryInfo.email
          ? order.deliveryInfo.email
          : order.deliveryInfo.phone,
      },
      pickUpAddress: {
        name: order.pickUpInfo.name,
        adress: order.pickUpInfo.address,
        location: order.pickUpInfo.location,
        state: order.pickUpInfo.state,
        zipcode: order.pickUpInfo.zipcode,
        contact: order.deliveryInfo.email
          ? order.deliveryInfo.email
          : order.deliveryInfo.phone,
      },
      deliveryCharge: order.price.deliveryCharge,
      tip: order.price.tip || 0,
      unit: order.price.unit,
      status: order.orderStatus,
      drop: null,
      pick: order.customer?._id,
      createdAt: order.createdAt,
    };
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order get successfully",
    data: response,
    pagination,
  });
});

const getDriverOrderReturn = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  await validateUserLockStatus(new mongoose.Types.ObjectId(user.id || "n/a"));

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const distanceInKm = parseInt(req.query.distanceInKm as string) || 10;
  const userLng = parseFloat(req.query.userLng as string) || null;
  const userLat = parseFloat(req.query.userLat as string) || null;
  const skip = (page - 1) * limit;
  const orderType = (req.query.orderType as string) || "new";

  let query: any = {
    driver:
      orderType === "assigned"
        ? new mongoose.Types.ObjectId(user.id || "n/a")
        : null,
  };

  if (orderType !== "assigned") {
    query.status = "Vendor Accepted";
  }

  if (distanceInKm && userLng && userLat && orderType !== "assigned") {
    const earthRadiusInKm = 6378.1;
    const radius = Number(distanceInKm) / earthRadiusInKm;
    query["deliveryInfo.location"] = {
      $geoWithin: {
        $centerSphere: [[Number(userLng), Number(userLat)], radius],
      },
    };
  }

  const orderInfo = await ReturnOrders.find(query)
    .populate({
      path: "product",
      populate: {
        path: "vendor",
        select: "preference",
      },
    })
    .populate({
      path: "customer",
      select: "preference",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalData = await ReturnOrders.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });

  const response = orderInfo.map((order: any) => {
    return {
      _id: order._id,
      deliveryAddress: {
        name: order.deliveryInfo.name,
        adress: order.deliveryInfo.address,
        location: order.deliveryInfo.location,
        state: order.deliveryInfo.state,
        zipcode: order.deliveryInfo.zipcode,
        contact: order.deliveryInfo[order.product.vendor.preference || "email"],
      },
      pickUpAddress: {
        name: order.pickUpInfo.name,
        adress: order.pickUpInfo.address,
        location: order.pickUpInfo.location,
        state: order.pickUpInfo.state,
        zipcode: order.pickUpInfo.zipcode,
        contact: order.pickUpInfo[order.customer.preference || "email"],
      },
      deliveryCharge: order.price.deliveryCharge,
      tip: order.price.tip || 0,
      unit: order.price.unit,
      status: order.orderStatus,
      drop: order.product.showroom,
      pick: order.customer?._id,
      trackingNumber: order.trackingNumber,
      orderStatus: order.status,
      createdAt: order.createdAt,
    };
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order get successfully",
    data: response,
    pagination,
  });
});
// Driver Part Get Vendor, Custom, Return Order - End


// Driver Action Start
const acceptByDriver = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderType = req.body.orderType || null;
  const orderId = req.params.orderId || null;
  let result = null;
  console.log(orderType)

  if (orderType === "request-delivery") {
    const deliveryRequest = await DeliveryRequestModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
      status: EStatus.PENDING,
    });

    if (!deliveryRequest) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Delivery request not found or already accepted by another driver`,
      );
    }

    // const totalCost = (deliveryRequest.price?.tip || 0) + (deliveryRequest.price?.deliveryFee || 0);

    // if (totalCost > 0) {
    //   await transactionService.recordTransaction({
    //     user: deliveryRequest.user.toString(),
    //     amount: totalCost,
    //     type: ETransactionType.DEBIT,
    //     description: `Payment for delivery request #${deliveryRequest._id}`,
    //     referenceId: deliveryRequest._id.toString(),
    //   });
    // }

    result = await DeliveryRequestModel.findByIdAndUpdate(
      orderId,
      {
        status: EStatus.DRIVER_ACCEPTED,
        driver: user.id,
        $push: {
          tracking: {
            status: "Driver Accepted",
            message: "A driver has accepted your order.",
          },
        },
      },
      { new: true, runValidators: true },
    ).populate("user", "name fcmToken");

    if (result) {
      const populatedRequest = result as any;
      if (populatedRequest.user) {
        emitNotification({
          userId: populatedRequest.user._id,
          userMsgTittle: "Good news! A driver has accepted your delivery request.",
          userMsg: "Good news! A driver has accepted your delivery request.",
          adminMsgTittle: "Delivery Request Accepted",
          adminMsg: "A driver has accepted a delivery request.",
        });
      }
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Delivery request accepted successfully",
      data: result,
    });
    return;
  }
  else if (orderType === "vendor") {
    result = await Orders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: null,
        orderStatus: "Ready for Pickup",
      },
      {
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        orderStatus: "Driver Accepted",
        $push: {
          tracking: {
            status: "Driver Accepted",
            message: "A driver has accepted your order.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your order has been accepted by a driver.",
        userMsg: "Your order has been accepted by a driver.",
        adminMsgTittle: "Your order has been accepted by a driver.",
        adminMsg: "Your order has been accepted by a driver.",
      })

      // Send Notification To Vendor
      const product = await Product.findById(result.product);
      emitNotification({
        userId: product?.vendor as mongoose.Types.ObjectId,
        userMsgTittle: "Your order has been accepted by a driver.",
        userMsg: "Your order has been accepted by a driver.",
        adminMsgTittle: "Your order has been accepted by a driver.",
        adminMsg: "Your order has been accepted by a driver.",
      })
    }
  }
  else if (orderType === "custom") {
    result = await CustomOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: null,
        orderStatus: "Ready for Pickup",
      },
      {
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        orderStatus: "Driver Accepted",
        $push: {
          tracking: {
            status: "Driver Accepted",
            message: "A driver has accepted your custom order.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Custom Order Accepted by Driver",
        userMsg: `Your custom order #${result?.trackingNumber} accepted by driver ${user.email}`,
        adminMsgTittle: "Custom Order Accepted by Driver",
        adminMsg: `Custom order #${result?.trackingNumber} accepted by driver ${user.email}`,
      })

      // Send Notification To Vendor
      const order = await CustomOrders.findById(orderId).populate("productId");
      emitNotification({
        userId: (order?.productId as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Custom Order Accepted by Driver",
        userMsg: `Your custom order #${order?.trackingNumber} accepted by driver ${user.email}`,
        adminMsgTittle: "Custom Order Accepted by Driver",
        adminMsg: `Custom order #${order?.trackingNumber} accepted by driver ${user.email}`,
      })
    }
  }

  else if (orderType === "return") {
    result = await ReturnOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: null,
        status: "Vendor Accepted",
      },
      {
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        status: "Driver Accepted",
        $push: {
          tracking: {
            status: "Return Order Accepted by Driver",
            message: "A driver has accepted your return order.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your return order has been accepted by a driver.",
        userMsg: "Your return order has been accepted by a driver.",
        adminMsgTittle: "Your return order has been accepted by a driver.",
        adminMsg: "Your return order has been accepted by a driver.",
      })

      // Send Notification To Vendor
      const order = await ReturnOrders.findById(orderId).populate("product");
      emitNotification({
        userId: (order?.product as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Your return order has been accepted by a driver.",
        userMsg: "Your return order has been accepted by a driver.",
        adminMsgTittle: "Your return order has been accepted by a driver.",
        adminMsg: "Your return order has been accepted by a driver.",
      })
    }
  }
  else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "orderType is required in request body",
    );
  }
  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is already picked or invalid. Please try another one.",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order accepted successfully",
    data: true,
  });
});

const pickUpByDriver = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderType = req.body.orderType || null;
  const orderId = req.params.orderId || null;
  let result = null;

  if (orderType === "request-delivery") {
    result = await DeliveryRequestModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        status: EStatus.DRIVER_ACCEPTED,
      },
      {
        status: EStatus.PICKED_UP,
        $push: {
          tracking: {
            status: "Picked Up",
            message: "Driver has picked up the delivery items.",
          },
        },
      },
      { new: true, runValidators: true },
    ).populate("user", "name fcmToken");

    if (!result) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Delivery request not found or not in accepted state",
      );
    }

    if (result.user) {
      emitNotification({
        userId: (result.user as any)._id,
        userMsgTittle: "Your items have been picked up by the driver.",
        userMsg: "Your items have been picked up and are on the way!",
        adminMsgTittle: "Delivery Picked Up",
        adminMsg: "Driver has picked up the delivery items.",
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Delivery request picked up successfully",
      data: result,
    });
    return;
  }
  else if (orderType === "vendor") {
    result = await Orders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        orderStatus: "Driver Accepted",
      },
      {
        orderStatus: "Picked Up",
        $push: {
          tracking: {
            status: "Picked Up",
            message: "Your order has been picked up by the driver.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your order has been picked up by a driver.",
        userMsg: "Your order has been picked up by a driver.",
        adminMsgTittle: "Your order has been picked up by a driver.",
        adminMsg: "Your order has been picked up by a driver.",
      })

      // Send Notification To Vendor
      const order = await Orders.findById(orderId).populate("product");
      emitNotification({
        userId: (order?.product as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Your order has been picked up by a driver.",
        userMsg: "Your order has been picked up by a driver.",
        adminMsgTittle: "Your order has been picked up by a driver.",
        adminMsg: "Your order has been picked up by a driver.",
      })
    }
  }
  else if (orderType === "custom") {
    result = await CustomOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        orderStatus: "Driver Accepted",
      },
      {
        orderStatus: "Picked Up",
        $push: {
          tracking: {
            status: "Picked Up",
            message: "Your custom order has been picked up by the driver.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Custom Order Picked Up",
        userMsg: `Your custom order #${result?.trackingNumber} picked up by driver ${user.email}`,
        adminMsgTittle: "Custom Order Picked Up",
        adminMsg: `Custom order #${result?.trackingNumber} picked up by driver ${user.email}`,
      })

      // Send Notification To Vendor
      const order = await CustomOrders.findById(orderId).populate("productId");
      emitNotification({
        userId: (order?.productId as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Custom Order Picked Up",
        userMsg: `Your custom order #${order?.trackingNumber} picked up by driver ${user.email}`,
        adminMsgTittle: "Custom Order Picked Up",
        adminMsg: `Custom order #${order?.trackingNumber} picked up by driver ${user.email}`,
      })
    }
  }
  else if (orderType === "return") {
    result = await ReturnOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        status: "Driver Accepted",
      },
      {
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        status: "Picked Up",
        $push: {
          tracking: {
            status: "Return Order Picked Up by Driver",
            message: "A driver has picked up your return order.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your return order has been picked up by a driver.",
        userMsg: "Your return order has been picked up by a driver.",
        adminMsgTittle: "Your return order has been picked up by a driver.",
        adminMsg: "Your return order has been picked up by a driver.",
      })

      // Send Notification To Vendor
      const order = await ReturnOrders.findById(orderId).populate("product");
      emitNotification({
        userId: (order?.product as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Your return order has been picked up by a driver.",
        userMsg: "Your return order has been picked up by a driver.",
        adminMsgTittle: "Your return order has been picked up by a driver.",
        adminMsg: "Your return order has been picked up by a driver.",
      })
    }
  }
  else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "orderType is required in request body",
    );
  }
  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is unauthorized or invalid.",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order pick-up successfully",
    data: true,
  });
});

const deliveredByDriver = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderType = req.body.orderType || null;
  const otp = req.body.otp || null;
  const orderId = req.params.orderId || null;
  let result = null;

  if (!otp) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Otp is required in request body",
    );
  }

  if (orderType === "request-delivery") {
    const deliveryRequest = await DeliveryRequestModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
      status: EStatus.PICKED_UP,
    }).populate("user", "name fcmToken");

    if (!deliveryRequest) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Delivery request not found or not in picked up state",
      );
    }

    if (deliveryRequest.trackingNumber !== otp) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid OTP",
      );
    }

    const deliveryFee = deliveryRequest.price?.deliveryFee || 0;
    const tip = deliveryRequest.price?.tip || 0;

    result = await DeliveryRequestModel.findByIdAndUpdate(
      orderId,
      {
        status: EStatus.DELIVERED,
        $push: {
          tracking: {
            status: "Delivered",
            message: "Driver has delivered the delivery items.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      const driverEarnings = deliveryFee + tip;

      if (driverEarnings > 0) {
        await transactionService.recordTransaction({
          user: user.id,
          amount: driverEarnings,
          type: ETransactionType.CREDIT,
          description: `Delivery earnings for request #${deliveryRequest._id}`,
          referenceId: deliveryRequest._id.toString(),
        });
      }

      if (deliveryRequest.user) {
        const populatedUser = deliveryRequest.user as any;
        emitNotification({
          userId: populatedUser._id,
          userMsgTittle: "Delivery Completed",
          userMsg: "Your delivery has been successfully completed! Thank you for using our service.",
          adminMsgTittle: "Delivery Completed",
          adminMsg: "Delivery request has been completed.",
        });
      }

      // Send Notification To Driver
      emitNotification({
        userId: user.id as any,
        userMsgTittle: `Delivery completed! You earned ${driverEarnings}`,
        userMsg: `You have earned ${driverEarnings} for completing this delivery.`,
        adminMsgTittle: "Driver Earned",
        adminMsg: `Driver earned ${driverEarnings} from delivery #${deliveryRequest._id}`,
      });
    }
  }
  else if (orderType === "vendor") {
    result = await Orders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        trackingNumber: otp,
      },
      {
        orderStatus: "Delivered",
        $push: {
          tracking: {
            status: "Delivered",
            message: "Your order has been delivered.",
          },
        },
      },
      { new: true, runValidators: true },
    );


    if (result) {
      // Increment sale count
      await Product.findByIdAndUpdate(result?.product, {
        $inc: { sale_count: 1 },
      });

      // Add Money To Driver Wallet
      // await UserModel.findByIdAndUpdate(result?.driver, {
      //   $inc: { balance: result?.price?.deliveryCharge },
      // });

      // Create Transaction Record For Driver
      transactionService.recordTransaction({
        user: result?.driver as mongoose.Types.ObjectId,
        amount: result?.price?.deliveryCharge as number,
        type: ETransactionType.CREDIT,
        description: "Order delivery charge",
        referenceId: result?._id as string,
      });

      // Send Notification To Driver
      const driver = await UserModel.findById(result.driver);
      emitNotification({
        userId: driver?._id,
        userMsgTittle: `Order delivery charge ₵${result?.price?.deliveryCharge} added`,
        userMsg: `Order delivery charge ₵${result?.price?.deliveryCharge} added to your wallet.`,
        adminMsgTittle: `Order delivery charge ₵${result?.price?.deliveryCharge} added for driver(${driver.email}) wallet.`,
        adminMsg: `Order delivery charge ₵${result?.price?.deliveryCharge} added for driver(${driver?.name}) wallet.`,
      })

      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your order has been delivered.",
        userMsg: "Your order has been delivered.",
        adminMsgTittle: "Your order has been delivered.",
        adminMsg: "Your order has been delivered.",
      })

      // Send Notification To Vendor
      const order = await Orders.findById(orderId).populate("product");
      emitNotification({
        userId: (order?.product as any)?.vendor,
        userMsgTittle: "Your order has been delivered.",
        userMsg: "Your order has been delivered.",
        adminMsgTittle: "Your order has been delivered.",
        adminMsg: "Your order has been delivered.",
      })
    }
  }
  else if (orderType === "custom") {
    result = await CustomOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        trackingNumber: otp,
      },
      {
        orderStatus: "Delivered",
        $push: {
          tracking: {
            status: "Delivered",
            message: "Your custom order has been delivered.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (result) {
      const totalAmount = result?.price?.deliveryCharge! + result?.price?.tip!;

      // await UserModel.findByIdAndUpdate(result?.driver, {
      //   $inc: { balance: totalAmount },
      // });

      // Create Transaction Record For Driver
      transactionService.recordTransaction({
        user: result?.driver as mongoose.Types.ObjectId,
        amount: totalAmount,
        type: ETransactionType.CREDIT,
        description: "Order delivery charge and tip",
        referenceId: result?._id as string,
      });

      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Custom Order Delivered",
        userMsg: `Your custom order #${result?.trackingNumber} has been delivered by driver ${user.email}`,
        adminMsgTittle: "Custom Order Delivered",
        adminMsg: `Custom order #${result?.trackingNumber} has been delivered by driver ${user.email}`,
      })

      // Send Notification To Vendor
      const order = await CustomOrders.findById(orderId).populate("productId");
      emitNotification({
        userId: (order?.productId as any)?.vendor,
        userMsgTittle: "Custom Order Delivered",
        userMsg: `Your custom order #${order?.trackingNumber} has been delivered by driver ${user.email}`,
        adminMsgTittle: "Custom Order Delivered",
        adminMsg: `Custom order #${order?.trackingNumber} has been delivered by driver ${user.email}`,
      })
    }
  }
  else if (orderType === "return") {
    result = await ReturnOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        driver: new mongoose.Types.ObjectId(user.id || "n/a"),
        trackingNumber: otp,
      },
      {
        status: "Returned",
        $push: {
          tracking: {
            status: "Return Order Returned",
            message: "Your return order has been returned.",
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This order is invalid or wrong otp. Please try with correct one.");
    }

    if (result) {
      const order = await ReturnOrders.findById(orderId).populate("product");

      // Cut vendor account balance
      // await UserModel.findByIdAndUpdate((order?.product as any)?.vendor, {
      //   $inc: { wallet: -result?.price?.amount! },
      // });

      // Create Transaction Record For Vendor
      transactionService.recordTransaction({
        user: (order?.product as any)?.vendor as unknown as mongoose.Types.ObjectId,
        amount: result?.price?.amount as number,
        type: ETransactionType.DEBIT,
        description: "Order return",
        referenceId: result?._id as string,
      });

      // Add Money To Customer Wallet
      // await UserModel.findByIdAndUpdate(result?.customer, {
      //   $inc: { wallet: result?.price?.amount! },
      // });

      // Create Transaction Record For Customer
      transactionService.recordTransaction({
        user: result?.customer as mongoose.Types.ObjectId,
        amount: result?.price?.amount as number,
        type: ETransactionType.CREDIT,
        description: "Order return",
        referenceId: result?._id as string,
      });

      // Add Money To Driver Wallet
      // await UserModel.findByIdAndUpdate(result?.driver, {
      //   $inc: { wallet: result?.price?.deliveryCharge! },
      // });

      // Create Transaction Record For Driver
      transactionService.recordTransaction({
        user: result?.driver as mongoose.Types.ObjectId,
        amount: result?.price?.deliveryCharge as number,
        type: ETransactionType.CREDIT,
        description: "Order delivery charge",
        referenceId: result?._id as string,
      });

      // Send Notification To Customer
      emitNotification({
        userId: result.customer,
        userMsgTittle: "Your return order has been delivered.",
        userMsg: "Your return order has been delivered.",
        adminMsgTittle: "Your return order has been delivered.",
        adminMsg: "Your return order has been delivered.",
      })

      // Send Notification To Vendor
      emitNotification({
        userId: (order?.product as any)?.vendor as unknown as mongoose.Types.ObjectId,
        userMsgTittle: "Your return order has been delivered.",
        userMsg: "Your return order has been delivered.",
        adminMsgTittle: "Your return order has been delivered.",
        adminMsg: "Your return order has been delivered.",
      })
    }
  }
  else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "orderType is required in request body",
    );
  }
  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is unauthorized or invalid.",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order delivered successfully",
    data: true,
  });
});
// Driver Action End


const getMainOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;

  let category: string[] | undefined;
  if (req.query.category) {
    if (Array.isArray(req.query.category)) {
      category = req.query.category as string[];
    } else {
      category = (req.query.category as string).split(",");
    }
  }


  let query: any = {
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
  };

  if (category) {
    const products = await Product.find({
      product_category: { $in: category },
    }).select("_id");
    const productIds = products.map((p) => p._id);
    query.product = { $in: productIds };
  }

  let result = await Orders.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "product",
      select: "product_name product_images product_category",
    })
    .populate({
      path: "showroom",
      select: "showroom_name logo",
    })
    .lean();
  const totalData = await Orders.countDocuments(query);
  const response = result.map((element: any) => {
    return {
      id: element._id,
      name: element.product.product_name,
      product_images: element.product.product_images,
      product_category: element.product.product_category,
      showroom_name: element.showroom.showroom_name,
      showroom_image: element.showroom.logo,
      size: element.size,
      status: element.orderStatus,
      price: element.price,
      createdAt: element.createdAt,
      trackingNumber: element.trackingNumber,
    };
  });
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get main orders",
    data: response,
    pagination,
  });
});

const getReturnOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;

  let category: string[] | undefined;
  if (req.query.category) {
    if (Array.isArray(req.query.category)) {
      category = req.query.category as string[];
    } else {
      category = (req.query.category as string).split(",");
    }
  }

  let query: any = {
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
  };

  if (category) {
    const products = await Product.find({
      product_category: { $in: category },
    }).select("_id");
    const productIds = products.map((p) => p._id);
    query.product = { $in: productIds };
  }

  let result = await ReturnOrders.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "product",
      select: "showroom product_name product_images product_category",
    })
    .populate({
      path: "showroom",
      select: "showroom_name logo",
    })
    .populate({
      path: "order",
      select: "size",
    })
    .lean();
  const totalData = await ReturnOrders.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get return orders",
    data: result,
    pagination,
  });
});

const getCustomOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user as IUserPayload;

  let query: any = {
    customer: new mongoose.Types.ObjectId(user.id || "n/a"),
  };

  let result = await CustomOrders.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("productId")
    .populate("showroomId")
    .lean();
  const totalData = await CustomOrders.countDocuments(query);

  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get custom orders",
    data: result,
    pagination,
  });
});

// Vendor All Order Get APIs Start
const getShowroomOrder = catchAsync(async (req: Request, res: Response) => {
  const showroom = req.get("showroom") as string;
  let query: any = {
    showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
  };

  let array: any = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          {
            $project: {
              name: 1,
              _id: 1,
              image: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
        pipeline: [
          {
            $project: {
              product_name: 1,
              product_images: 1,
              vendor: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(Orders, array, req.query as Record<string, string>)

  const result = await queryBuilder
    .filter()
    .search(["customer.name", "product.product_name"])
    .sort()
    .fields()
    .buildWithMeta()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get showroom orders",
    data: { result, showroom },
  });
});

const getShowroomReturn = catchAsync(async (req: Request, res: Response) => {
  const showroom = req.get("showroom") as string;
  let query: any = {
    showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
  };

  let array: any = [
    {
      $match: query,
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
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(ReturnOrders, array, req.query as Record<string, string>)

  const result = await queryBuilder
    .filter()
    .search(["trackingNumber", "customer.name", "product.product_name"])
    .sort()
    .fields()
    .buildWithMeta()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get showroom orders",
    data: result,
  });
});

const getShowroomCustomOrder = catchAsync(async (req: Request, res: Response) => {
  const showroomId = req.get("showroom") as string;

  let query: any = {
    showroomId: new mongoose.Types.ObjectId(showroomId || "n/a"),
  };

  let array: any = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              username: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
        pipeline: [
          {
            $project: {
              product_name: 1,
              product_images: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "showrooms",
        localField: "showroomId",
        foreignField: "_id",
        as: "showroom",
        pipeline: [
          {
            $project: {
              showroom_name: 1,
              logo: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$showroom",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const queryBuilder = new AggregateQueryBuilder(CustomOrders, array, req.query as Record<string, string>)

  const result = await queryBuilder
    .filter()
    .search(["_id", "trackingNumber", "customer.name", "product.product_name", "showroom.showroom_name"])
    .sort()
    .fields()
    .buildWithMeta()


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get custom orders",
    data: result,
  });
});
// Vendor All Order Get APIs End

// Vendor Order Details APIs Start
const vendorOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;

  const result = await Orders.findById(orderId)
    .populate("product", "product_name product_images")
    .populate("customer", "name username email phone")
    .select("size product customer price orderStatus quantity deliveryInfo pickUpInfo")
    .lean();

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid. Please try another one.",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order accepted successfully",
    data: result,
  });
});

const vendorReturnOrderDetails = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IUserPayload;
    const orderId = req.params.orderId || null;
    const result = await ReturnOrders.findOne({
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
    })
      .populate("product", "product_name product_images")
      .populate("showroom", "showroom_name")
      .select(
        "size product price status attachment quantity deliveryInfo pickUpInfo showroom clientReason vendorReason",
      )
      .lean();
    if (!result) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This order is invalid. Please try another one.",
      );
    }
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Return order details",
      data: result,
    });
  },
);

const customOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;

  const result = await CustomOrders.findById(orderId)
    .populate("productId", "product_name product_images")
    .populate("showroomId", "showroom_name logo")
    .select("size product customer price orderStatus quantity deliveryInfo pickUpInfo")
    .lean();

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid. Please try another one.",
    );
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order accepted successfully",
    data: result,
  });
});
// Vendor Order Details APIs End

// All Action Of Change Order Status Start
const vendorOrderAction = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;
  const orderStatus = req.body.orderStatus as string;
  const showroom = req.get("showroom") as string;
  const validStatus = ["Processing", "Ready for Pickup", "Rejected"];
  if (!validStatus.includes(orderStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your action is invalid");
  }
  let newStatus = orderStatus;

  const result = await Orders.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
      showroom: new mongoose.Types.ObjectId(showroom || "n/a"),
      orderStatus: {
        $nin: [
          "Pending",
          "Ready for Pickup",
          "Driver Accepted",
          "Picked Up",
          "Delivered",
          "Rejected",
        ],
      },
    },
    {
      orderStatus: newStatus,
      $push: {
        tracking: {
          status: newStatus,
          message: orderStatus === "Rejected" ? "Your order has been rejected by the vendor." : `Order status updated to ${newStatus}.`,
        },
      },
    },
    { new: true, runValidators: true },
  ).lean();

  if (!result) {
    const order = await Orders.findById(orderId).lean();
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This order is invalid or already action taken. Please try another one. Current Status: ${order?.orderStatus}`,
    );
  }

  if (result) {
    // Send Notification to Customer
    emitNotification({
      userId: result.customer,
      userMsgTittle: "Order Status Updated",
      userMsg: `Your order #${result.trackingNumber} status has been updated to ${newStatus}`,
      adminMsgTittle: "Order Status Updated",
      adminMsg: `Order #${result.trackingNumber} status has been updated to ${newStatus} by ${user.email}`,
    })
  }

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid or already action taken. Please try another one.",
    );
  }

  if (orderStatus === "Rejected") {
    const orderData = result as TOrders;
    const totalAmount =
      (orderData.price?.amount || 0) +
      (orderData.price?.tip || 0) +
      (orderData.price?.deliveryCharge || 0);

    // Product price added to customer wallet
    const customer = await UserModel.findById(orderData.customer);
    if (!customer) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Customer not found",
      );
    }
    // customer.wallet += totalAmount;
    await customer.save();

    if (totalAmount > 0) {
      await transactionService.recordTransaction({
        user: String(orderData.customer),
        amount: totalAmount,
        type: ETransactionType.CREDIT,
        description: `Refund for rejected order #${orderData.trackingNumber}`,
        referenceId: String(orderData._id),
      });

      // Send Notification
      emitNotification({
        userId: customer._id,
        adminMsgTittle: "Order Rejected",
        adminMsg: `Your order #${orderData.trackingNumber} has been rejected`,
        userMsgTittle: "Order Rejected",
        userMsg: `Your order #${orderData.trackingNumber} has been rejected`,
      })
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: orderStatus,
  });
});

const vendorReturnAction = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.query.order || null;
  const action = req.query.action as string;
  const showroom = req.get("showroom") as string;
  let reason = (req.body.reason as string) || null;
  let newStatus = "Pending";

  if (action === "accept") {
    newStatus = "Vendor Accepted";
    reason = null;
  }
  else if (action === "decline") {
    if (!reason?.trim()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Reason is required in request body",
      );
    }
    newStatus = "Vendor Rejected";
  }
  else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Sorry this is an invalid action",
    );
  }

  const result = await ReturnOrders.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(orderId as string || "n/a"),
      showroom: new mongoose.Types.ObjectId(showroom as string || "n/a"),
      status: "Pending",
    },
    {
      vendorReason: reason,
      status: newStatus,
      $push: {
        tracking: {
          status: newStatus,
          message: action === "accept" ? "Your return order has been accepted by the vendor." : `Your return order has been rejected by the vendor. Reason: ${reason}`,
        },
      },
    },
    { new: true, runValidators: true },
  ).lean();

  if (result) {
    // Send Notification To Customer
    emitNotification({
      userId: result.customer,
      userMsgTittle: "Return Order Status Updated",
      userMsg: `Your return order #${result.trackingNumber} status has been updated to ${newStatus}`,
      adminMsgTittle: "Return Order Status Updated",
      adminMsg: `Return order #${result.trackingNumber} status has been updated to ${newStatus} by ${user.email}`,
    })
  }

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid or already action taken. Please try another one.",
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return order updated successfully",
    data: action,
  });
});

const customDesignAction = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;
  const orderStatus = req.body.action as string;
  const showroom = req.get("showroom") as string;
  const validStatus = ["accepted", "declined"];

  if (!validStatus.includes(orderStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your action is invalid");
  }

  let updateData: any = {};

  const orderInfo = await CustomOrders.findById(orderId).lean();

  if (!orderInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
  }

  if (orderStatus === "accepted") {
    if (!req.body.price) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Price is required");
    }
    updateData.price = {
      unit: req.body.priceUnit,
      amount: req.body.price,
    };
    updateData.orderStatus = "Vendor Accepted";

    // Send Notification To Customer
    emitNotification({
      userId: orderInfo.customer,
      userMsgTittle: "Custom Design Order Accepted",
      userMsg: `Your custom design order #${orderInfo?.trackingNumber} Accepted By ${user.email}`,
      adminMsgTittle: "Custom Design Order Accepted",
      adminMsg: `Custom design order #${orderInfo?.trackingNumber} Accepted By ${user.email}`,
    })
  }

  else if (orderStatus === "declined") {
    if (!req.body.reason) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Reason is required");
    }
    updateData.vendorNote = req.body.reason;
    updateData.orderStatus = "Vendor Rejected";
    // Send Notification To Customer
    emitNotification({
      userId: orderInfo.customer,
      userMsgTittle: "Custom Design Order Rejected",
      userMsg: `Your custom design order #${orderInfo?.trackingNumber} Rejected By ${user.email}`,
      adminMsgTittle: "Custom Design Order Rejected",
      adminMsg: `Custom design order #${orderInfo?.trackingNumber} Rejected By ${user.email}`,
    })
  }

  const result = await CustomOrders.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
      showroomId: new mongoose.Types.ObjectId(showroom || "n/a"),
      orderStatus: "Order Placed",
    },
    {
      ...updateData,
      $push: {
        tracking: {
          $each: [
            {
              status: "Vendor Reviewed",
              message: orderStatus === "accepted" ? `Vendor accepted your custom order by ${user.email}` : `Vendor rejected your custom order by ${user.email}. Reason: ${req.body.reason}`
            },
            {
              status: `Custom Order ${updateData.orderStatus} by Vendor`,
              message: orderStatus === "accepted" ? `Your custom order has been accepted by ${user.email}. Price Single Product: ${req.body.price} ${req.body.priceUnit.toUpperCase()}` : `Your custom order has been rejected by ${user.email}. Reason: ${req.body.reason}`
            }
          ]
        }
      },
    },
    { new: true, runValidators: true },
  )
    .populate("productId")

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid or already action taken. Please try another one.",
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

// Custom Order Set Ready for Pickup where the custom order status is Customer Accepted
const vendorChangeCustomOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;

  let updateData: any = {};

  let orderInfo;

  if (req.body.orderStatus === "Processing") {
    orderInfo = await CustomOrders.findOne({ _id: new mongoose.Types.ObjectId(orderId || "n/a"), orderStatus: "Customer Accepted" }).lean();
  }

  if (req.body.orderStatus === "Ready for Pickup") {
    orderInfo = await CustomOrders.findOne({ _id: new mongoose.Types.ObjectId(orderId || "n/a"), orderStatus: "Processing" }).lean();
  }

  if (!orderInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
  }

  const showroomInfo = await Showroom.findOne({ _id: new mongoose.Types.ObjectId(orderInfo?.showroomId || "n/a") });

  if (!showroomInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  updateData.orderStatus = req.body.orderStatus;

  let result;

  if (req.body.orderStatus === "Processing") {
    result = await CustomOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        showroomId: showroomInfo._id,
        orderStatus: "Customer Accepted",
      },
      {
        ...updateData,
        $push: {
          tracking: {
            $each: [
              {
                status: "Ready for Pickup",
                message: `Custom Order Is Ready For Pickup`,
              }
            ]
          }
        },
      },
      { new: true, runValidators: true },
    )
  }

  else if (req.body.orderStatus === "Ready for Pickup") {
    result = await CustomOrders.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId || "n/a"),
        showroomId: showroomInfo._id,
        orderStatus: "Processing",
      },
      {
        ...updateData,
        $push: {
          tracking: {
            $each: [
              {
                status: "Ready for Pickup",
                message: `Custom Order Is Ready For Pickup`,
              }
            ]
          }
        },
      },
      { new: true, runValidators: true },
    )
  }

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid or already action taken. Please try another one.",
    );
  }

  // Send Notification To Customer
  emitNotification({
    userId: orderInfo.customer,
    userMsgTittle: "Custom Design Order Update",
    userMsg: `Your custom design order #${orderInfo?.trackingNumber} is ${updateData.orderStatus}`,
    adminMsgTittle: "Custom Design Order Update",
    adminMsg: `Custom design order #${orderInfo?.trackingNumber} is ${updateData.orderStatus}`,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

const acceptCustomOrderByCustomer = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const orderId = req.params.orderId || null;
  const orderStatus = req.body.action as string;
  const quantity = req.body.quantity as number || 1;
  const deliveryCharge = req.body.deliveryCharge as number || 0;
  const tips = req.body.tips as number || 0;
  const validStatus = ["accepted", "declined"];

  if (!validStatus.includes(orderStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your action is invalid");
  }

  let updateData: any = {};

  const orderInfo = await CustomOrders.findOne({ _id: new mongoose.Types.ObjectId(orderId || "n/a"), customer: new mongoose.Types.ObjectId(user.id || "n/a"), orderStatus: "Vendor Accepted" }).lean();


  if (!orderInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
  }

  const showroomInfo = await Showroom.findOne({ _id: new mongoose.Types.ObjectId(orderInfo?.showroomId || "n/a") });

  if (!showroomInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Showroom not found");
  }

  if (orderStatus === "accepted") {
    updateData.orderStatus = "Customer Accepted";

    // Send Notification To Vendor
    emitNotification({
      userId: showroomInfo.owner,
      userMsgTittle: "Custom Design Order Accepted",
      userMsg: `Your custom design order #${orderInfo?.trackingNumber} Accepted By ${user.email}`,
      adminMsgTittle: "Custom Design Order Accepted",
      adminMsg: `Custom design order #${orderInfo?.trackingNumber} Accepted By ${user.email}`,
    })
  }

  else if (orderStatus === "declined") {
    updateData.orderStatus = "Customer Rejected";
    // Send Notification To Vendor
    emitNotification({
      userId: showroomInfo.owner,
      userMsgTittle: "Custom Design Order Rejected",
      userMsg: `Your custom design order #${orderInfo?.trackingNumber} Rejected By ${user.email}`,
      adminMsgTittle: "Custom Design Order Rejected",
      adminMsg: `Custom design order #${orderInfo?.trackingNumber} Rejected By ${user.email}`,
    })
  }

  const result = await CustomOrders.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(orderId || "n/a"),
      showroomId: new mongoose.Types.ObjectId(orderInfo.showroomId || "n/a"),
      orderStatus: "Vendor Accepted",
    },
    {
      ...updateData,
      quantity,
      price: {
        unit: orderInfo.price?.unit,
        amount: orderInfo.price?.amount,
        tip: tips,
        deliveryCharge: deliveryCharge,
      },
      $push: {
        tracking: {
          $each: [
            {
              status: "Customer Reviewed",
              message: orderStatus === "accepted" ? "Customer accepted your custom order" : `Customer rejected your custom order. Reason: ${req.body.reason}`
            },
            {
              status: `Custom Order ${updateData.orderStatus} by Customer`,
              message: orderStatus === "accepted" ? `Your custom order has been accepted by Customer. Price Single Product: ${orderInfo.price?.amount} ${orderInfo.price?.unit}` : `Your custom order has been rejected by Customer. Reason: ${req.body.reason}`
            }
          ]
        }
      },
    },
    { new: true, runValidators: true },
  )
    .populate("productId")
    .populate("showroomId")

  if (!result) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order is invalid or already action taken. Please try another one.",
    );
  }

  if (orderStatus === "accepted") {
    if (!result.productId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not found in order");
    }

    // Cut The Amount From The User Balance & Added To The Vendor Balance
    const totalAmountUser = (result.price?.amount! * quantity) + result.price?.deliveryCharge! + result.price?.tip!;
    const totalAmountVendor = (result.price?.amount! * quantity);

    // Cut Amount From user Balance
    // Check User Balance
    const customer = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(user.id || "n/a") });
    if (!customer) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
    }
    if (customer.balance < totalAmountUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    // Cut Amount From user Balance
    // const updateCustomerBalance = await UserModel.findOneAndUpdate(
    //   { _id: new mongoose.Types.ObjectId(user.id || "n/a") },
    //   { $inc: { balance: -totalAmountUser } },
    //   { new: true, runValidators: true },
    // );

    // Create a Transaction
    await transactionService.recordTransaction({
      user: new mongoose.Types.ObjectId(user.id || "n/a"),
      amount: totalAmountUser,
      type: ETransactionType.DEBIT,
      referenceId: String(result._id),
      description: "Custom order payment",
    });

    // Added Amount To Vendor Balance
    // const updateVendorBalance = await UserModel.findOneAndUpdate(
    //   { _id: new mongoose.Types.ObjectId(showroomInfo?.owner || "n/a") },
    //   { $inc: { balance: totalAmountVendor } },
    //   { new: true, runValidators: true },
    // );

    // Create a Transaction
    await transactionService.recordTransaction({
      user: new mongoose.Types.ObjectId(showroomInfo?.owner || "n/a"),
      amount: totalAmountVendor,
      type: ETransactionType.CREDIT,
      referenceId: String(result._id),
      description: `Custom order payment by ${user.email} to ${showroomInfo?.showroom_name}`,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});
// All Action Of Change Order Status End

const getDriverOrderDetailsByType = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const { id } = req.params as { id: string };
  const { type } = req.query
  const driverId = user.id || "n/a";

  let query: any = {}

  let order: any;

  if (type === "vendor") {
    order = await Orders.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate(["customer", "showroom", "product"])
      .lean();

    if (!order) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
    }

    const showroomOwner = await UserModel.findById(order.showroom.owner);

    const formattedDetails = {
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.orderStatus,
        category: order.product.product_category,
        weight: order.weight,
        deliveryFee: order.price.deliveryCharge,
        tips: order.price.tip,
        contact: order.customer.phone
      },
      vendor: {
        _id: showroomOwner._id,
        name: showroomOwner.name,
        image: showroomOwner.image,
        phone: showroomOwner.phone,
        email: showroomOwner.email
      },
      customer: {
        _id: order.customer._id,
        name: order.customer.name,
        image: order.customer.image,
        phone: order.customer.phone,
        email: order.customer.email
      },
      pickupInfo: {
        ...order.pickUpInfo,
        coordinates: order.pickUpInfo.coordinates
      },
      deliveryInfo: {
        ...order.deliveryInfo,
        coordinates: order.deliveryInfo.coordinates
      },
    }

    order = formattedDetails
  } else if (type === "return") {
    order = await ReturnOrders.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate(["customer", "showroom", "product", "order"])
      .lean();

    if (!order) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
    }

    const showroomOwner = await UserModel.findById(order.showroom.owner);

    const formattedDetails = {
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        category: order.product.product_category,
        weight: order.order.weight,
        deliveryFee: order.price.deliveryCharge,
        tips: order.price.tip,
        contact: order.customer.phone
      },
      customer: {
        _id: order.customer._id,
        name: order.customer.name,
        image: order.customer.image,
        phone: order.customer.phone,
        email: order.customer.email
      },
      vendor: {
        _id: showroomOwner._id,
        name: showroomOwner.name,
        image: showroomOwner.image,
        phone: showroomOwner.phone,
        email: showroomOwner.email
      },
      pickupInfo: {
        ...order.pickUpInfo,
        coordinates: order.pickUpInfo.coordinates
      },
      deliveryInfo: {
        ...order.deliveryInfo,
        coordinates: order.deliveryInfo.coordinates
      },
    }

    order = formattedDetails
  } else if (type === "custom") {
    order = await CustomOrders.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate(["customer", "productId", "showroomId"])
      .lean();

    if (!order) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
    }

    const showroomOwner = await UserModel.findById(order.showroomId.owner);

    const formattedDetails = {
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.orderStatus,
        category: order.productId.product_category,
        weight: order.weight,
        deliveryFee: order.price.deliveryCharge,
        tips: order.price.tip,
        contact: order.customer.phone
      },
      customer: {
        _id: order.customer._id,
        name: order.customer.name,
        image: order.customer.image,
        phone: order.customer.phone,
        email: order.customer.email
      },
      vendor: {
        _id: showroomOwner._id,
        name: showroomOwner.name,
        image: showroomOwner.image,
        phone: showroomOwner.phone,
        email: showroomOwner.email
      },
      pickupInfo: {
        ...order.pickUpInfo,
        coordinates: order.pickUpInfo.coordinates
      },
      deliveryInfo: {
        ...order.deliveryInfo,
        coordinates: order.deliveryInfo.coordinates
      },
    }

    order = formattedDetails
  }
  else if (type == "delivery-request") {
    order = await DeliveryRequestModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate("user", "name image email phone")
      .lean()

    if (!order) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order not found");
    }

    const formattedDetails = {
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        category: order.category,
        weight: order.weight,
        deliveryFee: order.price.deliveryFee,
        tips: order.price.tip,
        contact: order.user.phone
      },
      customer: {
        _id: order.user._id,
        name: order.user.name,
        image: order.user.image,
        phone: order.user.phone,
        email: order.user.email
      },
      pickupInfo: {
        ...order.pickupLocation,
        coordinates: order.pickupLocation.coordinates
      },
      deliveryInfo: {
        ...order.deliveryAddress,
        coordinates: order.deliveryAddress.coordinates
      },
    }

    order = formattedDetails
  }
  else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order type");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details fetched successfully",
    data: order,
  });
});

export const OrderController = {
  addOrder,
  addReturn,
  addCustomOrder,
  getDriverDeliveryRequest,
  getDriverOrderVendor,
  getDriverOrderCustom,
  getDriverOrderReturn,
  acceptByDriver,
  deliveredByDriver,
  pickUpByDriver,
  getMainOrders,
  getShowroomCustomOrder,
  getReturnOrders,
  getCustomOrders,
  getShowroomOrder,
  vendorOrderDetails,
  getShowroomReturn,
  vendorReturnAction,
  vendorReturnOrderDetails,
  vendorOrderAction,
  customDesignAction,
  customOrderDetails,
  acceptCustomOrderByCustomer,
  vendorChangeCustomOrderStatus,
  getDriverOrderDetailsByType
};
