import mongoose from "mongoose";
import { TCategorie, TProduct, TSave } from "./product.interface";
const saveSchema = new mongoose.Schema<TSave>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saveType: {
      type: String,
      required: true,
      enum: ["cart", "wishlist"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema<TProduct>(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    showroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "showrooms",
      required: true,
    },

    customizeProduct: {
      status: { type: Boolean, required: false, default: false, trim: true },
      customOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "customOrders", required: false, default: null, trim: true },
    },

    product_name: {
      type: String,
      required: true,
      trim: true,
    },

    product_category: {
      type: String,
      required: true,
      trim: true,
    },

    product_description: {
      type: String,
      required: true,
      trim: true,
    },

    product_price: {
      type: Number,
      required: true,
      trim: true,
    },

    review_count: {
      type: Number,
      required: false,
      default: null,
    },

    review_rating: {
      type: Number,
      required: false,
      default: null,
    },

    product_stocks: [
      {
        size: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          trim: true,
        },
      },
    ],

    sale_count: {
      type: Number,
      required: true,
      default: 0,
    },

    isPrivate: {
      type: Boolean,
      required: true,
      default: false,
    },

    privateReason: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },

    product_weight: {
      unit: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, trim: true },
    },

    product_images: [
      {
        type: String,
        required: true,
      }
    ],

    discount: {
      isValid: { type: Boolean, required: false, default: false, trim: true },
      percentage: { type: Number, required: false, default: null, trim: true },
      startDate: { type: Date, required: false, default: null, trim: true },
      endDate: { type: Date, required: false, default: null, trim: true },
    },

    isMixable: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
    },

    isCustom: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const categorySchema = new mongoose.Schema<TCategorie>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

productSchema.index({ product_name: 1 });
productSchema.index({ product_category: 1 })
productSchema.index({ product_description: 1 })

export const Product = mongoose.model<TProduct>("products", productSchema);
export const SaveProduct = mongoose.model<TSave>("save", saveSchema);
export const Categorie = mongoose.model<TCategorie>("Categories", categorySchema);
