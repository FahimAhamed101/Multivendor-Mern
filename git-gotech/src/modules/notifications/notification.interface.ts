import { Document, Types } from "mongoose";

// Define the INotification type
export type INotification = {
  userId: Types.ObjectId | null;
  adminId: Types.ObjectId[] | null;
  adminMsgTittle: string;
  isBroadcast: boolean;
  adminMsg: string;
  userMsgTittle: string;
  userMsg: string;
  isAdminRead: boolean;
  isUserRead: boolean;
} & Document;

export type INotificationPayload = {
  title: string;
  body: string;
};
