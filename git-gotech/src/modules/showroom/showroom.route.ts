import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { ShowroomController } from "./showroom.controller";
import upload from "../../multer/multer";
import { storeValidation } from "../../utils/storeValidation";

const router = Router();

// Get All Showrooms
router.route("/get-all").get(ShowroomController.getAllShowrooms);

// Get My Showrooms
router
  .route("/get")
  .get(guardRole("vendor"), ShowroomController.getMyShowrooms);

// Get Most Selling Product
router
  .route("/most-selling-product")
  .get(guardRole("vendor"), storeValidation, ShowroomController.getMostSellingProduct);

// Add Showroom
router.route("/add").post(guardRole("vendor"), upload.fields([
  { name: "nidImage", maxCount: 1 },
  { name: "ownerImage", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]), ShowroomController.addShowroom);

// Get Vendor Showrooms
router
  .route("/get-vendor-showrooms/:vendorId")
  .get(ShowroomController.getVendorShowrooms);

// Get Showrooms Products
router
  .route("/get-showrooms-products/:showroomId")
  .get(ShowroomController.getShowroomsProducts);

// Update Showroom Info
router
  .route("/update/:id")
  .patch(guardRole("vendor"), upload.fields([
    { name: "nidImage", maxCount: 1 },
    { name: "ownerImage", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]), ShowroomController.updateShowroom);

// Showroom Details
router
  .route("/details/:id")
  .get(guardRole("vendor"), ShowroomController.showroomDetails);

// Delete Showroom
router
  .route("/delete/:id")
  .delete(guardRole("vendor"), ShowroomController.deleteShowroom);

export const ShowroomRouter = router;
