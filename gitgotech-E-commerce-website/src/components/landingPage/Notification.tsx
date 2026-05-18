"use client";

import { useGetNotificationsQuery } from "@/redux/features/notification/notificationSlice";
import { Bell, CheckCircle, Info, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

interface Notification {
  _id: string;
  isReadable: boolean;
  msg: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: notificationsData, isLoading } = useGetNotificationsQuery({
    page: currentPage,
    limit: 10,
  });

  const notifications: Notification[] =
    notificationsData?.data?.notifications || [];
  const meta = notificationsData?.data?.meta;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const getNotificationType = (message: string) => {
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes("successfully") ||
      lowerMsg.includes("topped up") ||
      lowerMsg.includes("accepted")
    ) {
      return "success";
    } else if (
      lowerMsg.includes("rejected") ||
      lowerMsg.includes("cancelled") ||
      lowerMsg.includes("failed")
    ) {
      return "error";
    } else if (
      lowerMsg.includes("pending") ||
      lowerMsg.includes("processing")
    ) {
      return "warning";
    }
    return "info";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (meta?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      <div className="container mx-auto flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className="text-black" />
          </div>
        </button>
        <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant hidden md:block">
          Notification
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-semibold mb-2">Notifications</h1>
            <p className="text-gray-400 text-sm">
              Get notified for everything, Never miss anything!
            </p>
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const type = getNotificationType(notification.msg);
              return (
                <div
                  key={notification._id}
                  className={`bg-[#251E2F] bg-opacity-50 backdrop-blur-sm border rounded-2xl p-4 hover:bg-opacity-70 transition-all duration-200 ${
                    !notification.isReadable
                      ? "border-purple-500/50"
                      : "border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor(type)}`}
                    >
                      {getNotificationIcon(type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1">
                        {notification.msg}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {/* Read Indicator */}
                    {!notification.isReadable && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
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
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg transition-colors text-sm ${
                  page === currentPage
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-400"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                handlePageChange(Math.min(meta.totalPages, currentPage + 1))
              }
              disabled={currentPage === meta.totalPages}
              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
