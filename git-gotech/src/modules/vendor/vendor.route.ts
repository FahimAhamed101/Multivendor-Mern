import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { VendorController } from "./vendor.controller";
import { validateTCDesign } from "./design.validation";
import { storeValidation } from "../../utils/storeValidation";
import { ProductController } from "../product/product.controller";
import { ERole } from "../../config/role";

const router = Router();

router
  .route("/get")
  .get(guardRole("customer"), VendorController.getAllVendorForCustomer);

router
  .route("/showroom/get/:vendorId")
  .get(guardRole(ERole), VendorController.getVendorShowroom);

router
  .route("/product/get/:showroomId")
  .get(guardRole(ERole), VendorController.getShowroomProducts);

router
  .route("/product/custom-design/:productId")
  .post(
    guardRole(ERole),
    validateTCDesign,
    VendorController.addDesignRequest,
  );

router
  .route("/dashboard/stacks")
  .get(
    guardRole("vendor"),
    storeValidation,
    VendorController.vendorDashboardStacks,
  );
export const VendorRouter = router;
