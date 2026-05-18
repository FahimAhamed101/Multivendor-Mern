import { Router } from "express";
import { AdminCouponController } from "./admin-coupons.controller";
import { guardRole } from "../../../middlewares/roleGuard";
import { CouponsRecordRoutes } from "./coupons-record/coupons-record.route";
import { ERole } from "../../../config/role";

const router = Router();

// Admin Coupons Submodule
router.post(
  "/add",
  guardRole(["admin"]),
  AdminCouponController.createCoupon
);

// Get All Coupons
router.get(
  "/list",
  guardRole([...ERole]),
  AdminCouponController.getAllCoupons
);

// Get Single Coupon
router.get(
  "/:id",
  guardRole(["admin"]),
  AdminCouponController.getSingleCoupon
);

// Update Coupon
router.patch(
  "/:id",
  guardRole(["admin"]),
  AdminCouponController.updateCoupon
);

// Delete Coupon
router.delete(
  "/:id",
  guardRole(["admin"]),
  AdminCouponController.deleteCoupon
);

// **************************Coupon Record********************************
// Coupons Record Submodule
router.use("/record", CouponsRecordRoutes);
// **************************Coupon Record********************************

export const AdminCouponRoutes = router;
