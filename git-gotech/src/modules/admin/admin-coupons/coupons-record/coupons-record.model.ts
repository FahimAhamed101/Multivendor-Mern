import { Schema, model } from "mongoose";
import { ICouponRecord } from "./coupons-record.interface";

const CouponRecordSchema = new Schema<ICouponRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    whereUsed: {
      type: Schema.Types.Mixed,
      default: null,
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

// Optional: index for performance on frequent queries
CouponRecordSchema.index({ userId: 1, couponId: 1 });

export const CouponRecordModel = model<ICouponRecord>("CouponRecord", CouponRecordSchema);
