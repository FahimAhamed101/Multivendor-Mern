import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { validateRequest } from "../../middlewares/validateRequest";
import { withdrawRequestSchema } from "./withdraw.validation";
import { WithdrawController } from "./withdraw.controller";

const router = Router();

// Withdraw Request
router.post(
    "/request",
    guardRole(["vendor", "driver", "customer"]),
    validateRequest(withdrawRequestSchema),
    WithdrawController.createWithdrawRequest
);

// Get All Withdraw Request
router.get(
    "/",
    guardRole(["vendor", "driver", "customer"]),
    WithdrawController.getAllWithdrawRequest
);

export const WithdrawRoutes = router;