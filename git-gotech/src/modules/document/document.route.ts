import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { DocumentController } from "./document.controller";
import upload from "../../multer/multer";
import { validateRequest } from "../../middlewares/validateRequest";
import { DocumentValidation } from "./document.validation";

const router = Router();

router.post(
  "/",
  guardRole(["driver"]),
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
    { name: "dlFront", maxCount: 1 },
    { name: "dlBack", maxCount: 1 },
    { name: "vlFront", maxCount: 1 },
    { name: "vlBack", maxCount: 1 },
    { name: "vehicleImage", maxCount: 1 },
    { name: "insuranceFile", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  validateRequest(DocumentValidation.addOrUpdateDocumentValidation),
  DocumentController.addOrUpdateDocument
);

router.get(
  "/my-documents",
  guardRole(["driver"]),
  DocumentController.getMyDocument
);

router.get(
  "/:id",
  guardRole(["admin", "manager", "support"]),
  DocumentController.getDocumentByDriverId
);

export const DocumentRoutes = router;
