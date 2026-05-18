import { Document, Types } from "mongoose";

export interface ICouponRecord extends Document {
  userId: Types.ObjectId;
  couponId: Types.ObjectId;
  isUsed: boolean;
  usedAt: Date | null;
  whereUsed: any | null;
  isDeleted: boolean;
}
