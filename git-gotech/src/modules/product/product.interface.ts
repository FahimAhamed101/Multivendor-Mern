import { Document, Types } from "mongoose";

export type TCategorie = {
  name: string;
  image: string;
  isDeleted: boolean;
} & Document;

export type TSave = {
  product: Types.ObjectId;
  customer: Types.ObjectId;
  isDeleted: boolean;
  saveType: "cart" | "wishlist";
} & Document;

export type TProduct = {
  vendor: Types.ObjectId;
  showroom: Types.ObjectId;
  product_name: string;
  product_category: string;
  product_description: string;
  product_price: number;
  customizeProduct: {
    status: boolean,
    customOrderId: Types.ObjectId
  },
  product_stocks: {
    size: string;
    stock: number;
  }[];
  sale_count: number;
  isPrivate: boolean;
  privateReason: string;
  review_count: number;
  review_rating: number;
  product_weight: {
    unit: string;
    amount: number;
  };
  product_images: Array<string>;
  discount: {
    isValid: boolean;
    percentage: number;
    startDate: Date;
    endDate: Date;
  };
  isMixable: boolean;
  isCustom: boolean;
  isDeleted: boolean;
} & Document;
