import { Types } from "mongoose";

export enum WithdrawStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAID = "paid",
  FAILED = "failed",
}

export interface IWithdrawRequest {
  _id?: Types.ObjectId;

  userId: Types.ObjectId; // driver userId

  amount: number;
  platformFee: number;

  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  moreInfo?: string;
  country?: string;

  status: WithdrawStatus;

  adminNote?: string;

  approvedBy?: Types.ObjectId;
  approvedAt?: Date;

  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectedReason?: string;

  paidBy?: Types.ObjectId;
  paidAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
