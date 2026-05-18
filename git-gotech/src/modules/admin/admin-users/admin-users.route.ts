import { Router } from "express";
import { AdminUserController } from "./admin-users.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/",
  guardRole(["admin", "manager", "support"]),  
  AdminUserController.getAllUsers
);

router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  AdminUserController.getUserDetails
);

router.post(
  "/:id/toggle-block",
  guardRole(["admin", "manager", "support"]),
  AdminUserController.toggleBlockUser
);

export const AdminUserRoutes = router;
