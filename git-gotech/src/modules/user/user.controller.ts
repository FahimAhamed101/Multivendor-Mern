import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendError from "../../utils/sendError";
import sendResponse from "../../utils/sendResponse";

import { UserService } from "./user.service";

import { emitNotification } from "../../utils/socket";
import httpStatus from "http-status";
// import RegisterShowerModel from "../RegisterShower/RegisterShower.model";

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { OTPModel, UserModel, TokenStore } from "./user.model";

import {
  findUserByEmail,
  findUserById,
  generateOTP,
  hashPassword,
  resendOTPEmail,
  saveOTP,
  sendManagerRequest,
  sendOTPEmailRegister,
  sendOTPEmailVerification,
  sendResetOTPEmail,
} from "./user.utils";

import ApiError from "../../errors/ApiError";
import {
  generateRegisterToken,
  generateToken,
  verifyToken,
} from "../../utils/JwtToken";

import { sendPushNotification } from "../notifications/pushNotification/pushNotification.controller";
import { IUserPayload } from "../../middlewares/roleGuard";
import { TransactionModel } from "../transaction/transaction.model";
import mongoose from "mongoose";
import { Document } from "../document/document.model";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, username, email, password, fcmToken, phone, role } = req.body;
  const { otp } = await UserService.registerUserService(name);
  const token = generateRegisterToken({ email });
  if (!phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone number is required");
  }
  let isRequest = "send";
  if (role === "customer") {
    isRequest = "approve";
  }
  (async () => {
    try {
      const hashedPassword = await hashPassword(password);
      let image = "";
      if (req.file) {
        const publicFileURL = `${req.file.filename}`;
        image = publicFileURL;
      }
      const createdUser = await UserService.createUser({
        name,
        username,
        isRequest,
        email,
        image,
        phone,
        hashedPassword,
        fcmToken,
        role,
      });
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message:
          "OTP sent to your email. Please verify to continue registration.",
        data: { token: token },
      });
      await sendOTPEmailRegister(name, email, otp);

      // Calculate OTP expiration (60 seconds from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 1000);
      // Save or update the OTP in the database concurrently.
      await Promise.all([
        OTPModel.findOneAndUpdate(
          { email },
          { otp, expiresAt },
          { upsert: true },
        ),
        saveOTP(email, otp),
      ]);

      // --------> Emit notification <----------------
      const user: any = createdUser?.createdUser;
      const notificationPayload: any = {
        userId: user?._id,
        userMsgTittle: "🎉 Registration Completed",
        adminMsgTittle: "📢 New User Registration",
        userMsg: `💫 Welcome to ${process.env.AppName}, ${user?.name}! 🎉 Your registration is complete, and we're thrilled to have you onboard. Start exploring and enjoy the experience! 🚀`,
        adminMsg: `New user registration! 🎉 A new user, ${user?.name}, has successfully registered with ${process.env.AppName}. Please welcome them aboard and ensure everything is set up for their journey.`,
      };
      await emitNotification(notificationPayload);
      if (fcmToken) {
        try {
          // Define the base push message.
          const pushMessage = {
            title: "🎉 Welcome to Sweepy!",
            body: `Hi ${name}, 🎉 Welcome to ${process.env.AppName}! Your registration is complete. We're excited to have you onboard!`,
          };
          await sendPushNotification(fcmToken, pushMessage);
        } catch (pushError) {
          // Log any push notification errors without affecting the client response.
          console.error("Error sending push notification:", pushError);
        }
      }
    } catch (backgroundError: any) {
      console.error("Error in background tasks:", backgroundError?.message);
      return sendResponse(res, {
        statusCode: backgroundError?.statusCode,
        success: false,
        data: backgroundError?.message,
      });
    }
  })();
});

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  let decoded;
  try {
    decoded = verifyToken(req.headers.authorization as string);
  } catch (error: any) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
  }
  const email = decoded.email as string;
  const now = new Date();
  const otpRecord = await OTPModel.findOne({ email });

  if (otpRecord && otpRecord.expiresAt > now) {
    const remainingTime = Math.floor(
      (otpRecord.expiresAt.getTime() - now.getTime()) / 1000,
    );

    throw new ApiError(
      httpStatus.FORBIDDEN,
      `You can't request another OTP before ${remainingTime} seconds.`,
    );
  }

  const otp = generateOTP();

  resendOTPEmail(email, otp)
    .then((res) => {
      console.log("Email Send");
    })
    .catch((err) => {
      console.log("Email not send");
    });
  await saveOTP(email, otp); // Save the new OTP with expiration
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A new OTP has been sent to your email.",
    data: null,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role, fcmToken } = req.body;

  const user = await findUserByEmail(email);

  if (user?.role === "vendor" || user?.role === "driver") {
    if (user?.isRequest === "send") {
      throw new ApiError(404, "Your request is not approved yet by the admin.");
    }
    if (user?.isRequest === "deny") {
      throw new ApiError(404, "Your request is rejected by the admin.");
    }
  }

  if (user?.blockStatus) {
    throw new ApiError(404, "Your account is blocked by the admin. Please contact support.");
  }

  if (!user) {
    throw new ApiError(404, "This account does not exist.");
  }

  if (user.isDeleted) {
    throw new ApiError(404, "your account is deleted.");
  }

  const userId = user._id as string;
  const token = generateToken({
    id: userId,
    email: user.email,
    role: user.role,
  });

  if (!user.isVerified) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "We've sent an OTP to your email to verify your profile.",
      data: {
        isVerified: user.isVerified ? true : false,
        role: user.role,
        token,
      },
    });
    const name = user.name as string;
    const otp = generateOTP();
    sendOTPEmailVerification(name, email, otp)
      .then(() => {
        console.log("Email sent");
      })
      .catch((err) => {
        console.error("Error sending OTP email:", err);
      });
    return await saveOTP(email, otp);
  }
  const isPasswordValid = await argon2.verify(
    user.password as string,
    password,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Wrong password!");
  }
  // await sendNumberOTP("+12407147389", "Hey, this is a test message for testing Twilio. If you receive this message, please notify your developer.");
  let isDocumentSubmitted: boolean = false;
  if (user.role === "driver") {
    const driverDoc = await Document.findOne({ driver: user._id }).lean();
    if (!driverDoc) {
      isDocumentSubmitted = false
    }
    else if (driverDoc) {
      isDocumentSubmitted = driverDoc.isNationalIdUpload && driverDoc.isDrivingLicenseUpload && driverDoc.isVehicleDetailsUpload && driverDoc.isInsuranceUpload && driverDoc.isSelfieUpload;
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login complete!",
    data: {
      user: {
        _id: user._id,
        name: user?.name,
        email: user?.email,
        image: user?.image || "",
        role: user?.role,
        isRequest: user?.isRequest,
        ...(user.role === "driver" && { isDocumentSubmitted }),
      },
      isVerified: user.isVerified ? true : false,
      token,
    },
  });
  if (fcmToken?.trim()) {
    user.fcmToken = fcmToken;
    await user.save();
  }
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Please provide an email.");
  }
  // await delCache(email);
  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(404, "This account does not exist.");
  }

  const now = new Date();
  // Check if there's a pending OTP request and if the 2-minute cooldown has passed
  const otpRecord = await OTPModel.findOne({ email });
  if (otpRecord && otpRecord.expiresAt > now) {
    const remainingTime = Math.floor(
      (otpRecord.expiresAt.getTime() - now.getTime()) / 1000,
    );

    throw new ApiError(
      403,
      `You can't request another OTP before ${remainingTime} seconds.`,
    );
  }
  const token = generateRegisterToken({ email });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to your email. Please check!",
    data: { token },
  });
  const otp = generateOTP();
  // await setCache(email, otp, 300);
  await sendResetOTPEmail(email, otp, user.name as string);
  await saveOTP(email, otp); // Save OTP with expiration
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  let decoded: any;
  try {
    decoded = verifyToken(req.headers.authorization);
  } catch (error: any) {
    return sendError(res, error);
  }
  // if (!decoded.role) {
  //   throw new ApiError(401, "Invalid token. Please try again.");
  // }
  const email = decoded.email as string;

  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Please provide  password ");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully.",
    data: null,
  });

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(
      404,
      "User not found. Are you attempting something sneaky?",
    );
  }
  const newPassword = await hashPassword(password);
  user.password = newPassword;
  await user.save();
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;

  try {
    const { token, name, email, phone } = await UserService.verifyOTPService(
      otp,
      req.headers.authorization as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "OTP Verified successfully.",
      data: { name, email, phone, token },
    });

    const user = await UserModel.findOne({ email });

    // Mark user as verified, if needed
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to verify otp");
  }
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  try {
    const { name, ageRange, address, bio, preference } = req.body;

    let decoded = req.user as IUserPayload;
    const userId = decoded.id as string;
    const user = await findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (ageRange) updateData.ageRange = ageRange;
    if (address) updateData.address = address;
    if (bio) updateData.bio = bio;
    if (preference) updateData.preference = preference;
    // updateData.balance = 1000000;
    updateData.blockStatus = true;

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedUser = await UserService.updateUserById(userId, updateData);
    const responseData = {
      _id: updatedUser?._id,
      name: updatedUser?.name,
      email: updatedUser?.email,
      address: updatedUser?.address,
      image: req.file?.filename || "",
      bio: updatedUser?.bio || "",
      preference: updatedUser?.preference || "",
    };
    if (updatedUser) {
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated.",
        data: responseData,
      });
    }
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Unexpected error occurred while updating user.",
    );
  }
});

