import { Router } from "express";
import { AdminManagerController } from "./admin-managers.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/",
  guardRole(["admin"]),
  AdminManagerController.getAllManagers
);

router.get(
  "/:id",
  guardRole(["admin"]),
  AdminManagerController.getSingleManager
);

router.post(
  "/add",
  guardRole(["admin"]),
  AdminManagerController.addManager
);

router.patch(
  "/:id/toggle-block",
  guardRole(["admin"]),
  AdminManagerController.toggleBlockManager
);

export const AdminManagerRoutes = router;
