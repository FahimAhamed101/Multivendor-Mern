import { Schema, model } from "mongoose";
import { TReviews } from "./review.interface";

const reviewsSchema = new Schema<TReviews>(
  {
    driver: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      comment: {
        type: String,
        trim: true,
        default: null,
      },
    },
    product: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      comment: {
        type: String,
        trim: true,
        default: null,
      },
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewsSchema.index(
  { "driver.id": 1, "product.id": 1, customer: 1 },
  { unique: true },
);

export const Reviews = model<TReviews>("Reviews", reviewsSchema);
