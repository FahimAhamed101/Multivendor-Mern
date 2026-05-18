import { Router } from "express";
import { AdminCareerController } from "./admin-career.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

router.get(
  "/jobs",
  guardRole(["admin"]),
  AdminCareerController.getAllJobs
);

router.post(
  "/",
  guardRole(["admin"]),
  AdminCareerController.addJob
);

router.patch(
  "/:id",
  guardRole(["admin"]),
  AdminCareerController.updateJob
);

router.get(
  "/applications/:jobId",
  guardRole(["admin"]),
  AdminCareerController.getAllApplications
);

router.get(
  "/applications/:id",
  guardRole(["admin"]),
  AdminCareerController.getApplicationDetails
);

export const AdminCareerRoutes = router;
