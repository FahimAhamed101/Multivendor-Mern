import { Types } from "mongoose";
import { Product } from "../product/product.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getShowroomByProductId = async (id: Types.ObjectId) => {
  const get: any = await Product.findById(id)
    .select("showroom")
    .populate({
      path: "showroom",
      select:
        "location showroom_address showroom_name preference isApprove owner",
      populate: {
        path: "owner",
        select: "name email phone",
      },
    })
    .populate("product_stocks product_price")
    .lean();
  if (!get) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid product");
  }
  if (!get.showroom.isApprove) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can't buy any product from this showroom",
    );
  }
  if (!get.showroom.isApprove) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can't buy any product from this showroom",
    );
  }
  if (!get.product_stocks) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Sorry! Product is out of stock",
    );
  }
  return get;
};

export const OrderService = {
  getShowroomByProductId,
};
