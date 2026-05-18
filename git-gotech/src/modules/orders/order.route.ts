import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { OrderController } from "./order.controller";
import { storeValidation } from "../../utils/storeValidation";
import upload from "../../multer/multer";
import { CustomOrdersValidation } from "./customOrders.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { ERole } from "../../config/role";
import { ReturnOrderValidation } from "./returnOrder.validation";

const router = Router();

// Add Vendor Order
router
  .route("/vendor/add")
  .post(guardRole("customer"), OrderController.addOrder);

// Get Vendor Order
router
  .route("/vendor/get")
  .get(guardRole("vendor"), storeValidation, OrderController.getShowroomOrder);

// Get Vendor Return Order
router
  .route("/vendor/return")
  .get(guardRole("vendor"), OrderController.getShowroomReturn);

// Get Vendor Custom Order
router
  .route("/vendor/custom")
  .get(guardRole("vendor"), OrderController.getShowroomCustomOrder);

// Vendor Return Details
router
  .route("/vendor/return-details/:orderId")
  .get(
    guardRole([...ERole]),
    OrderController.vendorReturnOrderDetails,
  );

// Vendor Order Details
router
  .route("/vendor/details/:orderId")
  .get(
    guardRole([...ERole]),
    OrderController.vendorOrderDetails,
  );

// Vendor Custom Order Details
router
  .route("/vendor/custom-details/:orderId")
  .get(
    guardRole([...ERole]),
    OrderController.customOrderDetails,
  );

// Vendor Order Action
router
  .route("/vendor/action/:orderId")
  .patch(
    guardRole("vendor"),
    storeValidation,
    OrderController.vendorOrderAction,
  );

// Vendor Return Action
router
  .route("/vendor/return-action")
  .patch(guardRole("vendor"), OrderController.vendorReturnAction);

// Vendor Design Request Action
router
  .route("/vendor/design-request/action/:orderId")
  .patch(
    guardRole("vendor"),
    storeValidation,
    OrderController.customDesignAction,
  );

// Vendor Change Custom Order Status
router
  .route("/vendor/custom/change-status/:orderId")
  .patch(
    guardRole("vendor"),
    storeValidation,
    OrderController.vendorChangeCustomOrderStatus,
  );

// Accept Customer Design Request
router
  .route("/customer/design-request/accept/:orderId")
  .patch(
    guardRole("customer"),
    OrderController.acceptCustomOrderByCustomer,
  );

// Add Custom Order
router
  .route("/custom/add")
  .post(
    guardRole("customer"),
    upload.array("files", 10),
    validateRequest(CustomOrdersValidation.createCustomOrderValidationSchema),
    OrderController.addCustomOrder
  );

// Get Customer Main Order
router
  .route("/customer/main/get")
  .get(guardRole("customer"), OrderController.getMainOrders);

// Get Customer Return Order
router
  .route("/customer/return/get")
  .get(guardRole("customer"), OrderController.getReturnOrders);

// Get Customer Custom Order
router
  .route("/customer/custom/get")
  .get(guardRole("customer"), OrderController.getCustomOrders);

// Add Return Order
router
  .route("/return/add/:orderId")
  .post(guardRole("customer"), upload.array("files"), validateRequest(ReturnOrderValidation.createReturnOrderValidationSchema), OrderController.addReturn);

// Get Vendor Order
router
  .route("/driver/request")
  .get(guardRole("driver"), OrderController.getDriverOrderVendor);

// Get Custom Order
router
  .route("/custom/driver")
  .get(guardRole("driver"), OrderController.getDriverOrderCustom);

// Get Return Order
router
  .route("/return/driver")
  .get(guardRole("driver"), OrderController.getDriverOrderReturn);

// Driver Accept Order
router
  .route("/driver/action/accept/:orderId")
  .patch(guardRole("driver"), OrderController.acceptByDriver);

// Driver Pick Up Order
router
  .route("/driver/action/pick-up/:orderId")
  .patch(guardRole("driver"), OrderController.pickUpByDriver);

// Driver Delivered Order
router
  .route("/driver/action/delivered/:orderId")
  .patch(guardRole("driver"), OrderController.deliveredByDriver);

// Get Driver Delivery Request
router
  .route("/driver/delivery-request")
  .get(guardRole("driver"), OrderController.getDriverDeliveryRequest);

// Get Single Order Details By The Type
router
  .route("/get/:id")
  .get(guardRole("driver"), OrderController.getDriverOrderDetailsByType);

export const OrderRoute = router;
