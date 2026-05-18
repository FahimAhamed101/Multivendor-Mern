import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { TransactionController } from "./transaction.controller";

const router = Router();

// Get current user's wallet transaction history
router.get(
  "/my-wallet",
  guardRole(["customer", "vendor", "driver", "admin"]),
  TransactionController.getMyWalletTransactions
);

export const TransactionRoute = router;
