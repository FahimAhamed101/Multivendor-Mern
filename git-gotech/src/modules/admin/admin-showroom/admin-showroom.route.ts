import { Router } from "express";
import { AdminShowroomController } from "./admin-showroom.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

// GET all showrooms — unapproved on top, approved below
router.get(
  "/",
  guardRole(["admin", "manager", "support"]),
  AdminShowroomController.getAllShowrooms
);

// GET single showroom details (with owner info)
router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  AdminShowroomController.getSingleShowroom
);

// PATCH approve a showroom → sends email + push + socket notification
router.patch(
  "/:id/approve",
  guardRole(["admin", "manager", "support"]),
  AdminShowroomController.approveShowroom
);

// PATCH decline a showroom (body: { reason: string }) → sends email + push + socket notification
router.patch(
  "/:id/decline",
  guardRole(["admin", "manager", "support"]),
  AdminShowroomController.declineShowroom
);

export const AdminShowroomRoutes = router;
