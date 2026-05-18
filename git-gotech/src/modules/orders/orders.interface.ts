import { Document, Types } from "mongoose";
import { WeightUnit } from "../../utils/unitConverter";
export type TAddress = {
  name: string;
  address: string;
  country: string;
  state: string;
  zipcode: number;
  email: string;
  phone: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
};
export type TOrders = {
  customer: Types.ObjectId;
  driver?: Types.ObjectId;
  showroom?: Types.ObjectId;
  product: Types.ObjectId;
  size: Array<{
    type?: "S" | "M" | "L" | "XL";
    quantity: number;
  }>;
  weight: {
    unit?: WeightUnit;
    amount: number;
  };
  orderType: "vendor" | "custom";
  deliveryType: "delivery" | "pick-up";
  orderStatus:
  | "Pending"
  | "Order Placed"
  | "Processing"
  | "Ready for Pickup"
  | "Driver Accepted"
  | "Picked Up"
  | "Delivered"
  | "Rejected";
  trackingNumber: number;
  price?: {
    unit: "usd" | "bdt" | "rs";
    amount: number;
    tip?: number;
    tax?: number;
    weightCharge?: number;
    coupon?: string;
    deliveryCharge?: number;
  };
  tracking: TTrackingInfo[];
  deliveryInfo: TAddress;
  pickUpInfo: TAddress;
} & Document;

export type TTrackingInfo = {
  status: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TCustomOrders = {
  customer: Types.ObjectId;
  driver?: Types.ObjectId;
  productId: Types.ObjectId;
  showroomId: Types.ObjectId;
  measurementType: "top" | "trouser" | "shorts"
  measurements: {
    chest: number;
    shoulderWidth: number
    armLength: number
    length: number
    neck: number
    waist: number
    hips: number
    inseam: number
    outseam: number
    thigh: number
    calf: number
    ankle: number
    knee: number
    additionalNote: string
  }
  vendorNote: string
  customerNote: string
  referenceImages: Array<{
    url: string;
  }>;
  quantity: number;
  weight: {
    unit?: "kg";
    amount: number;
  };
  orderStatus:
  | "Order Placed"
  | "Vendor Accepted"
  | "Vendor Rejected"
  | "Customer Accepted"
  | "Customer Rejected"
  | "Paid"
  | "Driver Accepted"
  | "Picked Up"
  | "Delivered";
  trackingNumber: string;
  price?: {
    unit: "usd" | "bdt" | "rs";
    amount: number
    tip?: number;
    deliveryCharge?: number;
  };
  deliveryInfo: TAddress;
  pickUpInfo: TAddress;
  tracking: TTrackingInfo[];
  customizeProductId: Types.ObjectId;
} & Document;

export type TImageData = {
  url: string;
  public_id: string;
};

export type TReturnOrders = {
  customer: Types.ObjectId;
  driver?: Types.ObjectId;
  product: Types.ObjectId;
  order: Types.ObjectId;
  showroom?: Types.ObjectId;
  clientReason: string;
  vendorReason?: string;
  attachment: Array<string>;
  status:
  | "Pending"
  | "Vendor Accepted"
  | "Vendor Rejected"
  | "Driver Accepted"
  | "Picked Up"
  | "Delivered";
  trackingNumber: number;
  isUsed: boolean;
  price?: {
    unit: "usd" | "bdt" | "rs";
    tip?: number;
    amount: number;
    deliveryCharge?: number;
  };
  deliveryInfo: TAddress;
  pickUpInfo: TAddress;
  tracking: TTrackingInfo[];
} & Document;
