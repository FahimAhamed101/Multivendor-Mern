// paymentCard.model.ts
import mongoose, { Schema, Types } from "mongoose";
import { IPaymentCard } from "./payment-card.interface";

const paymentCardSchema = new Schema<IPaymentCard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      required: true,
    },

    bankCode: {
      type: String,
      trim: true,
    },

    moreInfo: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Prevent duplicate cards per user (same account)
paymentCardSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export const PaymentCard = mongoose.model<IPaymentCard>(
  "PaymentCard",
  paymentCardSchema,
);
