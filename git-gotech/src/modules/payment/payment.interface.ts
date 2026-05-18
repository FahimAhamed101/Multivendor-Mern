// payment.interface.ts

import { Types } from "mongoose";

export enum EPaymentStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  FAILED = "failed",
  TIMEOUT = "timeout",
}

export enum EPaymentType {
  WALLET_TOPUP = "wallet_topup",
  ORDER_PAYMENT = "order_payment",
  REFUND = "refund",
}

export interface IPayment {
  userId: Types.ObjectId;

  amount: number;
  currency: string;

  phone: string; // MSISDN

  referenceId: string; // MoMo reference (X-Reference-Id)
  externalId: string;  // Your system ID (ORDER / TOPUP ID)
  targetEnv: string;
  countryCode: string;

  provider: string;

  type: EPaymentType;

  status: EPaymentStatus;

  failureReason?: string;

  metadata?: Record<string, any>; // optional extra info

  createdAt?: Date;
  updatedAt?: Date;
}