import { Document, Types } from "mongoose";

export type TReviews = {
  driver: {
    id: Types.ObjectId;
    rating: number; // it would be 1-5 only
    comment: string;
  };
  product: {
    id: Types.ObjectId;
    rating: number; // it would be 1-5 only
    comment: string;
  };
  customer: Types.ObjectId;
} & Document;
