import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, Search } from 'lucide-react';
import { useApproveShowroomMutation, useDeclineShowroomMutation, useGetShowroomQuery, useGetShowroomsQuery } from '../../../redux/features/showroomSlice/showroomSlice';
 

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '';

const ShowroomRequest = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState(null);
  const showroomsPerPage = 10;

  const { data: showroomsData, isLoading, isError, refetch } = useGetShowroomsQuery({
    searchTerm,
    page: currentPage,
    limit: showroomsPerPage,
  });

  const { data: showroomDetailsData, isLoading: isDetailsLoading } = useGetShowroomQuery(selectedShowroomId, {
    skip: !selectedShowroomId,
  });

  const showrooms = showroomsData?.data?.data || [];
  const meta = showroomsData?.data?.meta || {};
  const totalPages = meta.totalPages || 1;

  const selectedShowroom = showroomDetailsData?.data;

  const getStatusColor = (isApprove) => {
    return isApprove
      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  const getStatusText = (isApprove) => {
    return isApprove ? 'Approved' : 'Pending';
  };

  const handleViewDetails = (showroomId) => {
    setSelectedShowroomId(showroomId);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${IMAGE_BASE_URL}/${imageName}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const closeModal = () => {
    setSelectedShowroomId(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <div className="px-4 text-white">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Showroom Requests</h1>
          <p className="text-gray-400 text-sm">Manage showroom approval requests</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search showroom..."
            className="pl-10 pr-4 py-2 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 w-64"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading showrooms...</span>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load showrooms</p>
            <button
              onClick={refetch}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="p-4 w-16">Sl No.</th>
                  <th className="p-4">Showroom Name</th>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {showrooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No showroom requests found
                    </td>
                  </tr>
                ) : (
                  showrooms.map((showroom, index) => {
                    const serialNumber = (currentPage - 1) * showroomsPerPage + index + 1;
                    const owner = showroom.owner;
                    return (
                      <tr key={showroom._id} className="border-b border-gray-800 hover:bg-[#15121a] transition-colors">
                        <td className="p-4 text-gray-400 text-sm">{serialNumber}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {showroom.logo ? (
                              <img
                                src={getImageUrl(showroom.logo)}
                                alt={showroom.showroom_name}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-300 text-xs font-bold">
                                  {showroom.showroom_name?.charAt(0)?.toUpperCase() || 'S'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium text-sm">{showroom.showroom_name || 'N/A'}</p>
                              <p className="text-gray-500 text-xs">{showroom.showroom_id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {owner?.image ? (
                              <img
                                src={getImageUrl(owner.image)}
                                alt={owner.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-300 text-xs">
                                  {owner?.name?.charAt(0)?.toUpperCase() || 'O'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-300 text-sm">{owner?.name || 'N/A'}</p>
                              <p className="text-gray-500 text-xs">{owner?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-400 text-sm">
                            {showroom.showroom_address?.split(',')[0] || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{formatDate(showroom.createdAt)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(showroom.isApprove)}`}>
                            {getStatusText(showroom.isApprove)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewDetails(showroom._id)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap p-6 border-t border-gray-800">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    page === currentPage
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : page === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : 'bg-transparent text-white border border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-purple-500/40 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Showroom Details</h2>
                <p className="text-gray-400 text-sm">Complete information about the showroom</p>
              </div>

              {isDetailsLoading ? (
                <div className="text-center text-gray-400 py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                  Loading showroom details...
                </div>
              ) : selectedShowroom ? (
                <>
                  {/* Logo + Name */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg">
                    {selectedShowroom.logo ? (
                      <img
                        src={getImageUrl(selectedShowroom.logo)}
                        alt={selectedShowroom.showroom_name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-purple-500/30"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64/2d2433/ffffff?text=Logo'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center border-2 border-purple-500/30">
                        <span className="text-purple-300 text-xl font-bold">
                          {selectedShowroom.showroom_name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-white text-xl font-bold">{selectedShowroom.showroom_name || 'N/A'}</h3>
                      <p className="text-gray-400 text-sm">{selectedShowroom.showroom_address || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(selectedShowroom.isApprove)}`}>
                          {getStatusText(selectedShowroom.isApprove)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Owner Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Name</p>
                        <p className="text-white font-medium">{selectedShowroom.owner?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Email</p>
                        <p className="text-white font-medium">{selectedShowroom.owner?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Phone</p>
                        <p className="text-white font-medium">{selectedShowroom.owner?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          selectedShowroom.owner?.blockStatus
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {selectedShowroom.owner?.blockStatus ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Showroom Info */}
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Showroom Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Showroom ID</p>
                        <p className="text-white font-mono text-sm">{selectedShowroom._id?.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Referral Code</p>
                        <p className="text-white font-medium">{selectedShowroom.referralCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Categories</p>
                        <div className="flex flex-wrap gap-1">
                          {(selectedShowroom.showroom_category || []).map((cat, i) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs capitalize">
                              {cat}
                            </span>
                          ))}
                          {(!selectedShowroom.showroom_category || selectedShowroom.showroom_category.length === 0) && (
                            <span className="text-gray-500 text-xs">N/A</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Created</p>
                        <p className="text-white font-medium">{formatDate(selectedShowroom.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Showroom Schedule */}
                  {selectedShowroom.showroom_schedule && selectedShowroom.showroom_schedule.length > 0 && (
                    <div className="mb-6 p-4 bg-white/5 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Opening Schedule</h4>
                      <div className="space-y-2">
                        {selectedShowroom.showroom_schedule.map((schedule) => (
                          <div key={schedule._id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{schedule.day}</span>
                            <span className={schedule.isOpen ? 'text-green-400' : 'text-red-400'}>
                              {schedule.isOpen
                                ? `${new Date(schedule.open).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(schedule.close).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Documents</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedShowroom.nidImage && (
                        <div>
                          <p className="text-gray-400 text-xs mb-2">NID Image</p>
                          <img
                            src={getImageUrl(selectedShowroom.nidImage)}
                            alt="NID"
                            className="w-full h-24 rounded-lg object-cover border border-purple-500/20"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200x100/2d2433/ffffff?text=NID'; }}
                          />
                        </div>
                      )}
                      {selectedShowroom.ownerImage && (
                        <div>
                          <p className="text-gray-400 text-xs mb-2">Owner Image</p>
                          <img
                            src={getImageUrl(selectedShowroom.ownerImage)}
                            alt="Owner"
                            className="w-full h-24 rounded-lg object-cover border border-purple-500/20"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200x100/2d2433/ffffff?text=Owner'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Only show if pending */}
                  {!selectedShowroom.isApprove && (
                    <ShowroomActions showroom={selectedShowroom} refetch={refetch} closeModal={closeModal} />
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">Showroom not found</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// Action buttons component (Approve / Reject)
const ShowroomActions = ({ showroom, refetch, closeModal }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [ approveShowroom ] = useApproveShowroomMutation();
  const [ rejectShowroom ] = useDeclineShowroomMutation();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveShowroom(showroom._id).unwrap();
      refetch();
      closeModal();
    } catch (error) {
      console.error('Approve error:', error);
      alert(`Failed to approve: ${error?.data?.message || error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsRejecting(true);
  
    console.log(showroom._id, rejectReason)

    try {
      await rejectShowroom({ id: showroom._id, body: { reason:rejectReason } }).unwrap();
      refetch();
      closeModal();
    } catch (error) {
      console.error('Reject error:', error);
      alert(`Failed to reject: ${error?.data?.message || error.message}`);
    } finally {
      setIsRejecting(false);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold py-3 rounded-lg transition-colors border border-green-500/30 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-colors border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRejecting ? 'Rejecting...' : 'Reject'}
        </button>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowRejectModal(false); setRejectReason(''); }} />
          <div className="relative bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-red-500/40 shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-red-400 mb-4">Reject Showroom</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a reason for rejecting <strong className="text-white">{showroom.showroom_name}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a1f] border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 font-semibold py-2.5 rounded-lg transition-colors border border-gray-500/30"
                disabled={isRejecting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowroomRequest;
