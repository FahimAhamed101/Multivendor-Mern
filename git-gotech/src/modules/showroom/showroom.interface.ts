import { Document, Types } from "mongoose";

export type TShowroom = {
  owner: Types.ObjectId;
  nidImage: string; // file path
  ownerImage: string; // file path
  logo: string; // file path
  bio?: string;
  preference?: "phone" | "email";
  referralCode: string;
  showroom_name: string;
  showroom_category: Array<string>;
  location: {
    type: "Point";
    coordinates: [Number];
  };
  showroom_address: string;
  showroom_schedule: [
    {
      isOpen: boolean;
      day: string;
      open: Date;
      close: Date;
    },
  ];
  isApprove: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} & Document;