const getSelfInfo = catchAsync(async (req: Request, res: Response) => {
  try {
    let decoded = req.user as IUserPayload;
    const userId = decoded.id as string;
    // Find the user in DB
    const user = await findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // Send final response
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile information retrieved successfully",
      data: user,
      pagination: undefined,
    });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message ||
      "Unexpected error occurred while retrieving user information.",
    );
  }
});

const getWallet = catchAsync(async (req: Request, res: Response) => {
  try {
    let decoded = req.user as IUserPayload;
    const userId = decoded.id as string;

    console.log(userId);

    // Find the user in DB
    const user = await findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: new mongoose.Types.ObjectId(userId) };

    const transactions = await TransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalData = await TransactionModel.countDocuments(filter);

    // Send final response
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet information retrieved successfully",
      data: {
        balance: user.balance,
        totalData,
        page,
        limit,
        transactions,
      },
    });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message ||
      "Unexpected error occurred while retrieving wallet information.",
    );
  }
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    const deleteableuser = await findUserById(id);
    if (!deleteableuser) {
      throw new ApiError(404, "User not found.");
    }
    if (deleteableuser.isDeleted) {
      throw new ApiError(404, "This account is already deleted.");
    }
    if (
      (req.user as IUserPayload)?.id !== id ||
      (req.user as IUserPayload)?.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You cannot delete this account. Please contact support",
      );
    }

    await UserService.userDelete(id, deleteableuser.email);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Account deleted successfully",
      data: null,
    });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Unexpected error occurred while deleting the user.",
    );
  }
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Please provide both old password and new password.");
    }

    let decoded = req.user as IUserPayload;
    const email = decoded.email as string;
    const user = await findUserByEmail(email);

    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await argon2.verify(user.password as string, oldPassword);
    if (!isMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect.");
    }

    const hashedNewPassword = await argon2.hash(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "You have successfully changed your password.",
      data: null,
    });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to change password.",
    );
  }
});

const toggleDriverOnlineStatus = catchAsync(async (req: Request, res: Response) => {
  try {
    const driver = await findUserById((req.user as IUserPayload)?.id as string);
    if (!driver) {
      throw new ApiError(httpStatus.NOT_FOUND, "Driver not found.");
    }
    driver.isOnline = !driver.isOnline;
    await driver.save();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Driver ${driver.isOnline ? "online" : "offline"} successfully.`,
      data: {
        isDriverOnline: driver.isOnline,
      },
    });
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to toggle driver online status.",
    );
  }
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No token provided.");
  }

  const decoded = jwt.decode(token) as jwt.JwtPayload;
  if (!decoded || !decoded.exp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token.");
  }

  // Save blacklisted token with expiration
  await TokenStore.create({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully.",
    data: null,
  });
});

const UserController = {
  registerUser,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOTP,
  updateUser,
  getSelfInfo,
  deleteUser,
  getWallet,
  changePassword,
  toggleDriverOnlineStatus,
  logoutUser,
};

export { UserController };
