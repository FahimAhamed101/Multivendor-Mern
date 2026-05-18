import mongoose, { Schema, model } from "mongoose";
import { ECurrency, EStatus, IDeliveryRequest, TTrackingInfo } from "./delivery-request.interface";

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

const DeliveryRequestSchema = new Schema<IDeliveryRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String, required: true }],
    numberOfItems: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, trim: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", required: false },
    trackingNumber: { type: String, required: true, unique: true },
    weight: {
      unit: {
        type: String,
        enum: ["kg", "mg", "gm", "pound", "ounce"],
        required: true,
      },
      value: { type: Number, required: true, min: 0 },
    },
    price: {
      currency: { type: String, enum: ECurrency, required: true },
      tip: { type: Number, required: true, min: 0 },
      deliveryFee: { type: Number, required: true, min: 0 },
    },
    type: { type: String, required: true, trim: true, default: "delivery request" },
    rejectedReason: { type: String, required: false, trim: true, default: "" },
    status: {
      type: String,
      enum: EStatus,
      default: EStatus.PENDING,
    },
    pickupLocation: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      location: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },
    deliveryAddress: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      email: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },
    tracking: [trackingInfoSchema],
  },
  { timestamps: true }
);

// Optional: Add geospatial index if radius search from driver is needed in future.
DeliveryRequestSchema.index({ "pickupLocation.coordinates": "2dsphere" });

export const DeliveryRequestModel = model<IDeliveryRequest>("DeliveryRequest", DeliveryRequestSchema);
