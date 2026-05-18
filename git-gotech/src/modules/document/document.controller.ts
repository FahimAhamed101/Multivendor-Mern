import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Document } from "./document.model";
import { IUserPayload } from "../../middlewares/roleGuard";
import mongoose from "mongoose";

const addOrUpdateDocument = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // 1. Fetch existing document to check current status
  let existingDoc = await Document.findOne({ driver: user.id });

  // 2. Prepare structured update object
  const update: any = {
    driver: user.id,
  };

  // Helper to handle nested body/file data
  const body = req.body;

  // National ID
  if (body.national_id?.number || files?.nidFront || files?.nidBack) {
    update.national_id = { ...existingDoc?.national_id };
    if (body.national_id?.number) update.national_id.number = body.national_id.number;
    if (files?.nidFront) update.national_id.front = files.nidFront[0].filename;
    if (files?.nidBack) update.national_id.back = files.nidBack[0].filename;
    
    if (update.national_id.number && update.national_id.front && update.national_id.back) {
      update.isNationalIdUpload = true;
    }
  }

  // Driving License
  if (body.driving_license?.number || files?.dlFront || files?.dlBack) {
    update.driving_license = { ...existingDoc?.driving_license };
    if (body.driving_license?.number) update.driving_license.number = body.driving_license.number;
    if (files?.dlFront) update.driving_license.front = files.dlFront[0].filename;
    if (files?.dlBack) update.driving_license.back = files.dlBack[0].filename;

    if (update.driving_license.number && update.driving_license.front && update.driving_license.back) {
      update.isDrivingLicenseUpload = true;
    }
  }

  // Vehicle License
  if (body.vehicle_license || files?.vlFront || files?.vlBack || files?.vehicleImage) {
    update.vehicle_license = { ...existingDoc?.vehicle_license };
    if (body.vehicle_license?.number) update.vehicle_license.number = body.vehicle_license.number;
    if (body.vehicle_license?.brand) update.vehicle_license.brand = body.vehicle_license.brand;
    if (body.vehicle_license?.model) update.vehicle_license.model = body.vehicle_license.model;
    if (files?.vlFront) update.vehicle_license.front = files.vlFront[0].filename;
    if (files?.vlBack) update.vehicle_license.back = files.vlBack[0].filename;
    if (files?.vehicleImage) update.vehicle_license.vehicle_image = files.vehicleImage[0].filename;

    if (update.vehicle_license.number && update.vehicle_license.front && update.vehicle_license.back && 
        update.vehicle_license.brand && update.vehicle_license.model && update.vehicle_license.vehicle_image) {
      update.isVehicleDetailsUpload = true;
    }
  }

  // Insurance
  if (body.insurance || files?.insuranceFile) {
    update.insurance = { ...existingDoc?.insurance };
    if (body.insurance?.policy_number) update.insurance.policy_number = body.insurance.policy_number;
    if (body.insurance?.company_name) update.insurance.company_name = body.insurance.company_name;
    if (files?.insuranceFile) update.insurance.file = files.insuranceFile[0].filename;

    if (update.insurance.policy_number && update.insurance.company_name && update.insurance.file) {
      update.isInsuranceUpload = true;
    }
  }

  // Selfie
  if (files?.selfie) {
    update.selfi = files.selfie[0].filename;
    update.isSelfieUpload = true;
  }

  console.log(update);

  const result = await Document.findOneAndUpdate(
    { driver: user.id },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: existingDoc ? "Documents updated successfully" : "Documents uploaded successfully",
    data: result,
  });
});

const getDocumentByDriverId = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await Document.findOne({ driver: id }).populate("driver", "name email phone image").lean();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document retrieved successfully",
    data: result,
  });
});

const getMyDocument = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const result = await Document.findOne({ driver: user.id }).lean();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your documents retrieved successfully",
    data: result,
  });
});

export const DocumentController = {
  addOrUpdateDocument,
  getDocumentByDriverId,
  getMyDocument
};
