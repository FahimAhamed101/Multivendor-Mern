import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { SupportController } from "./support.controller";
import { ERole } from "../../config/role";
import upload from "../../multer/multer";
import { validateRequest } from "../../middlewares/validateRequest";
import { SupportValidation } from "./support.validation";

const router = Router();

// Initialize support chat (any logged-in user can)
router.post(
  "/init",
  guardRole([...ERole]),
  upload.array("attachments"),
  validateRequest(SupportValidation.initSupportChatValidation),
  SupportController.initSupportChat
);

// Get support chats list (Role-aware: staff see all, customers see their own active)
router.get(
  "/list",
  guardRole([...ERole]),
  SupportController.getSupportChats
);

// Get messages for a specific chat
router.get(
  "/messages/:chatId",
  guardRole([...ERole]),
  SupportController.getSupportMessages
);

// Send a message in an existing chat
router.post(
  "/message/:chatId",
  guardRole([...ERole]),
  upload.array("attachments"),
  validateRequest(SupportValidation.sendSupportMessageValidation),
  SupportController.sendSupportMessage
);

// Mark chat as resolved (Staff only)
router.patch(
  "/resolve/:chatId",
  guardRole(["admin", "manager", "support"]),
  SupportController.resolveSupportChat
);

export const CustomerSupportRoutes = router;
