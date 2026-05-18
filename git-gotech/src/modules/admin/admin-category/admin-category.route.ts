// Add Category
import { Router } from "express";
import { guardRole } from "../../../middlewares/roleGuard";
import upload from "../../../multer/multer";
import { validateRequest } from "../../../middlewares/validateRequest";
import { AdminValidation } from "../admin.validation";
import { ProductController } from "../../product/product.controller";

const router = Router();

// Add Category
router.post(
    "/add",
    guardRole("admin"),
    upload.single("file"),
    validateRequest(AdminValidation.createCategory),
    ProductController.addCategory,
);

// Update Category
router.patch(
    "/update/:categoryId",
    guardRole("admin"),
    upload.single("file"),
    validateRequest(AdminValidation.updateCategory),
    ProductController.updateCategory,
);

// Delete Category
router.delete(
    "/delete/:categoryId",
    guardRole("admin"),
    ProductController.deleteCategory,
);

// Get All Categories
router.get(
    "/get",
    ProductController.getCategories,
);

export const AdminCategoryRoutes = router;