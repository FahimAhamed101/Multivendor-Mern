import { Schema, model } from "mongoose";
import { TDocument } from "./document.interface";

const documentSchema = new Schema<TDocument>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    national_id: {
      number: {
        type: Number,
        required: true,
      },
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
        required: true,
      },
    },
    driving_license: {
      number: {
        type: Number,
        required: true,
      },
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
        required: true,
      },
    },
    vehicle_license: {
      number: {
        type: Number,
        required: true,
      },
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
      },
      model: {
        type: String,
      },
      vehicle_image: {
        type: String,
      },
    },
    insurance: {
      policy_number: {
        type: Number,
      },
      company_name: {
        type: String,
      },
      file: {
        type: String,
      },
    },
    selfi: {
      type: String,
    },
    isNationalIdUpload: {
      type: Boolean,
      default: false,
    },
    isDrivingLicenseUpload: {
      type: Boolean,
      default: false,
    },
    isVehicleDetailsUpload: {
      type: Boolean,
      default: false,
    },
    isInsuranceUpload: {
      type: Boolean,
      default: false,
    },
    isSelfieUpload: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Document = model<TDocument>("Document", documentSchema);
