"use client";

import {
  useAcceptOrDeclineCustomOrderMutation,
  useChangeCustomOrderStatusMutation,
  useGetCustomOrdersQuery,
} from "@/redux/features/vendor/order/orderSlice";
import {
  getVendorCustomOrderStatusSelectOptions,
  isAllowedVendorCustomOrderStatusTransition,
  vendorCanChangeCustomOrderStatus,
} from "@/lib/vendorCustomOrderStatusFlow";
import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";

interface CustomOrder {
  _id: string;
  customer: {
    _id: string;
    name: string;
  };
  product: {
    _id: string;
    product_name: string;
  };
  orderStatus: string;
  price?: {
    amount: number;
    unit: string;
  };
  reason?: string;
  createdAt: string;
}

const CUSTOM_ORDER_FILTERS = [
  "All Custom Orders",
  "Vendor Accepted",
  "Vendor Rejected",
  "Pending",
  "Customer Accepted",
  "Customer Rejected",
  "Paid",
  "Driver Accepted",
  "Picked Up",
  "Delivered",
];

export default function CustomRequest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Filter");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [modalType, setModalType] = useState<"accept" | "decline" | null>(null);
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("usd");
  const [reason, setReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<
    string | null
  >(null);

  const showroomId = useSelector(selectShowroomId);
  const limit = 10;

  const [changeCustomOrderStatus] = useChangeCustomOrderStatusMutation();
  const [acceptOrDeclineCustomOrder] = useAcceptOrDeclineCustomOrderMutation();

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useGetCustomOrdersQuery({
    page: currentPage,
    limit,
    searchQ: searchTerm,
    filter: filterType,
    showroomId,
  });

  const allOrders: CustomOrder[] = ordersData?.data || [];
  const meta = ordersData?.meta;

  const filteredOrders = allOrders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleAccept = (order: CustomOrder) => {
    setSelectedOrder(order);
    setModalType("accept");
    setIsModalOpen(true);
    setPrice("");
    setPriceUnit("usd");
  };

  const handleDecline = (order: CustomOrder) => {
    setSelectedOrder(order);
    setModalType("decline");
    setIsModalOpen(true);
    setReason("");
  };

  const handleSubmitAccept = async () => {
    if (!selectedOrder) return;
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) return;

    try {
      await acceptOrDeclineCustomOrder({
        id: selectedOrder._id,
        action: "accepted",
        price: parseFloat(price),
        priceUnit,
        showroomId,
      }).unwrap();

      refetch();
      closeModal();
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const handleSendReason = async () => {
    if (!reason.trim() || !selectedOrder) return;

    try {
      await acceptOrDeclineCustomOrder({
        id: selectedOrder._id,
        action: "declined",
        reason,
        showroomId,
      }).unwrap();
      refetch();
      closeModal();
    } catch (err) {
      console.error("Failed to decline order:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setModalType(null);
    setPrice("");
    setPriceUnit("usd");
    setReason("");
  };

  const canRespondToOrder = (order: CustomOrder) =>
    order.orderStatus === "Order Placed";

  const handleListStatusChange = async (
    order: CustomOrder,
    newStatus: string,
  ) => {
    if (!isAllowedVendorCustomOrderStatusTransition(order.orderStatus, newStatus)) {
      return;
    }
    setUpdatingStatusOrderId(order._id);
    try {
      await changeCustomOrderStatus({
        id: order._id,
        orderStatus: newStatus,
        showroomId,
      }).unwrap();
      await refetch();
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingStatusOrderId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (meta?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: string } = {
      "Vendor Accepted":
        "bg-green-900/30 text-green-400 border border-green-500/30",
      "Vendor Rejected": "bg-red-900/30 text-red-400 border border-red-500/30",
      "Customer Accepted":
        "bg-blue-900/30 text-blue-400 border border-blue-500/30",
      "Customer Rejected":
        "bg-orange-900/30 text-orange-400 border border-orange-500/30",
      Paid: "bg-purple-900/30 text-purple-400 border border-purple-500/30",
      "Driver Accepted":
        "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30",
      "Picked Up":
        "bg-indigo-900/30 text-indigo-400 border border-indigo-500/30",
      Delivered: "bg-green-900/30 text-green-400 border border-green-500/30",
      Pending: "bg-gray-900/30 text-gray-400 border border-gray-500/30",
      "Order Placed":
        "bg-amber-900/30 text-amber-300 border border-amber-500/30",
      Processing:
        "bg-purple-900/30 text-purple-300 border border-purple-500/30",
      "Ready for Pickup":
        "bg-teal-900/30 text-teal-300 border border-teal-500/30",
    };
    return (
      styles[status] || "bg-gray-900/30 text-gray-400 border border-gray-500/30"
    );
  };

  return (
    <div className="bg-gradient-to-tr from-[#05011a] via-[#0f0536] to-[#07021d] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 rounded-xl md:rounded-2xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-cormorant mb-4 md:mb-6 text-white">
          Custom Orders
        </h2>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800/50 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white backdrop-blur-sm"
          >
            <option>Filter</option>
            {CUSTOM_ORDER_FILTERS.map((filter) => (
              <option key={filter}>{filter}</option>
            ))}
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

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 mb-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No custom orders found
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-medium text-white mb-1">
                    #{order._id.slice(-8)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  {vendorCanChangeCustomOrderStatus(order.orderStatus) && (
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleListStatusChange(order, e.target.value)
                      }
                      disabled={updatingStatusOrderId === order._id}
                      className="max-w-[11rem] text-xs bg-gray-800/80 border border-cyan-500/40 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    >
                      {getVendorCustomOrderStatusSelectOptions(
                        order.orderStatus,
                      ).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-700/30">
                <span className="text-sm text-white">
                  {order.customer?.name}
                </span>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Link
                    href={`/vendor-dashboard/custom-orders/details?id=${order._id}`}
                  >
                    <button className="px-3 py-1.5 bg-gradient-to-r cursor-pointer from-[#6100FF] to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20">
                      View Details
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAccept(order)}
                    disabled={!canRespondToOrder(order)}
                    className="px-3 py-1.5 bg-[#4d4dff] hover:bg-[#5d5dff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-xs"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(order)}
                    disabled={!canRespondToOrder(order)}
                    className="px-3 py-1.5 bg-[#ff4d6d] hover:bg-[#ff6b8b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-xs"
                  >
                    Decline
                  </button>
                </div>
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
                Order
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                View
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No custom orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-white">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">
                    {order.customer?.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      {vendorCanChangeCustomOrderStatus(order.orderStatus) && (
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleListStatusChange(order, e.target.value)
                          }
                          disabled={updatingStatusOrderId === order._id}
                          className="text-xs bg-gray-800/80 border border-cyan-500/40 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        >
                          {getVendorCustomOrderStatusSelectOptions(
                            order.orderStatus,
                          ).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/vendor-dashboard/custom-orders/details?id=${order._id}`}
                    >
                      <button className="px-4 py-1.5 bg-gradient-to-r cursor-pointer from-[#6100FF] to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20">
                        View Details
                      </button>
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(order)}
                        disabled={!canRespondToOrder(order)}
                        className="bg-[#4d4dff] hover:bg-[#5d5dff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-3.5 rounded-lg transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(order)}
                        disabled={!canRespondToOrder(order)}
                        className="bg-[#ff4d6d] hover:bg-[#ff6b8b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-3.5 rounded-lg transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-4 md:mt-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>

          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            let pageNum;
            if (meta.totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= meta.totalPages - 2) {
              pageNum = meta.totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return pageNum;
          }).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors text-xs md:text-sm ${
                currentPage === page
                  ? "bg-purple-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(Math.min(meta.totalPages, currentPage + 1))
            }
            disabled={currentPage === meta.totalPages}
            className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          {/* MODAL CONTAINER */}
          <div
            className="bg-[#0f0f1b] border border-[#4d4dff] rounded-xl w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#8a8a9d] hover:text-white transition-colors z-10 text-xl font-bold"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Accept Modal */}
            {modalType === "accept" && (
              <div className="p-8 pt-12">
                <h2 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-500">
                  Provide a price
                </h2>
                <p className="text-center text-[#a8a8b8] mb-6 text-sm">
                  Accepted orders require price and currency for the customer.
                </p>
                <div className="mb-6">
                  <label className="block text-sm text-[#a8a8b8] mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter offered price"
                    className="w-full bg-[#1a1a2e] border border-[#4d4dff] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-[#a8a8b8] mb-2">
                    Currency (priceUnit)
                  </label>
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-[#1a1a2e] border border-[#4d4dff] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="usd">usd</option>
                    <option value="eur">eur</option>
                    <option value="gbp">gbp</option>
                    <option value="bdt">bdt</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitAccept}
                  disabled={
                    !price ||
                    isNaN(parseFloat(price)) ||
                    parseFloat(price) <= 0
                  }
                  className="w-full bg-[#4d4dff] hover:bg-[#5d5dff] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            )}

            {/* Decline Modal */}
            {modalType === "decline" && (
              <div className="p-8 pt-12">
                <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-500">
                  Reason
                </h2>
                <p className="text-center text-[#a8a8b8] mb-6">
                  Give a reason why do you want to decline the order.
                </p>
                <div className="mb-6">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Write your reason"
                    rows={4}
                    className="w-full bg-[#1a1a2e] border border-[#4d4dff] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                  ></textarea>
                </div>
                <button
                  type="button"
                  onClick={handleSendReason}
                  disabled={!reason.trim()}
                  className="w-full bg-[#4d4dff] hover:bg-[#5d5dff] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
