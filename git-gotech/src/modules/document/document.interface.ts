import { Types } from "mongoose";

export type TDocument = {
  driver: Types.ObjectId;
  national_id: {
    number: number;
    front: string; // image path
    back: string; // image path
  };

  driving_license: {
    number: number;
    front: string; // image path
    back: string; // image path
  };
  vehicle_license: {
    number: number;
    front: string; // image path
    back: string; // image path
    brand: string;
    model: string;
    vehicle_image: string; // image path
  };
  insurance: {
    policy_number: number;
    company_name: string;
    file: string; // image path
  };
  selfi: string; // image path
  isNationalIdUpload: boolean;
  isDrivingLicenseUpload: boolean;
  isVehicleDetailsUpload: boolean;
  isInsuranceUpload: boolean;
  isSelfieUpload: boolean;
};
