import mongoose, { Schema } from "mongoose";
import {
  ETransactionStatus,
  ETransactionType,
  ITransaction,
} from "./transaction.interface";

const TransactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(ETransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ETransactionStatus),
      default: ETransactionStatus.SUCCESS,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      trim: true,
    },
    oldBalance: {
      type: Number,
      default: null,
    },
    newBalance: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for performance on wallet history queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ referenceId: 1 });

export const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
