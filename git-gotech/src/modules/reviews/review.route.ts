import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { ReviewController } from "./review.controller";

const router = Router();

// Add Review
router
  .route("/add/:orderId")
  .patch(guardRole("customer"), ReviewController.addReview);

// Get Product Reviews
router.get("/product/:id", ReviewController.getProductReviews);

// Get Driver(Self) Reviews
router.get(
  "/driver/self",
  guardRole(["driver"]),
  ReviewController.getDriverSelfReviews,
);
// Get Driver Reviews
router.get("/driver/:id", ReviewController.getDriverReviews);


export const ReviewRoute = router;
