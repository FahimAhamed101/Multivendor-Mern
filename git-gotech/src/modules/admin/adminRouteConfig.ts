import { Router } from "express";
import { AdminCategoryRoutes } from "./admin-category/admin-category.route";
import { AdminHomeRoutes } from "./admin-home/admin-home.route";
import { AdminUserRoutes } from "./admin-users/admin-users.route";
import { AdminVendorRoutes } from "./admin-vendors/admin-vendors.route";
import { AdminDriverRoutes } from "./admin-drivers/admin-drivers.route";
import { AdminProductRoutes } from "./admin-products/admin-products.route";
import { AdminManagerRoutes } from "./admin-managers/admin-managers.route";
import { AdminSupportTeamRoutes } from "./admin-support-team/admin-support-team.route";
import { AdminCouponRoutes } from "./admin-coupons/admin-coupons.route";
import { AdminCareerRoutes } from "./admin-career/admin-career.route";
import { AdminPaymentRoutes } from "./admin-payment/admin-payment.route";
import { AdminRequestRoutes } from "./admin-request/admin-request.route";
import { AdminShowroomRoutes } from "./admin-showroom/admin-showroom.route";

const adminRouter = Router();

// Home Dashboard Routes
adminRouter.use("/home", AdminHomeRoutes);

// User Management Routes
adminRouter.use("/users", AdminUserRoutes);

// Vendor Management Routes
adminRouter.use("/vendors", AdminVendorRoutes);

// Driver Management Routes
adminRouter.use("/drivers", AdminDriverRoutes);

// Product Management Routes
adminRouter.use("/products", AdminProductRoutes);

// Manager Management Routes
adminRouter.use("/managers", AdminManagerRoutes);

// Support Team Management Routes
adminRouter.use("/support-team", AdminSupportTeamRoutes);

// Career Management Routes
adminRouter.use("/career", AdminCareerRoutes);

// Payment Management Routes
adminRouter.use("/payment", AdminPaymentRoutes);

// Coupon Management Routes
adminRouter.use("/coupons", AdminCouponRoutes);

// Category Related Routes
adminRouter.use("/category", AdminCategoryRoutes);

// Request Management Routes (Vendor & Driver approval)
adminRouter.use("/requests", AdminRequestRoutes);

// Showroom Management Routes
adminRouter.use("/showrooms", AdminShowroomRoutes);

export const AdminRouteConfig = adminRouter;