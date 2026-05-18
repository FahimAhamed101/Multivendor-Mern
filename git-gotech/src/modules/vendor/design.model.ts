import mongoose, { Schema } from "mongoose";
import { TCDesign } from "./design.interface";

const customDesignSchema = new Schema<TCDesign>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showroom: {
      type: Schema.Types.ObjectId,
      ref: "Showroom",
      required: true,
    },
    measurementType: {
      type: String,
      required: true,
      enum: ["top", "trouser", "shorts"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    declineReason: {
      type: String,
      required: false,
    },
    measurements: {
      type: Schema.Types.Mixed,
      required: true,
    },
    additionalVendorNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

export const CDesign = mongoose.model<TCDesign>(
  "custom-design",
  customDesignSchema,
);
