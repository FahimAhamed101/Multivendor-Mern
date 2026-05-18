import mongoose from "mongoose";
import { TEvent, TEventProduct, TEventSizeSubmisson } from "./event.interface";

const eventSchema = new mongoose.Schema<TEvent>(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseOption: {
      type: String,
      required: true,
      enum: ["creator", "invited"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    participant: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const eventProductSchema = new mongoose.Schema<TEventProduct>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: [true, "Product is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: [true, "Event is required"],
    },
    isOrderd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const eventSizeSubmissionSchema = new mongoose.Schema<TEventSizeSubmisson>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: [true, "Product is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: [true, "Event is required"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    size: {
      type: String,
      enum: {
        values: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4X", "5X"],
        message: "{VALUE} is not a valid size",
      },
      required: [true, "Size is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Events = mongoose.model("Events", eventSchema);
export const SizeSubmission = mongoose.model(
  "SizeSubmission",
  eventSizeSubmissionSchema,
);
export const EventProduct = mongoose.model("EventProduct", eventProductSchema);
