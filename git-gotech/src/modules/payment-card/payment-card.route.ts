import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { storePaymentCardSchema } from "./payment-card.validation";
import { PaymentCardController } from "./payment-card.controller";
import { guardRole } from "../../middlewares/roleGuard";
import { ERole } from "../../config/role";

const router = Router();

// Store Card Info
router.post(
  "/store-card-info",
  guardRole([...ERole]),
  validateRequest(storePaymentCardSchema),
  PaymentCardController.storePaymentCardInfo
);

// Get User Wise All Card Info
router.get(
  "/get-all-card-info",
  guardRole([...ERole]),
  PaymentCardController.getAllCardInfo
);

// Get Single Card Info
router.get(
  "/single-card-info",
  guardRole([...ERole]),
  PaymentCardController.getSingleCardInfo
);

// Delete Single Card Info
router.delete(
  "/delete-card-info",
  guardRole([...ERole]),
  PaymentCardController.deleteSingleCardInfo
);

export const PaymentCardRoutes = router;
