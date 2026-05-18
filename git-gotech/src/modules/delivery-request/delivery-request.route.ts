import express from "express";
import { DeliveryRequestController } from "./delivery-request.controller";
import { DeliveryRequestValidation } from "./delivery-request.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { guardRole } from "../../middlewares/roleGuard";
import { ERole, TRole } from "../../config/role";
import upload from "../../multer/multer";

const router = express.Router();

// Route for users to create a delivery request
router.post(
  "/",
  guardRole([...ERole]), // Adjust roles as appropriate
  upload.array("images"), // 'images' is the field name, max 5 uploads
  // Note: when using form-data, req.body variables are usually parsed first, validateRequest works for simple or pre-parsed data. We can either parse the form data beforehand, or slightly adapt the schema for string constraints.
  validateRequest(DeliveryRequestValidation.createDeliveryRequestSchema), // Bypassing strict Zod validation middleware for now because form-data parse is handled in controller mapping logic, otherwise it requires a customized formData validation middleware.
  DeliveryRequestController.createDeliveryRequest
);

// Route for drivers to view delivery requests
router.get(
  "/driver",
  guardRole(["driver", "admin", ]),
  DeliveryRequestController.getDeliveryRequestsForDriver
);

// // Get All Delivery Request By User
router.get(
  "/user",
  guardRole(["customer", "admin"]),
  DeliveryRequestController.getDeliveryRequestsByUser
);

// Route for drivers to update delivery request status
router.patch(
  "/:id/status",
  guardRole(["driver", "admin"]),
  validateRequest(DeliveryRequestValidation.updateDeliveryRequestStatusSchema),
  DeliveryRequestController.changeDeliveryRequestStatus
);

export const DeliveryRequestRoute = router;
