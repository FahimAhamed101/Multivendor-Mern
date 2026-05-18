import { Types } from "mongoose";

export enum ECurrency {
  USD = "usd",
  BDT = "bdt",
}

export enum EStatus {
  PENDING = "Pending",
  DRIVER_ACCEPTED = "Driver Accepted",
  PICKED_UP = "Picked Up",
  DELIVERED = "Delivered",
  REJECTED = "Rejected",
}

export type TTrackingInfo = {
  status: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IDeliveryRequest {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  images: string[];
  category: string;
  numberOfItems: number;
  rejectedReason: string;
  driver: Types.ObjectId;
  type: string;
  trackingNumber: string;
  weight: {
    unit: "kg" | "mg" | "gram" | "pound" | "ounce";
    value: number;
  };
  price: {
    currency: ECurrency;
    tip: number;
    deliveryFee: number;
  }
  pickupLocation: {
    name: string;
    phone: string;
    coordinates: [number, number]; // [longitude, latitude]
    location: string;
    email: string;
    country: string;
    state: string;
    zipCode: string;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    coordinates: [number, number]; // [longitude, latitude]
    location: string;
    email: string;
    country: string;
    state: string;
    zipCode: string;
  };
  tracking: TTrackingInfo[];
  status: EStatus;
  createdAt: Date;
  updatedAt: Date;
}
