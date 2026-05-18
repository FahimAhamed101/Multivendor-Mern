import { Router } from "express";
import { AdminPaymentController } from "./admin-payment.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/withdraw",
  guardRole(["admin"]),
  AdminPaymentController.getAllWithdrawRequests
);

router.get(
  "/withdraw/:id",
  guardRole(["admin"]),
  AdminPaymentController.getWithdrawDetails
);

router.patch(
  "/withdraw/approve/:id",
  guardRole(["admin"]),
  AdminPaymentController.approveWithdraw
);

router.patch(
  "/withdraw/reject/:id",
  guardRole(["admin"]),
  AdminPaymentController.rejectWithdraw
);

export const AdminPaymentRoutes = router;
