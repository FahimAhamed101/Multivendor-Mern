import express from "express";
import {
  adminSendPushNotification,
  getMyNotification,
  getUnreadBadgeCount,
  readNotification,
} from "./notification.controller";
import { guardRole } from "../../middlewares/roleGuard";
import { ERole } from "../../config/role";

const router = express.Router();

router.get("/", guardRole([...ERole]), getMyNotification);
router.get("/badge-count", guardRole([...ERole]), getUnreadBadgeCount);
router.post("/send-push", guardRole("admin"), adminSendPushNotification);
router.post("/read", guardRole([...ERole]), readNotification);

export const NotificationRoutes = router;
