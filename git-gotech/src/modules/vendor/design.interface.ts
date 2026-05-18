import { Types } from "mongoose";

interface TopMeasurements {
  chest: number;
  shoulderWidth: number;
  armLength: number;
  inseam: number;
  neck: number;
  length: number;
  additionalNotes: string;
}

interface TrouserMeasurements {
  waist: number;
  hips: number;
  inseam: number;
  outseam: number;
  thigh: number;
  knee: number;
  ankle: number;
  additionalNotes: string;
}

interface ShortsMeasurements {
  waist: number;
  hips: number;
  inseam: number;
  outseam: number;
  thigh: number;
  additionalNotes: string;
}

export type TCDesign = {
  product: Types.ObjectId;
  customer: Types.ObjectId;
  showroom: Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  declineReason: string;
  measurementType: "top" | "trouser" | "shorts";
  measurements: TopMeasurements | TrouserMeasurements | ShortsMeasurements;
  additionalVendorNotes?: string;
  photo: string;
};
