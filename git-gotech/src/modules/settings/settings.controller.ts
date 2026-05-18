// update or create a setting
import { Request, Response } from "express";
import httpStatus from "http-status";
import Setting from "./settings.model";
import { SettingService } from "./settings.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

// create or update a setting by key
const createOrUpdate = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;

  if (!key || key === "generals") {
    // 'generals' is a reserved key, so we don't allow it to be used
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Key parameter is required",
      data: null,
    });
  }

  const setting = await Setting.findOneAndUpdate({ key }, req.body, {
    new: true,
    upsert: true,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Setting updated successfully",
    data: setting,
  });
});

// get a setting by key
const getSetting = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  const setting = await SettingService.get(key);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Setting retrieved successfully",
    data: setting,
  });
});

const getSettingGenerals = catchAsync(async (req: Request, res: Response) => {
  const settings = await Setting.find({
    key: {
      $in: [
        "radius-limits",
        "commission-rate",
        "support",
        "transport-price",
        "transaction-transfer-hours",
        "driver-withdraw-percentage",
        "vendor-withdraw-percentage",
        "per-kg-weight-price",
        "per-km-distance-price",
      ],
    },
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "General Settings are retrieved successfully",
    data: settings,
  });
});

// update general settings
const updateGenerals = catchAsync(async (req: Request, res: Response) => {
  const {
    "radius-limits": radiusLimits,
    "commission-rate": commissionRate,
    support,
    "transport-price": transportPrice,
    "transaction-transfer-hours": transactionTransferHours,
  } = req.body;
  await Promise.all([
    Setting.findOneAndUpdate(
      { key: "radius-limits" },
      { value: radiusLimits },
      { upsert: true, new: true }
    ),
    Setting.findOneAndUpdate(
      { key: "commission-rate" },
      { value: commissionRate },
      { upsert: true, new: true }
    ),
    Setting.findOneAndUpdate(
      { key: "support" },
      { value: support },
      { upsert: true, new: true }
    ),
    Setting.findOneAndUpdate(
      { key: "transport-price" },
      { value: transportPrice },
      { upsert: true, new: true }
    ),
    Setting.findOneAndUpdate(
      { key: "transaction-transfer-hours" },
      { value: transactionTransferHours },
      { upsert: true, new: true }
    ),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "General Settings updated successfully",
    data: null,
  });
});

export const SettingController = {
  getSetting,
  getSettingGenerals,
  createOrUpdate,
  updateGenerals,
};
