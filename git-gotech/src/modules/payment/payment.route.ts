import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { PaymentController } from "./payment.controller";

const router = Router();

// Add Money Routes
router.post("/add-money", guardRole(['vendor', 'customer', 'driver']), PaymentController.addMoney);

// Get Payment Status Route
router.get("/get-payment-status/:referenceId", guardRole(['vendor', 'customer', 'driver']), PaymentController.getPaymentStatus);

export const PaymentRoutes = router;