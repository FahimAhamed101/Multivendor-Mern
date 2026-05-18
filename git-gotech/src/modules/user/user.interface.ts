import { Document, Types } from "mongoose";
import { TRole } from "../../config/role";
export type IUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  gender?: "male" | "female" | "other";
  address?: string;
  phone?: number;
  bio?: string;
  preference?: "phone" | "email";
  referralCode?: string;
  image?: string;
  isVerified?: boolean;
  blockStatus: boolean;
  isOnline?: boolean;
  role: TRole;
  isRequest?: "approve" | "deny" | "send";
  isDeleted: boolean;
  fcmToken?: string;
  balance: number;
  topVendor: boolean;
} & Document;

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;

export type ITokenStore = {
  token: string;
  expiresAt: Date;
} & Document;
