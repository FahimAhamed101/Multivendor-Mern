import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { PlatformSettingController } from "./platform-setting.controller";

const router = Router()

router.patch("/",
    guardRole("admin"),
    PlatformSettingController.updatePlatformSetting
)

router.get("/",
    guardRole("admin"),
    PlatformSettingController.getPlatformSetting
)

export const PlatformSettingRoutes = router;