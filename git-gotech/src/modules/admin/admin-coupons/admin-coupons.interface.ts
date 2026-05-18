import { Document } from "mongoose";

export type ICoupon = {
  couponName: string;

  percentage: number;

  quantity: number;

  usedCount: number;

  startAt: Date;

  expiresAt: Date;

  minAmount?: number;

  maxAmount?: number;

  isActive: boolean;

  isDeleted: boolean;
} & Document;
