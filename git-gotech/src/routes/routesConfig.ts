import { UserRoutes } from "../modules/user/user.route";
import { NotificationRoutes } from "../modules/notifications/notification.route";
import { SupportRoutes } from "../modules/support/support.route";
import { ShowroomRouter } from "../modules/showroom/showroom.route";
import { ProductRoute } from "../modules/product/product.route";
import { OrderRoute } from "../modules/orders/order.route";
import { EventRoute } from "../modules/event/event.route";
import { ReviewRoute } from "../modules/reviews/review.route";
import { VendorRouter } from "../modules/vendor/vendor.route";
import { CareerRouter } from "../modules/career/career.route";
import { HomeRouter } from "../modules/home/home.route";
import { DeliveryRequestRoute } from "../modules/delivery-request/delivery-request.route";
import ChatRoutes from "../modules/chat/chat.routes";
import { TransactionRoute } from "../modules/transaction/transaction.route";
import { SettingsRoutes } from "../modules/settings/settings.routes";
import { PaymentCardRoutes } from "../modules/payment-card/payment-card.route";
import { WithdrawRoutes } from "../modules/withdraw/withdraw.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { AdminRouteConfig } from "../modules/admin/adminRouteConfig";
import { CustomerSupportRoutes } from "../modules/customer-support/support.route";
import { DocumentRoutes } from "../modules/document/document.route";
import { PlatformSettingRoutes } from "../modules/platform-settings/platform-setting.route";

export const routesConfig = [
  { path: "/api/v1/auth", handler: UserRoutes },
  { path: "/api/v1/setting", handler: SettingsRoutes },
  { path: "/api/v1/notification", handler: NotificationRoutes },
  { path: "/api/v1/support", handler: SupportRoutes },
  { path: "/api/v1/admin", handler: AdminRouteConfig },
  { path: "/api/v1/showroom", handler: ShowroomRouter },
  { path: "/api/v1/product", handler: ProductRoute },
  { path: "/api/v1/order", handler: OrderRoute },
  { path: "/api/v1/event", handler: EventRoute },
  { path: "/api/v1/review", handler: ReviewRoute },
  { path: "/api/v1/vendor", handler: VendorRouter },
  { path: "/api/v1/career", handler: CareerRouter },
  { path: "/api/v1/home", handler: HomeRouter },
  { path: "/api/v1/delivery-request", handler: DeliveryRequestRoute },
  { path: "/api/v1/chat", handler: ChatRoutes },
  { path: "/api/v1/transaction", handler: TransactionRoute },
  { path: "/api/v1/payment-card", handler: PaymentCardRoutes },
  { path: "/api/v1/withdraw", handler: WithdrawRoutes },
  { path: "/api/v1/payment", handler: PaymentRoutes },
  { path: "/api/v1/support", handler: CustomerSupportRoutes },
  { path: "/api/v1/document", handler: DocumentRoutes },
  { path: "/api/v1/platform-setting", handler: PlatformSettingRoutes },
  //------>publishing app <--------------
  // { path: "/privacy-policy-page", handler: htmlRoute },
  // { path: "/app-instruction", handler: AppInstruction },
];
