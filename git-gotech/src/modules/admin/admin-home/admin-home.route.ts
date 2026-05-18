import { Router } from "express";
import { AdminHomeController } from "./admin-home.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/stats",
  guardRole(["admin"]),
  AdminHomeController.getAdminDashboardStats
);

router.get(
  "/yearly-revenue",
  guardRole(["admin"]),
  AdminHomeController.getYearlyRevenue
);

router.get(
  "/user-vendor-ratio",
  guardRole(["admin"]),
  AdminHomeController.getUserVendorRatio
);

router.get(
  "/recent-users",
  guardRole(["admin"]),
  AdminHomeController.getRecentUsers
);

router.get(
  "/recent-vendors",
  guardRole(["admin"]),
  AdminHomeController.getRecentVendors
);

export const AdminHomeRoutes = router;
