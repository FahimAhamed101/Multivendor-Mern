import { Types } from "mongoose";

export interface IPaymentCard {
  _id?: Types.ObjectId;

  userId: Types.ObjectId;

  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  country?: string;
  moreInfo?: string;

  isDeleted?: boolean;
}
