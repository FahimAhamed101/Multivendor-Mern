import { Schema, model } from "mongoose";
import { ICoupon } from "./admin-coupons.interface";

const CouponSchema = new Schema<ICoupon>(
  {
    couponName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    minAmount: {
      type: Number,
      default: null,
    },
    maxAmount: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CouponModel = model<ICoupon>("Coupon", CouponSchema);
