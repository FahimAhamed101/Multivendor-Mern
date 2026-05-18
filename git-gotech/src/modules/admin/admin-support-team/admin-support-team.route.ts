import { Router } from "express";
import { AdminSupportTeamController } from "./admin-support-team.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
    "/",
    guardRole(["admin"]),
    AdminSupportTeamController.getAllSupport
);

router.get(
    "/:id",
    guardRole(["admin"]),
    AdminSupportTeamController.getSupportDetails
);

router.post(
    "/add",
    guardRole(["admin"]),
    AdminSupportTeamController.addSupport
);

router.patch(
    "/:id/toggle-block",
    guardRole(["admin"]),
    AdminSupportTeamController.toggleBlockSupport
);

export const AdminSupportTeamRoutes = router;
