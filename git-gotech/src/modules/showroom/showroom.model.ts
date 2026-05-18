import mongoose from "mongoose";
import { TShowroom } from "./showroom.interface";

const showroomSchema = new mongoose.Schema<TShowroom>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    nidImage: {
      type: String,
      required: true,
      trim: true,
    },
    ownerImage: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: false,
      trim: true,
    },

    referralCode: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    showroom_name: {
      type: String,
      required: true,
      trim: true,
    },
    showroom_category: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    location: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    showroom_address: {
      type: String,
      required: true,
      trim: true,
    },
    showroom_schedule: [
      {
        isOpen: { type: Boolean, required: true, default: true },
        day: { type: String, required: true },
        open: { type: Date, required: true },
        close: { type: Date, required: true },
      },
    ],
    isApprove: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

// Create a Index on location field
showroomSchema.index({ location: "2dsphere" });

// Create a Index on showroom_category field
showroomSchema.index({ showroom_category: 1 });

// Create a Index on showroom_name field
showroomSchema.index({ showroom_name: 1 });

// Create a Index on showroom_address field
showroomSchema.index({ showroom_address: 1 });

export const Showroom = mongoose.model("showrooms", showroomSchema);
