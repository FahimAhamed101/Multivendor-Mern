import { Document, Types } from "mongoose";

export type TEvent = {
  customer: Types.ObjectId;
  title: string;
  eventDate: Date;
  address: string;
  purchaseOption: "creator" | "participator";
  description: string;
  participant: Array<Types.ObjectId>;
} & Document;

export type TEventProduct = {
  product: Types.ObjectId;
  event: Types.ObjectId;
  isOrderd: boolean;
} & Document;

export type TEventSizeSubmisson = {
  product: Types.ObjectId;
  event: Types.ObjectId;
  customer: Types.ObjectId;
  size: "S" | "M" | "L" | "XL";
} & Document;
