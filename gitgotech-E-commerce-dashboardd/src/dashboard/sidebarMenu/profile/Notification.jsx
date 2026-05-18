import React, { useState } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { useGetMyNotificationsQuery } from '../../../redux/features/settings/settingsSlice';

 
 
const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const Notification = () => {
  const [page, setPage] = useState(1);
  const { data: notificationData, isLoading } = useGetMyNotificationsQuery({ page, limit: 10 });
  console.log(notificationData);

  const notifications = notificationData?.data?.notifications || [];
  const meta = notificationData?.data?.meta || {};
  const { totalPages = 1, total = 0 } = meta;

  return (
    <div className='mt-8 mx-6'>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className='font-semibold text-[30px] text-white'>Notifications</h1>
        <span className="text-sm text-[#949ba7]">{total} total</span>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-2 border-[#193664] border-t-[#76b395] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-[#949ba7]">
          <IoMdNotificationsOutline className="w-12 h-12 mb-2" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex border rounded items-center w-full min-h-[85px] px-2 transition-all duration-200
                ${!notification.isReadable
                  ? 'border-[#76b395] bg-[#76b39510]'
                  : 'border-[#193664] bg-transparent'
                }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={`relative h-12 w-12 ml-2 border rounded-full p-2 flex items-center justify-center
                  ${!notification.isReadable ? 'border-[#76b395]' : 'border-[#193664]'}`}>
                  <IoMdNotificationsOutline className="h-full w-full text-[#949ba7]" />
                  {!notification.isReadable && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#76b395] rounded-full border border-[#0d1b2e]" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="ml-6 flex-1 py-3">
                <p className="text-[16px] font-medium text-[#FFFFFF] leading-snug">
                  {notification.msg}
                </p>
                <p className='text-[13px] font-medium text-[#76b395] mt-1'>
                  {getTimeAgo(notification.createdAt)}
                  <span className="text-[#949ba7] ml-2">·</span>
                  <span className="text-[#949ba7] ml-2">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </p>
              </div>

              {/* Unread dot (right side) */}
              {!notification.isReadable && (
                <div className="flex-shrink-0 mr-4">
                  <span className="block w-2 h-2 rounded-full bg-[#76b395]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded border border-[#193664] text-[#949ba7] text-sm
              disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#76b395] hover:text-white transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded border text-sm font-medium transition-colors
                  ${page === p
                    ? 'bg-[#193664] border-[#76b395] text-white'
                    : 'border-[#193664] text-[#949ba7] hover:border-[#76b395] hover:text-white'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded border border-[#193664] text-[#949ba7] text-sm
              disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#76b395] hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;