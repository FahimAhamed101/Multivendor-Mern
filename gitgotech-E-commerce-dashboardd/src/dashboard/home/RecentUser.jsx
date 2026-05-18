import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useGetRecentUsersQuery, useGetRecentVendorsQuery } from '../../redux/features/overview/overviewSlice';

const RecentTables = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'user' | 'vendor'

  const { data: recentUsersData } = useGetRecentUsersQuery();
  const { data: recentVendorsData } = useGetRecentVendorsQuery();

  // Slice to only 4 items each
  const recentUsers = (recentUsersData?.data ?? []).slice(0, 4);
  const recentVendors = (recentVendorsData?.data ?? []).slice(0, 4);

  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalType('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const TableCard = ({ title, data, type }) => (
    <div className="bg-gradient-to-tr from-[#05011a] via-[#0f0536] to-[#07021d] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
          <span className="text-sm font-medium">View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/20">
              <th className="text-left text-gray-400 text-sm font-medium p-4">SL No.</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Name</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Email</th>
              <th className="text-left text-gray-400 text-sm font-medium p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 text-sm">No data available</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-b border-cyan-500/10 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-gray-300 text-sm">{index + 1}</td>
                  <td className="p-4 text-gray-300 text-sm">{item.name}</td>
                  <td className="p-4 text-gray-300 text-sm">{item.email}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewDetails(item, type)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
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
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard title="Recent Users" data={recentUsers} type="user" />
        <TableCard title="Recent Vendors" data={recentVendors} type="vendor" />
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-purple-500/40 shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {modalType === 'vendor' ? 'Vendor Details' : 'User Details'}
              </h2>
              <p className="text-gray-400 text-sm">
                Complete information about the {modalType}
              </p>
            </div>

            {/* Info Fields */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">ID</p>
                <p className="text-white font-semibold text-sm break-all">{selectedItem._id}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Full Name</p>
                <p className="text-white font-semibold">{selectedItem.name}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Username</p>
                <p className="text-white font-semibold">@{selectedItem.username}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Email Address</p>
                <p className="text-white font-semibold">{selectedItem.email}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Joined Date</p>
                <p className="text-white font-semibold">{formatDate(selectedItem.createdAt)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors border border-white/20"
              >
                Close
              </button>
              <button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecentTables;