import { Router } from "express";
import { HomeController } from "./home.controller";

const router = Router();

// Get Category Data 
router.route("/category").get(HomeController.getCategoryData);

// Get Top Vendors Data 
router.route("/top-vendors").get(HomeController.getTopVendors);

// Get Hot Deals Products
router.route("/hot-deals").get(HomeController.getHotDealsProducts);

// Get Top Products
router.route("/top-products").get(HomeController.getTopProducts);

// Get Top Savings Products
router.route("/top-savings").get(HomeController.getTopSavingsProducts);

// Get Newest Products
router.route("/newest-products").get(HomeController.getNewestProducts);

// Get Products By Category
router.route("/products-by-category/:category").get(HomeController.getProductsByCategory);

// Global Search
router.route("/search").get(HomeController.globalSearch);

export const HomeRouter = router;