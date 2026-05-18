import { Router } from "express";
import { AdminProductController } from "./admin-products.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/",
  guardRole(["admin", "manager", "support"]),
  AdminProductController.getAllProducts
);

router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  AdminProductController.getProductDetails
);

router.patch(
  "/:id/private",
  guardRole(["admin", "manager", "support"]),
  AdminProductController.togglePrivateStatus
);

export const AdminProductRoutes = router;
