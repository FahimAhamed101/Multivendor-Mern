"use client";

import {
  useGetVendorOrdersQuery,
  useGetVendorReturnsQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/vendor/order/orderSlice";
import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
  };
  product?: {
    _id: string;
    product_name: string;
  };
  orderStatus: string;
  createdAt: string;
}

interface Return {
  _id: string;
  product?: {
    _id: string;
    product_name: string;
  };
  showroom: {
    _id: string;
    showroom_name: string;
  };
  status: string;
  clientReason: string;
  createdAt: string;
}

const ORDER_STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Ready for Pickup",
  "Driver Accepted",
  "Picked Up",
  "Delivered",
  "Rejected",
];

const ORDER_FILTERS = [
  "All Orders",
  "Order Placed",
  "Processing",
  "Ready for Pickup",
  "Driver Accepted",
  "Picked Up",
  "Delivered",
  "Rejected",
];

const RETURN_FILTERS = [
  "All Returns",
  "Pending",
  "Return Accepted",
  "Return Declined",
  "Refunded",
];

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Filter");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"orders" | "returns">("orders");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const router = useRouter();
  const limit = 10;

  const showroomId = useSelector(selectShowroomId);
  const skipVendorList = !showroomId;

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus({
        id: orderId,
        orderStatus: newStatus,
        showroomId,
      }).unwrap();
      refetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useGetVendorOrdersQuery(
    {
      page: currentPage,
      limit,
      searchQ: searchTerm,
      filter: filterType,
      showroomId: showroomId ?? "",
    },
    { skip: skipVendorList },
  );

  const {
    data: returnsData,
    isLoading: returnsLoading,
    isError: returnsError,
    refetch: refetchReturns,
  } = useGetVendorReturnsQuery(
    {
      page: currentPage,
      limit,
      searchQ: searchTerm,
      filter:
        filterType !== "All Returns" && filterType !== "Filter"
          ? filterType
          : "",
      showroomId: showroomId ?? "",
    },
    { skip: skipVendorList },
  );

  const allOrders: Order[] = ordersData?.data || [];

  const allReturns: Return[] = returnsData?.data || [];

  const meta = activeTab === "orders" ? ordersData?.meta : returnsData?.meta;
  const totalPages =
    typeof meta?.totalPages === "number" && meta.totalPages >= 1
      ? meta.totalPages
      : 1;

  const isLoading = skipVendorList
    ? false
    : activeTab === "orders"
      ? ordersLoading
      : returnsLoading;
  const listError =
    activeTab === "orders" ? ordersError : returnsError;

  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: string } = {
      "Order Placed":
        "bg-yellow-900/30 text-yellow-500 border border-yellow-500/30",
      Processing:
        "bg-purple-900/30 text-purple-400 border border-purple-500/30",
      "Ready for Pickup":
        "bg-blue-900/30 text-blue-400 border border-blue-500/30",
      "Driver Accepted":
        "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30",
      "Picked Up":
        "bg-indigo-900/30 text-indigo-400 border border-indigo-500/30",
      Delivered: "bg-green-900/30 text-green-400 border border-green-500/30",
      Pending: "bg-gray-900/30 text-gray-400 border border-gray-500/30",
      Rejected: "bg-red-900/30 text-red-400 border border-red-500/30",
      "Return Accepted":
        "bg-orange-900/30 text-orange-400 border border-orange-500/30",
      "Return Declined": "bg-red-900/30 text-red-400 border border-red-500/30",
      Refunded: "bg-green-900/30 text-green-400 border border-green-500/30",
    };
    return (
      styles[status] || "bg-gray-900/30 text-gray-400 border border-gray-500/30"
    );
  };

  const handleViewDetails = (orderId: string) => {
    // Navigate to different routes based on active tab
    if (activeTab === "orders") {
      router.push(`/vendor-dashboard/orders/details?id=${orderId}`);
    } else {
      router.push(`/vendor-dashboard/orders/return-product?id=${orderId}`);
    }
  };

  return (
    <div className="bg-gradient-to-tr from-[#05011a] via-[#0f0536] to-[#07021d] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 rounded-xl md:rounded-2xl p-4 md:p-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "orders"
              ? "bg-gradient-to-r from-[#6100FF] to-pink-600 text-white"
              : "bg-gray-800/50 text-gray-400 hover:text-white"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("returns")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "returns"
              ? "bg-gradient-to-r from-[#6100FF] to-pink-600 text-white"
              : "bg-gray-800/50 text-gray-400 hover:text-white"
          }`}
        >
          Returns
        </button>
      </div>

      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-cormorant mb-4 md:mb-6 text-white">
          {activeTab === "orders" ? "Orders" : "Returns"}
        </h2>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800/50 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white backdrop-blur-sm"
          >
            <option>Filter</option>
            {(activeTab === "orders" ? ORDER_FILTERS : RETURN_FILTERS).map(
              (filter) => (
                <option key={filter}>{filter}</option>
              ),
            )}
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white placeholder-gray-400 backdrop-blur-sm"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {skipVendorList && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
          Select a showroom from the vendor dashboard header to load orders and
          returns. Until then, order data is not requested.
        </div>
      )}

      {!skipVendorList && listError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          Could not load {activeTab}. Check your connection and showroom access,
          then try again.
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 mb-4">
        {skipVendorList ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            Choose a showroom to see your list here.
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (activeTab === "orders" ? allOrders : allReturns).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No {activeTab} found
          </div>
        ) : (
          (activeTab === "orders" ? allOrders : allReturns).map((item) => (
            <div
              key={item._id}
              className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-medium text-white mb-1">
                    #{item._id.slice(-8)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                {activeTab === "orders" ? (
                  <select
                    value={"orderStatus" in item ? item.orderStatus : ""}
                    onChange={(e) =>
                      handleStatusUpdate(item._id, e.target.value)
                    }
                    disabled={updatingOrderId === item._id}
                    className="px-2 py-1 bg-gray-800/50 border border-purple-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle("status" in item ? item.status : "")}`}
                  >
                    {"status" in item ? item.status : "N/A"}
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-gray-700/30 space-y-1">
                <div className="text-sm text-white">
                  {activeTab === "orders"
                    ? "customer" in item
                      ? item.customer?.name
                      : "N/A"
                    : "showroom" in item
                      ? item.showroom?.showroom_name
                      : "N/A"}
                </div>
                {"product" in item && item.product?.product_name && (
                  <div className="text-xs text-gray-400 truncate max-w-full">
                    {item.product.product_name}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleViewDetails(item._id)}
                  className="px-3 py-1.5 bg-gradient-to-r cursor-pointer from-[#6100FF] to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {activeTab === "orders" ? "Order ID" : "Order ID"}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {activeTab === "orders" ? "Customer" : "Showroom"}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {activeTab === "orders" ? "Order Status" : "Return Status"}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {skipVendorList ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  Choose a showroom to load this table.
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : (activeTab === "orders" ? allOrders : allReturns).length ===
              0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No {activeTab} found
                </td>
              </tr>
            ) : (
              (activeTab === "orders" ? allOrders : allReturns).map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-white">
                    #{item._id.slice(-8)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">
                    {activeTab === "orders"
                      ? "customer" in item
                        ? item.customer?.name
                        : "N/A"
                      : "showroom" in item
                        ? item.showroom?.showroom_name
                        : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300 max-w-[10rem] truncate">
                    {"product" in item && item.product?.product_name
                      ? item.product.product_name
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {activeTab === "orders" ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={"orderStatus" in item ? item.orderStatus : ""}
                          onChange={(e) =>
                            handleStatusUpdate(item._id, e.target.value)
                          }
                          disabled={updatingOrderId === item._id}
                          className="px-3 py-1 bg-gray-800/50 border border-purple-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle("status" in item ? item.status : "")}`}
                      >
                        {"status" in item ? item.status : "N/A"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewDetails(item._id)}
                      className="px-4 py-1.5 bg-gradient-to-r cursor-pointer from-[#6100FF] to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!skipVendorList && meta && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-4 md:mt-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors text-xs md:text-sm ${
                  currentPage === pageNum
                    ? "bg-purple-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
