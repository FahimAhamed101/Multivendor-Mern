import { Router } from "express";
import { CouponsRecordController } from "./coupons-record.controller";
import { guardRole } from "../../../../middlewares/roleGuard";

const router = Router();

router.post(
  "/take",
  guardRole(["customer"]),
  CouponsRecordController.takeCoupon
);

router.get(
  "/my",
  guardRole(["customer"]),
  CouponsRecordController.getMyCoupons
);

router.get(
  "/:id",
  guardRole(["customer"]),
  CouponsRecordController.getSingleCouponRecord
);

// router.patch(
//   "/toggle-use",
//   guardRole(["customer"]),
//   CouponsRecordController.toggleUseCoupon
// );

// Validate Customer Coupon
router.post(
  "/validate",
  guardRole(["customer"]),
  CouponsRecordController.validateCoupon
);

export const CouponsRecordRoutes = router;
