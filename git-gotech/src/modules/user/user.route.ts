import express from "express";
import { UserController } from "./user.controller";

import upload from "../../multer/multer";
import { guardRole } from "../../middlewares/roleGuard";
import { DocumentController } from "../document/document.controller";
import { ERole } from "../../config/role";
const router = express.Router();

// Register a User
router.post("/register", upload.single("image"), UserController.registerUser);

// Login
router.post("/login", UserController.loginUser);

// Forget Password
router.post("/forget-password", UserController.forgotPassword);

// Reset Password
router.post("/reset-password", UserController.resetPassword);

// Verify OTP
router.post("/verify-otp", UserController.verifyOTP);

// Resend OTP
router.post("/resend-otp", UserController.resendOTP);

// Change Password
router.post(
  "/change-password",
  guardRole([...ERole]),
  UserController.changePassword,
);

// Update Profile
router.patch(
  "/profile-update",
  upload.single("image"),
  guardRole([...ERole]),
  UserController.updateUser,
);

// Get Me
router.get(
  "/my-profile",
  guardRole([...ERole]),
  UserController.getSelfInfo,
);

// Get Wallet & Transaction
router.get(
  "/wallet",
  guardRole([...ERole]),
  UserController.getWallet,
);

// Toggle Driver Online Status
router.patch(
  "/toggle-online-status",
  guardRole(["driver"]),
  UserController.toggleDriverOnlineStatus,
);

// Delete Account
router.delete(
  "/account-delete",
  guardRole([...ERole]),
  UserController.deleteUser,
);
// Logout
router.post(
  "/logout",
  guardRole([...ERole]),
  UserController.logoutUser,
);

export const UserRoutes = router;
