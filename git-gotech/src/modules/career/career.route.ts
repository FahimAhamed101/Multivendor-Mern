import { Router } from "express";
import { CareerController } from "./career.controller";
import upload from "../../multer/multer";
import { guardRole } from "../../middlewares/roleGuard";
import { ERole } from "../../config/role";

const router = Router();
router.route("/apply/:jobId").post(guardRole([...ERole]),upload.any(), CareerController.applyJob);
router.route("/get").get(CareerController.getJobs);
router.route("/get/details/:jobId").get(CareerController.getJobDetails);
export const CareerRouter = router;
