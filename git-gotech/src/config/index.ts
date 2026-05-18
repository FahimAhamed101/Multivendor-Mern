import dotenv from "dotenv";
import path from "path";
import PlatformSetting from "../modules/platform-settings/platform-setting.model";
import mongoose from "mongoose";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

// Platform settings configuration object
export const platformConfig = {
  PER_KG_WEIGHT_PRICE: 0,
  PER_KM_DISTANCE_PRICE: 0,
  DRIVER_WITHDRAW_PERCENTAGE_RATE: 0,
  VENDOR_WITHDRAW_PERCENTAGE_RATE: 0,
  CUSTOMER_WITHDRAW_PERCENTAGE_RATE: 0,
};

// export const PORT = 8085; //------> production;
export const PORT = 8083; //------> development;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const Nodemailer_GMAIL = process.env.Nodemailer_GMAIL;
export const Nodemailer_GMAIL_PASSWORD = process.env.Nodemailer_GMAIL_PASSWORD;
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;
export const max_file_size = 52428800; //-> 50MB;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const STRIPE_WEBHOOK_ENDPOINT_SECRET = process.env.endpoint_secret;
export const STRIPE_BASE_URL = "https://grassrootz-asifur-rahman.sarv.live/";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISH_KEY = process.env.STRIPE_PUBLISH_KEY;
export const NODE_ENV = process.env.NODE_ENV;
export const REDIS_HOST = "localhost";
export const REDIS_PORT = 8002;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_DB = 0;

// Momo Payment Gateway All Credentials
export const momoConfig = {
  baseUrl: process.env.MOMO_BASE_URL!,
  subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY!,
  apiUser: process.env.MOMO_API_USER!,
  apiKey: process.env.MOMO_API_KEY!,
  isSandbox: process.env.MOMO_IS_SANDBOX!,
  callbackUrl: process.env.CALLBACK_URL!,
};

// Function to initialize platform settings from database
const initializePlatformSettings = async () => {
  try {
    const platformSetting = await PlatformSetting.findOne({});
    if (platformSetting) {
      platformConfig.PER_KG_WEIGHT_PRICE = platformSetting.perKgWeightPrice;
      platformConfig.PER_KM_DISTANCE_PRICE = platformSetting.perKmDistancePrice;
      platformConfig.DRIVER_WITHDRAW_PERCENTAGE_RATE = platformSetting.driverWithdrawPercentage;
      platformConfig.VENDOR_WITHDRAW_PERCENTAGE_RATE = platformSetting.vendorWithdrawPercentage;
      platformConfig.CUSTOMER_WITHDRAW_PERCENTAGE_RATE = platformSetting.customerWithdrawPercentage;
    } else {
      console.warn('No platform settings found, using default values');
      // Set some default values
      platformConfig.PER_KG_WEIGHT_PRICE = 10; // Default 10 units per kg
      platformConfig.PER_KM_DISTANCE_PRICE = 5; // Default 5 units per km
      platformConfig.DRIVER_WITHDRAW_PERCENTAGE_RATE = 20; // Default 20%
      platformConfig.VENDOR_WITHDRAW_PERCENTAGE_RATE = 15; // Default 15%
      platformConfig.CUSTOMER_WITHDRAW_PERCENTAGE_RATE = 10; // Default 10%
    }
  } catch (error) {
    console.error('Error initializing platform settings:', error);
    // Set fallback values
    platformConfig.PER_KG_WEIGHT_PRICE = 10;
    platformConfig.PER_KM_DISTANCE_PRICE = 5;
    platformConfig.DRIVER_WITHDRAW_PERCENTAGE_RATE = 20;
    platformConfig.VENDOR_WITHDRAW_PERCENTAGE_RATE = 15;
    platformConfig.CUSTOMER_WITHDRAW_PERCENTAGE_RATE = 10;
  }
};

// Initialize platform settings on module load
initializePlatformSettings();

// export const FIREBASE_SERVICE_ACCOUNT_PATH =
//   process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
//   path.resolve(
//     process.cwd(),
//     "src/config/vibez-84546-firebase-adminsdk-fbsvc-f1bab122b8.json",
//   );