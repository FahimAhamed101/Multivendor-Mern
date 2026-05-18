import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { ProductController } from "./product.controller";
import { storeValidation } from "../../utils/storeValidation";
import upload from "../../multer/multer";
import { ProductValidation } from "./product.validation.";
import { validateRequest } from "../../middlewares/validateRequest";
import { ERole } from "../../config/role";

const router = Router();

// Vendor Products Get
router
  .route("/")
  .get(guardRole("vendor"), storeValidation, ProductController.getProducts);

// Add Products
router
  .route("/add")
  .post(guardRole("vendor"), storeValidation, upload.array("files"), validateRequest(ProductValidation.productAddValidationSchema), ProductController.addProduct);

// Edit Products
router
  .route("/edit/:productId")
  .patch(guardRole("vendor"), storeValidation, upload.array("files"), validateRequest(ProductValidation.updateProductValidationSchema), ProductController.editProduct);

// Details Products
router
  .route("/details/:productId")
  .get(ProductController.detailsProduct);

// Delete Products
router
  .route("/delete/:productId")
  .delete(
    guardRole("vendor"),
    storeValidation,
    ProductController.deleteProduct,
  );

// Customer Products
router
  .route("/customer")
  .get(guardRole([...ERole]), ProductController.getCustomerProducts);

// Customer Details Products
router.get(
  "/categorie/get",
  guardRole("admin"),
  ProductController.getCategories,
);

// Customer Details Products
router
  .route("/customer/details/:productId")
  .get(ProductController.detailsCustomerProduct);

// Customer Reviews Products
router
  .route("/customer/reviews/:productId")
  .get(ProductController.detailsCustomerProductReviews);

// Customer Save Products
router
  .route("/customer/save")
  .post(guardRole("customer"), ProductController.saveProduct);

// Customer Save Products Get
router
  .route("/customer/save")
  .get(guardRole("customer"), ProductController.saveProductGet);

  // Update Save Product
  router
    .route("/customer/update-save/:productId")
    .patch(guardRole("customer"), ProductController.updateSaveProduct);

// Customer Save Products Delete
router
  .route("/customer/delete-save/:productId")
  .delete(guardRole("customer"), ProductController.saveProductDelete);

export const ProductRoute = router;
