import { Router } from "express";
import { AdminVendorController } from "./admin-vendors.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/",
  guardRole(["admin", "manager", "support"]),
  AdminVendorController.getAllVendors
);

router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  AdminVendorController.getVendorDetails
);

router.post(
  "/:id/toggle-top",
  guardRole(["admin", "manager", "support"]),
  AdminVendorController.toggleTopVendor
);

router.post(
  "/:id/toggle-block",
  guardRole(["admin", "manager", "support"]),
  AdminVendorController.toggleBlockVendor
);

export const AdminVendorRoutes = router;
