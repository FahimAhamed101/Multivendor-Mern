import { Types, Document } from "mongoose";

export enum ETransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum ETransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface ITransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  type: ETransactionType;
  status: ETransactionStatus;
  description: string;
  referenceId?: string;
  oldBalance?: number;
  newBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecordTransactionPayload {
  user: Types.ObjectId | string;
  amount: number;
  type: ETransactionType;
  description: string;
  referenceId?: string;
  status?: ETransactionStatus;
  session?: any; // For mongoose transactions
}
