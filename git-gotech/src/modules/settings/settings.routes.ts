import { Router } from "express";
import { SettingController } from "./settings.controller";
import { guardRole } from "../../middlewares/roleGuard";

const router = Router();
router.get("/generals", SettingController.getSettingGenerals);
router.post("/generals", guardRole("admin"), SettingController.updateGenerals);

router.get("/:key", SettingController.getSetting);
router.post("/:key", guardRole("admin"), SettingController.createOrUpdate);

export const SettingsRoutes = router;
