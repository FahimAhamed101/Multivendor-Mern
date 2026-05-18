import { Schema, model } from "mongoose";
import { TOrders, TTrackingInfo } from "./orders.interface";

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

const OrdersSchema = new Schema<TOrders>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    showroom: {
      type: Schema.Types.ObjectId,
      ref: "showrooms",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    size: [
      {
        type: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4X", "5X"],
          default: undefined,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
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
    orderType: {
      type: String,
      enum: ["vendor", "event"],
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ["delivery", "pick-up"],
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Order Placed",
        "Processing",
        "Ready for Pickup",
        "Driver Accepted",
        "Picked Up",
        "Delivered",
        "Rejected",
      ],
      default: "Pending",
    },
    trackingNumber: {
      type: Number,
      required: true,
    },
    price: {
      unit: {
        type: String,
        enum: ["usd", "bdt", "rs"],
        default: undefined,
      },
      amount: {
        type: Number,
        required: true,
      },
      tip: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      weightCharge: {
        type: Number,
        default: 0,
      },
      coupon: {
        type: String,
        default: undefined,
      },
      deliveryCharge: {
        type: Number,
        default: 0,
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
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      zipcode: {
        type: Number,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: false,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
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
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      zipcode: {
        type: Number,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: false,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    tracking: [trackingInfoSchema],
  },
  {
    timestamps: true,
  },
);
OrdersSchema.index({ "deliveryInfo.location": "2dsphere" });
OrdersSchema.index({ "pickUpInfo.location": "2dsphere" });
export const Orders = model<TOrders>("orders", OrdersSchema);
