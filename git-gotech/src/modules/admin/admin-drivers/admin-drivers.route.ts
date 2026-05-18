import { Router } from "express";
import { AdminDriverController } from "./admin-drivers.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/",
  guardRole(["admin", "manager", "support"]),
  AdminDriverController.getAllDrivers
);

router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  AdminDriverController.getDriverDetails
);

router.post(
  "/:id/toggle-block",
  guardRole(["admin", "manager", "support"]),
  AdminDriverController.toggleBlockDriver
);

export const AdminDriverRoutes = router;
