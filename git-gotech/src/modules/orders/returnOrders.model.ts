import mongoose, { Schema } from "mongoose";
import { TReturnOrders, TTrackingInfo } from "./orders.interface";

const trackingInfoSchema = new Schema<TTrackingInfo>({
  status: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false
});

const returnSchema = new mongoose.Schema<TReturnOrders>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "orders",
      required: true,
    },
    attachment: {
      type: [String],
      default: [],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    clientReason: {
      type: String,
      required: true,
      trim: true,
    },
    vendorReason: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    showroom: {
      type: Schema.Types.ObjectId,
      ref: "showrooms",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Vendor Accepted",
        "Vendor Rejected",
        "Driver Accepted",
        "Picked Up",
        "Returned",
      ],
      required: true,
      default: "Pending",
    },
    trackingNumber: {
      type: Number,
      required: true,
    },
    isUsed: {
      type: Boolean,
      required: true,
    },
    price: {
      unit: {
        type: String,
        enum: ["usd", "bdt", "rs"],
      },
      amount: {
        type: Number,
        required: true,
      },
      tip: {
        type: Number,
        default: undefined,
      },
      deliveryCharge: {
        type: Number,
        default: undefined,
      },
    },
    deliveryInfo: {
      name: String,
      address: String,
      country: String,
      state: String,
      zipcode: Number,
      email: String,
      phone: Number,
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number],
      },
    },
    pickUpInfo: {
      name: String,
      address: String,
      country: String,
      state: String,
      zipcode: Number,
      email: String,
      phone: Number,

      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number],
      },
    },
    tracking: [trackingInfoSchema],
  },
  {
    timestamps: true,
  },
);
export const ReturnOrders = mongoose.model("ReturnOrders", returnSchema);
