"use client";

import baseUrl from "@/redux/api/baseUrl";
import { useDashboardStatusQuery } from "@/redux/features/vendor/dashboardOverview";
import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function DashboardHome() {
  const router = useRouter();
  const showroomId = useSelector(selectShowroomId);

  const { data: dashboardOverviewData } = useDashboardStatusQuery(showroomId);

  const dashData = dashboardOverviewData?.data;
  console.log(dashData);

  const stats = [
    {
      title: "Total Products",
      value: dashData?.totalProduct ?? "—",
      icon: "/images/product.png",
      borderColor: "border-blue-500/30",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Orders",
      value: dashData?.recentOrders?.length ?? 0,
      icon: "/images/order.png",
      borderColor: "border-blue-500/30",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Revenue",
      value:
        dashData?.totalSalesAmount != null
          ? `₵${dashData.totalSalesAmount?.total || 0}`
          : "—",
      icon: "/images/earn.png",
      borderColor: "border-cyan-500/30",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Total Pending",
      value: dashData?.pendingOrders ?? "—",
      icon: "/images/pending.png",
      borderColor: "border-purple-500/30",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const recentOrders = dashData?.recentOrders ?? [];
  const recentProducts = dashData?.recentProducts ?? [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-900/30 text-green-400 border-green-500/30";
      case "processing":
        return "bg-blue-900/30 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-900/30 text-yellow-500 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-tl from-[#100b1f] via-[#170f2e] to-black 
              border border-l-[#912DAD] border-l-4 md:border-l-6 
              ${stat.borderColor} rounded-xl md:rounded-2xl p-4 md:p-6 
              hover:shadow-lg hover:shadow-purple-500/10 
              h-28 sm:h-32 md:h-36 transition-all`}
          >
            <div className="flex items-start justify-between h-full">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 
                  bg-gradient-to-br ${stat.color} rounded-lg md:rounded-xl 
                  flex items-center justify-center flex-shrink-0`}
              >
                <img
                  src={stat.icon}
                  alt={stat.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-xl font-normal text-[#6100FF]">
                  {stat.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-l from-[#070722] to-[#0a183f] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold font-cormorant">
            Recent Orders
          </h2>
          <button
            onClick={() => router.push("/vendor-dashboard/orders")}
            className="text-purple-400 cursor-pointer hover:text-purple-300 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-colors"
          >
            View All <span>→</span>
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-6 text-sm">
            No recent orders found.
          </p>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {recentOrders.map((order: any, index: number) => (
                <div
                  key={order._id ?? index}
                  className="bg-purple-900/10 border border-gray-800/30 rounded-lg p-4 hover:bg-purple-900/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium mb-1">
                        #
                        {order.trackingNumber ??
                          order._id?.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusStyle(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {order.deliveryInfo?.name ?? "—"}
                    </span>
                    <button
                      onClick={() =>
                        router.push(
                          `/vendor-dashboard/orders/details?id=${order._id}`,
                        )
                      }
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any, index: number) => (
                    <tr
                      key={order._id ?? index}
                      className="border-b border-gray-800/30 hover:bg-purple-900/10 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        #
                        {order.trackingNumber ??
                          order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.deliveryInfo?.name ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusStyle(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/vendor-dashboard/orders/details?id=${order._id}`,
                            )
                          }
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Recent Uploaded Products */}
      <div className="bg-gradient-to-l from-[#070722] to-[#0a183f] shadow-[0_0_12px_rgba(34,211,238,0.35)] border border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold font-cormorant">
            Recent Uploaded Products
          </h2>
          <button
            onClick={() => router.push("/vendor-dashboard/products")}
            className="text-purple-400 cursor-pointer hover:text-purple-300 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-colors"
          >
            View All <span>→</span>
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-6 text-sm">
            No recent products found.
          </p>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {recentProducts.map((product: any, index: number) => (
                <div
                  key={product._id ?? index}
                  className="bg-purple-900/10 border border-gray-800/30 rounded-lg p-4 hover:bg-purple-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.product_images?.[0] ? (
                        <img
                          src={`${baseUrl}/${product.product_images[0]}`}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>🧥</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        {product.product_name}
                      </div>
                      <div className="text-sm text-gray-400">
                        ₵{product.product_price}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                      {product.isDeleted ? "Deleted" : "In Stock"}
                    </span>
                    <button
                      onClick={() =>
                        router.push(
                          `/vendor-dashboard/products/details?id=${product._id}`,
                        )
                      }
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product: any, index: number) => (
                    <tr
                      key={product._id ?? index}
                      className="border-b border-gray-800/30 hover:bg-purple-900/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.product_images?.[0] ? (
                              <img
                                src={`${baseUrl}/${product.product_images[0]}`}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>🧥</span>
                            )}
                          </div>
                          <span className="text-sm">
                            {product.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ₵{product.product_price}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                          {product.isDeleted ? "Deleted" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/vendor-dashboard/products/details?id=${product._id}`,
                            )
                          }
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all shadow-lg shadow-purple-500/20"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
