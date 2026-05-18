import mongoose, { Schema, Types } from "mongoose";
import { IWithdrawRequest, WithdrawStatus } from "./withdraw.interface";

const withdrawSchema = new Schema<IWithdrawRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    amount: { type: Number, required: true, min: 1 },
    platformFee: { type: Number, required: true },

    bankName: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },

    bankCode: { type: String, trim: true },
    moreInfo: { type: String, trim: true },
    country: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: Object.values(WithdrawStatus),
      default: WithdrawStatus.PENDING,
      index: true,
    },

    adminNote: { type: String, trim: true },

    approvedBy: { type: Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    rejectedBy: { type: Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedReason: { type: String, trim: true },

    paidBy: { type: Types.ObjectId, ref: "User" },
    paidAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const WithdrawRequest = mongoose.model<IWithdrawRequest>(
  "WithdrawRequest",
  withdrawSchema
);
