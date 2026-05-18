import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import PlatformSetting from "./platform-setting.model";
import { platformConfig } from "../../config";
import { HttpStatusCode } from "axios";

class Controller {
    updatePlatformSetting = catchAsync(async (req, res) => {
        const {
            perKgWeightPrice,
            perKmDistancePrice,
            driverWithdrawPercentage,
            vendorWithdrawPercentage,
            customerWithdrawPercentage
        } = req.body;

        // Find the existing platform setting or create a new one if none exists
        const platformSetting = await PlatformSetting.findOneAndUpdate(
            {}, // Empty filter to get the first document
            {
                perKgWeightPrice,
                perKmDistancePrice,
                driverWithdrawPercentage,
                vendorWithdrawPercentage,
                customerWithdrawPercentage
            },
            {
                new: true,
                upsert: true, // Create if doesn't exist
                runValidators: true
            }
        );

        // Update the platform config in memory
        if (platformSetting) {
            platformConfig.PER_KG_WEIGHT_PRICE = platformSetting.perKgWeightPrice;
            platformConfig.PER_KM_DISTANCE_PRICE = platformSetting.perKmDistancePrice;
            platformConfig.DRIVER_WITHDRAW_PERCENTAGE_RATE = platformSetting.driverWithdrawPercentage;
            platformConfig.VENDOR_WITHDRAW_PERCENTAGE_RATE = platformSetting.vendorWithdrawPercentage;
            platformConfig.CUSTOMER_WITHDRAW_PERCENTAGE_RATE = platformSetting.customerWithdrawPercentage;
        }

        sendResponse(res, {
            statusCode: HttpStatusCode.Ok,
            success: true,
            message: "Platform settings updated successfully",
            data: platformSetting
        });
    });

    getPlatformSetting = catchAsync(async (req, res) => {
        const platformSetting = await PlatformSetting.findOne({});
        if (!platformSetting) {
            return sendResponse(res, {
                statusCode: HttpStatusCode.NotFound,
                success: false,
                message: "Platform settings not found",
                data: null
            });
        }

        sendResponse(res, {
            statusCode: HttpStatusCode.Ok,
            success: true,
            message: "Platform settings retrieved successfully",
            data: platformSetting
        });
    });
}

export const PlatformSettingController = new Controller();