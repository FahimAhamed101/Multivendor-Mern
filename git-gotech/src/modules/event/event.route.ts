import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { EventController } from "./event.controller";
import upload from "../../multer/multer";
import { EventValidation } from "./event.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { ERole } from "../../config/role";

const router = Router();

// Add Event
router.route("/add").post(guardRole("customer"), EventController.addEvent);

// Update Event
router.route("/update/:eventId").patch(guardRole("customer"), EventController.updateEvent);

// Get Customer Event
router.route("/get").get(guardRole("customer"), EventController.getEvent);

// Add Product To Specific Event
router
  .route("/product/add")
  .post(guardRole("customer"), EventController.addEventProduct);

// Get Specific Event Products
router
  .route("/product/get/:eventId")
  .get(guardRole("customer"), EventController.getEventProduct);

// Get Customer Member Suggestion
router
  .route("/member/suggestion")
  .get(guardRole("customer"), EventController.getEventMemberSuggestion);

// Get Event Product Size
router
  .route("/size/get-product-size")
  .get(EventController.getEventProductSize);

// Add Event Member
router
  .route("/member/add")
  .post(guardRole("customer"), 
  upload.single("file"), 
  validateRequest(EventValidation.addEventMemberValidation), 
  EventController.addEventMember);

// Add Event Product Size
router
  .route("/size/add")
  .patch(guardRole([...ERole]), EventController.addEventProductSize);

// Get Event Participators
router
  .route("/member/get/:eventId")
  .get(guardRole("customer"), EventController.getEventMembers);

export const EventRoute = router;
