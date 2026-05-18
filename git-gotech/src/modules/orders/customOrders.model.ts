import { Schema, model } from "mongoose";
import { TCustomOrders, TTrackingInfo } from "./orders.interface";

const trackingInfoSchema = new Schema<TTrackingInfo>(
  {
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true, versionKey: false
  }
)

const CustomOrdersSchema = new Schema<TCustomOrders>(
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
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    showroomId: {
      type: Schema.Types.ObjectId,
      ref: "showrooms",
      required: true,
    },
    measurementType: {
      type: String,
      required: true,
    },
    measurements: {
      chest: {
        type: Number,
      },
      shoulderWidth: {
        type: Number,
      },
      armLength: {
        type: Number,
      },
      wrist: {
        type: Number,
      },
      length: {
        type: Number,
      },
      neck: {
        type: Number,
      },
      waist: {
        type: Number,
      },
      hips: {
        type: Number,
      },
      inseam: {
        type: Number,
      },
      outseam: {
        type: Number,
      },
      thigh: {
        type: Number,
      },
      calf: {
        type: Number,
      },
      ankle: {
        type: Number,
      },
      additionalNote: {
        type: String,
        default: "",
      },
    },
    vendorNote: {
      type: String,
      default: "",
    },
    referenceImages: [
      {
        url: {
          type: String,
        },
      },
    ],
    quantity: {
      type: Number,
    },
    weight: {
      unit: {
        type: String,
        enum: ["kg"],
        default: "kg",
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Order Placed",
        "Vendor Accepted",
        "Vendor Rejected",
        "Customer Accepted",
        "Customer Rejected",
        "Processing",
        "Ready for Pickup",
        "Driver Accepted",
        "Picked Up",
        "Delivered",
      ],
    },
    trackingNumber: {
      type: String,
      required: true,
    },
    price: {
      unit: {
        type: String,
        default: undefined,
      },
      tip: {
        type: Number,
        default: undefined,
      },
      amount: {
        type: Number,
        default: undefined,
      },
      deliveryCharge: {
        type: Number,
        default: undefined,
      },
    },
    deliveryInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipcode: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    pickUpInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipcode: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    tracking: [trackingInfoSchema],
    customizeProductId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      default: null,
    },
  },
  { timestamps: true },
);

export const CustomOrders = model<TCustomOrders>(
  "CustomOrders",
  CustomOrdersSchema,
);
