import mongoose, { Schema } from "mongoose";
import { IUser, IOTP, ITokenStore } from "./user.interface";
import { ERole } from "../../config/role";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    username: { type: String, trim: true, unique: true, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true },
    phone: { type: Number, trim: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
      default: null,
    },
    address: { type: String, trim: true, default: null },
    blockStatus: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      required: false,
      default: "User_Default_Image.jpg"
    },
    role: {
      type: String,
      enum: ERole,
      required: true,
      default: "customer",
    },
    bio: {
      type: String,
      required: false,
      trim: true,
    },
    topVendor: {
      type: Boolean,
      required: false,
      default: null,
    },
    preference: {
      type: String,
      required: false,
      enum: ["phone", "email"],
      trim: true,
    },
    referralCode: {
      type: String,
      required: false,
      trim: true,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    fcmToken: { type: String, trim: true, default: null },
    isRequest: {
      type: String,
      enum: ["approve", "deny", "send"],
      default: "send",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 100000000,
    },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

UserSchema.index({ name: "text" });
UserSchema.index({ username: "text" });
UserSchema.index({ createdAt: 1 });
UserModel.schema.index({ role: 1 });

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true, index: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true, index: { expires: "1m" } },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);
OTPSchema.index({ email: 1, expiresAt: 1 });

const TokenStoreSchema = new Schema<ITokenStore>({
  token: { type: String, required: true, trim: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const TokenStore = mongoose.model<ITokenStore>(
  "TokenStore",
  TokenStoreSchema,
);
