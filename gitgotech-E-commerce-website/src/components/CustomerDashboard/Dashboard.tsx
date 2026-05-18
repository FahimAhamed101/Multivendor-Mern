"use client";
import url from "@/redux/api/baseUrl";
import {
  useGetCustomerMainOrdersQuery,
  useGetCustomerReturnOrdersQuery,
} from "@/redux/features/order/orderSlice";
import { useAddProductReviewMutation } from "@/redux/features/review/reviewSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "returns">("orders");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productRating, setProductRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [productReview, setProductReview] = useState("");
  const [driverReview, setDriverReview] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PAGE_SIZE = 10;
  const router = useRouter();

  const { data: mainOrderData, isFetching: mainOrdersFetching } =
    useGetCustomerMainOrdersQuery({
      page: ordersPage,
      limit: ORDERS_PAGE_SIZE,
    });
  const { data: returnOrderData } = useGetCustomerReturnOrdersQuery({});

  const [reviewProduct] = useAddProductReviewMutation();



  const mainPagination = (mainOrderData as { pagination?: {
    totalPage?: number;
    currentPage?: number;
    prevPage?: number;
    nextPage?: number;
    totalData?: number;
  } })?.pagination;

  const totalOrderPages = Math.max(1, mainPagination?.totalPage ?? 1);
  const totalOrdersCount = mainPagination?.totalData ?? 0;

  const orders =
    mainOrderData?.data?.map((order: any) => ({
      id: order.id,
      productName: order.name,
      brand: order.showroom_name,
      image: order.product_images?.[0] || "/images/jacket.png",
      price: order.price?.amount || 0,
      quantity:
        order.size?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 1, // ← sum all size quantities
      otp: "N/A",
      total:
        (order.price?.amount || 0) +
        (order.price?.tip || 0) +
        (order.price?.tax || 0) +
        (order.price?.deliveryCharge || 0) -
        (Number(order.price?.coupon) || 0),
      status: order.status,
      hasReview: false,
      productId: order.productId || null,
      size: order.size,
    })) || [];

  // Transform API data for returns
  const returns =
    returnOrderData?.data?.map((order: any) => ({
      id: order._id,
      productName: order.product?.product_name || "Product",
      brand: order.showroom?.showroom_name || "Vendor",
      image:
        order.product?.product_images?.[0] ||
        order.showroom?.showroom_image ||
        "/images/jacket.png",
      price: order.price?.amount || 0,
      quantity: 1,
      otp: "N/A",
      total:
        (order.price?.amount || 0) +
        (order.price?.tip || 0) +
        (order.price?.deliveryCharge || 0),
      status: order.status,
      hasReview: false,
      productId: order.product?._id,
    })) || [];

  interface Order {
    id: number;
    productName: string;
    brand: string;
    image: string;
    price: number;
    quantity: number;
    otp: string;
    total: number;
    status:
      | "Completed"
      | "Ready for Pickup"
      | "Picked Up"
      | "Cancelled"
      | "Return Opened"
      | "Delivered"
      | "Order Placed"
      | "Driver Accepted"
      | "Processing"
      | "Return Completed"
      | "Rejected"
      | "Returned"
      | "Return Accepted"
      | "Return Declined";
    hasReview: boolean;
    productId?: string | null;
    size?: any[];
  }

  const handleLeaveReview = (order: Order): void => {
    setSelectedOrder(order);
    setShowReviewModal(true);
    setProductRating(0);
    setDriverRating(0);
    setProductReview("");
    setDriverReview("");
  };

  const handleReward = (order: Order): void => {
    setSelectedOrder(order);
    setShowRewardModal(true);
    setRewardAmount("");
  };

  const handleSubmitReward = () => {
    console.log({
      type: "Reward",
      orderId: selectedOrder?.id,
      productName: selectedOrder?.productName,
      amount: rewardAmount,
    });
    setShowRewardModal(false);
  };

  const handleSubmitReviews = async (orderId: string | number) => {
    console.log(orderId);
    const data = {
      driver: {
        rating: driverRating,
        comment: driverReview,
      },
      product: {
        rating: productRating,
        comment: productReview,
      },
    };
    console.log(data);

    try {
      const res = await reviewProduct({ body: data, id: orderId }).unwrap();
      console.log(res);
      if (res.success) {
        toast.success("Review submitted successfully!");
      } 
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        (error as { data?: { message?: string } }).data?.message;
      toast.error(
        typeof apiMessage === "string" && apiMessage
          ? apiMessage
          : "Failed to submit review. Please try again.",
      );
    }

    setShowReviewModal(false);
  };

  const StarRating = ({
    rating,
    onRate,
  }: {
    rating: number;
    onRate: (star: number) => void;
  }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className="text-3xl transition-transform hover:scale-110"
          >
            {star <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen md:mt-24 mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
  <Toaster position="top-right" />
      {/* Header */}
      <div className="container mx-auto mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">
          My Dashboard
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          View all of your order history and keep track of your shopping.
        </p>
      </div>
      <div
        className="container mx-auto flex justify-end"
        onClick={() => router.push("/customer-dashboard/delivery-request")}
      >
        <button className="bg-blue-600 px-4 py-1.5 rounded cursor-pointer">
          delivery request
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-center">
          <button
            onClick={() => {
              setActiveTab("orders");
              setOrdersPage(1);
            }}
            className={`px-8 py-2.5 rounded shadow-2xl text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-8 py-2.5 rounded shadow-2xl text-sm font-medium transition-all ${
              activeTab === "returns"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Returns
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {(activeTab === "orders" ? orders : returns).map((order: Order) => (
          <div
            key={order.id}
            className="bg-gradient-to-br from-gray-900/50 to-purple-900/10 border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {/* Product Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                <img
                  src={`${url}/${order.image}`}
                  alt={order.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/jacket.png";
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 w-full md:w-auto">
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  {order.productName}
                </h3>
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span className="text-purple-400 text-xs md:text-sm">👑</span>
                  <span className="text-gray-400 text-xs md:text-sm">
                    {order.brand}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
                  <span className="text-white">₵{order.price}</span>
                  <span className="text-gray-400">Qty: {order.quantity}</span>
                </div>
              </div>

              {/* Right Side - Status & Actions */}
              <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 md:gap-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {order.status === "Delivered" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  )}
                  {order.status === "Order Placed" && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      Order Placed
                    </span>
                  )}
                  {order.status === "Driver Accepted" && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                      Driver Accepted
                    </span>
                  )}
                  {order.status === "Ready for Pickup" && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      Ready for Pickup
                    </span>
                  )}
                  {order.status === "Processing" && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      Processing
                    </span>
                  )}
                  {order.status === "Rejected" && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                      Rejected
                    </span>
                  )}
                  {order.status === "Returned" && (
                    <span className="px-3 py-1 bg-red-500/20 text-[#00DD00] rounded-full text-xs font-medium">
                      Returned
                    </span>
                  )}
                  {order.status === "Return Accepted" && (
                    <span className="px-3 py-1 bg-red-500/20 text-[#0B6A99] rounded-full text-xs font-medium">
                      Return Accepted
                    </span>
                  )}
                  {order.status === "Return Declined" && (
                    <span className="px-3 py-1 bg-red-500/20 text-[#CC1247] rounded-full text-xs font-medium">
                      Return Declined
                    </span>
                  )}
                </div>

                {/* OTP & Total */}
                <div className="text-right w-full md:w-auto">
                  <div className="text-xs md:text-sm text-gray-400 mb-1">
                    OTP: {order.otp}
                  </div>
                  <div className="text-sm md:text-base font-semibold">
                    Total: ₵{order.total?.toFixed(2)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                  {/* Delivered: Show Trip Driver, Review Product, View Details */}
                  {order.status === "Delivered" && (
                    <>
                      <button
                        onClick={() => handleReward(order as Order)}
                        className="px-4 md:px-6 py-2 cursor-pointer bg-[#912DAD] hover:bg-purple-700 rounded-full text-sm font-medium transition-colors"
                      >
                        Trip Driver
                      </button>
                      <button
                        onClick={() => handleLeaveReview(order as Order)}
                        className="px-4 md:px-6 py-2 cursor-pointer bg-[#03AB35] rounded-full text-sm font-medium transition-colors"
                      >
                        Review Product
                      </button>
                    </>
                  )}

                  {/* Driver Accepted: Show Trip Driver */}
                  {order.status === "Driver Accepted" && (
                    <button
                      onClick={() => handleReward(order as Order)}
                      className="px-4 md:px-6 py-2 cursor-pointer bg-[#912DAD] hover:bg-purple-700 rounded-full text-sm font-medium transition-colors"
                    >
                      Trip Driver
                    </button>
                  )}

                  {/* Ready for Pickup: Show Trip Driver */}
                  {order.status === "Ready for Pickup" && (
                    <button
                      onClick={() => handleReward(order as Order)}
                      className="px-4 md:px-6 py-2 cursor-pointer bg-[#912DAD] hover:bg-purple-700 rounded-full text-sm font-medium transition-colors"
                    >
                      Trip Driver
                    </button>
                  )}

                  {/* View Details - Show for all statuses */}
                  <Link href={`/customer-dashboard/details/${order.id}`}>
                    <button className="px-4 md:px-6 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 rounded-full text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeTab === "orders" &&
        (totalOrderPages > 1 || totalOrdersCount > ORDERS_PAGE_SIZE) && (
        <div className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-300">
          <p>
            Page{" "}
            <span className="text-white font-medium">
              {mainPagination?.currentPage ?? ordersPage}
            </span>{" "}
            of <span className="text-white font-medium">{totalOrderPages}</span>
            {totalOrdersCount > 0 && (
              <span className="text-gray-500">
                {" "}
                ({totalOrdersCount} orders)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={ordersPage <= 1 || mainOrdersFetching}
              onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={
                ordersPage >= totalOrderPages || mainOrdersFetching
              }
              onClick={() =>
                setOrdersPage((p) => Math.min(totalOrderPages, p + 1))
              }
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Profile Icon - Top Right */}
      <div className="fixed top-4 right-4 md:top-8 md:right-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      {/* Review Modal */}
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 mt-16 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              className="float-right text-white hover:text-purple-400 transition-colors"
            >
              <svg
                className="w-6 h-6 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Rate Your Experience
            </h2>

            {/* Product Rating Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white text-center mb-4">
                Product Rating
              </h3>
              <div className="flex justify-center mb-4">
                <StarRating rating={productRating} onRate={setProductRating} />
              </div>
              <p className="text-purple-400 text-center text-sm mb-4">
                How satisfied are you with product quality?
              </p>
              <textarea
                value={productReview}
                onChange={(e) => setProductReview(e.target.value)}
                placeholder="Write your review"
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[120px] resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-purple-500/20 mb-8" />

            {/* Driver Rating Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white text-center mb-4">
                Driver Rating
              </h3>
              <div className="flex justify-center mb-4">
                <StarRating rating={driverRating} onRate={setDriverRating} />
              </div>
              <p className="text-purple-400 text-center text-sm mb-4">
                How was your experience with the driver?
              </p>
              <textarea
                value={driverReview}
                onChange={(e) => setDriverReview(e.target.value)}
                placeholder="Write your review"
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[120px] resize-none"
              />
            </div>

            {/* Single Submit Button */}
            <button
              onClick={() =>
                selectedOrder?.id && handleSubmitReviews(selectedOrder.id)
              }
              className="w-full py-3 cursor-pointer bg-purple-600 hover:bg-purple-700 rounded-full text-white font-semibold transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-3xl p-8 max-w-md w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowRewardModal(false)}
              className="float-right text-white hover:text-purple-400 transition-colors"
            >
              <svg
                className="w-6 h-6 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Reward Content */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Rewards</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-purple-400 text-sm">
                  Support your driver with a reward.
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="Enter Amount"
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-6"
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmitReward}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-lg font-semibold transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
