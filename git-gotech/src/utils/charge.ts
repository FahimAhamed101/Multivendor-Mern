import getDistance from "geolib/es/getDistance";
import { Types } from "mongoose";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { Product } from "../modules/product/product.model";
import { calculateWeightPrice } from "./unitConverter";

type TCalParams = {
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  size: Array<{
    type?: "S" | "M" | "L" | "XL";
    quantity: number;
  }>;
  productId: Types.ObjectId;
};
type TCalCustomParams = {
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  quantity: number;
  weight: {
    unit: "kg";
    amount: number;
  };
};
const PRICE_PER_KM = parseInt(process.env.KMToUsd as string) || 0;

export const deliveryCharge = async ({
  from,
  to,
  size,
  productId,
}: TCalParams) => {
  const kgPrice = parseInt(process.env.KGToUsd as string) || 0;
  const kmPrice = parseInt(process.env.KMToUsd as string) || 0;
  const distance = getDistance(from, to);
  let totalQuantity = 0;
  size.forEach((element) => {
    totalQuantity = totalQuantity + element.quantity;
  });

  if (!totalQuantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity is required");
  }

  const product: any = await Product.findById(productId)
    .select(
      "product_price product_stocks showroom product_weight discount product_price",
    )
    .lean();

  if (product.product_stocks < totalQuantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity is too high");
  }
  
  const weight = product?.product_weight?.amount * totalQuantity || 0;
  const km = distance / 1000;
  return {
    distance: { totalPrice: km * kmPrice, km: km },
    weight: { totalPrice: weight * kgPrice, weight },
    totalQuantity,
    others: {
      showroom: product?.showroom,
      discount: product?.discount,
      product_price: product?.product_price,
    },
  };
};
export const customDeliveryCharge = async ({
  from,
  to,
  quantity,
  weight,
}: TCalCustomParams) => {
  const distance = getDistance(from, to);

  if (!quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity is required");
  }
  const calculateWeight = calculateWeightPrice(weight.amount, weight?.unit);
  const km = distance / 1000;
  const calculateDistance = {
    distanceInKM: distance / 1000,
    totalPrice: km * PRICE_PER_KM,
  };
  return { calculateDistance, calculateWeight };
};

export const priceCalculation = async ({
  productId,
  coupon,
  quantity,
}: {
  productId: Types.ObjectId;
  coupon?: string;
  quantity: number;
}) => {
  let price = 0;
  const product = await Product.findById(productId)
    .select("discount product_price")
    .lean();
  if (
    product &&
    product.discount.isValid &&
    product.discount.endDate > new Date()
  ) {
    const product_price = product.product_price || 0;
    price = product_price * quantity * (1 - product.discount.percentage / 100);
    return price;
  }
  return price;
};

export const priceCalculationNew = async ({
  product,
  coupon,
  quantity,
}: {
  product: {
    discount: {
      isValid: boolean;
      endDate: Date;
      percentage: number;
    };
    product_price: number;
  };
  coupon?: string;
  quantity: number;
}) => {
  let price = 0;
  if (
    product &&
    product.discount.isValid &&
    product.discount.endDate > new Date()
  ) {
    const product_price = product.product_price || 0;
    price = product_price * quantity * (1 - product.discount.percentage / 100);
    return price;
  }
  return price;
};
