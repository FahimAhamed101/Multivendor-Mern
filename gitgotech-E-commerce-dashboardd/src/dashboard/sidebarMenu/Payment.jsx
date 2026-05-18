import { ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useApproveWithdrawMutation, useGetWithdrawQuery, useGetWithdrawsQuery, useRejectWithdrawMutation } from '../../redux/features/withdraw/withdrawSlice';

const PaymentPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [adminNote, setAdminNote] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const paymentsPerPage = 10;

  const { data: paymentsData, isLoading, isError, refetch } = useGetWithdrawsQuery({ searchTerm, page: currentPage, limit: paymentsPerPage });

  const { data: paymentDetails, isLoading: isDetailsLoading } = useGetWithdrawQuery(selectedPayment?._id, { skip: !selectedPayment?._id });

  const [approveWithdraw, { isLoading: isApproving }] = useApproveWithdrawMutation();
  const [rejectWithdraw, { isLoading: isRejecting }] = useRejectWithdrawMutation();

  // Extract payments from API response
  const withdraws = paymentsData?.data?.data || [];
  const meta = paymentsData?.data?.meta || {};
  const totalPages = meta.totalPages || 1;

  const isPendingWithdraw = (status) => status?.toLowerCase() === 'pending';

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsActionModalOpen(false);
    setActionType(null);
    setIsDetailsModalOpen(true);
  };

  const handleAction = (type) => {
    const rowStatus = selectedPayment?.status;
    const detailStatus = paymentDetails?.data?.status;
    if (!isPendingWithdraw(detailStatus ?? rowStatus)) return;
    setActionType(type);
    setAdminNote('');
    setRejectedReason('');
    setIsDetailsModalOpen(false);
    setIsActionModalOpen(true);
  };

  const handleSubmitAction = async () => {
    if (actionType === 'reject' && !rejectedReason.trim()) {
      alert('Rejection reason is required!');
      return;
    }

    try {
      if (actionType === 'approve') {
        await approveWithdraw({
          id: selectedPayment._id,
          body: { adminNote: adminNote.trim() || undefined }
        }).unwrap();
        alert('Withdraw request approved successfully!');
      } else if (actionType === 'reject') {
        await rejectWithdraw({
          id: selectedPayment._id,
          body: {
            rejectedReason: rejectedReason.trim(),
            adminNote: adminNote.trim() || undefined
          }
        }).unwrap();
        alert('Withdraw request rejected successfully!');
      }
      setIsActionModalOpen(false);
      setSelectedPayment(null);
      refetch();
    } catch (error) {
      console.error(`${actionType} error:`, error);
      alert(`Failed to ${actionType} withdraw: ${error?.data?.message || error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className=" ">
      <div className=" ">
        {/* Payment Table Card */}
        <div className="rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
            <h1 className="text-3xl font-cormorant font-bold text-white">Withdraw Requests</h1>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email..."
                className="pl-10 pr-4 py-2 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 w-64"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="ml-3 text-gray-400">Loading withdraw requests...</span>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-400 text-lg mb-2">Failed to load data</p>
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
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/20">
                      <th className="text-left text-gray-400 text-sm font-medium p-4">User</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Email</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Amount</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Date</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Status</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdraws.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400">
                          No withdraw requests found
                        </td>
                      </tr>
                    ) : (
                      withdraws.map((withdraw, index) => (
                        <tr
                          key={withdraw._id || index}
                          className="border-b border-cyan-500/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {withdraw.userDetails?.image && withdraw.userDetails.image !== '' ? (
                                <img
                                  src={withdraw.userDetails.image}
                                  alt={withdraw.userDetails.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                                  <span className="text-xs text-purple-300">
                                    {withdraw.userDetails?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-300 text-sm font-medium">{withdraw.userDetails?.name || 'N/A'}</p>
                                <p className="text-gray-500 text-xs">{withdraw.userDetails?.username || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{withdraw.userDetails?.email || 'N/A'}</td>
                          <td className="p-4">
                            <p className="text-white font-semibold">${withdraw.amount?.toLocaleString() || 0}</p>
                            <p className="text-gray-500 text-xs">Fee: ${withdraw.platformFee?.toLocaleString() || 0}</p>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{formatDate(withdraw.createdAt)}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdraw.status)}`}>
                              {withdraw.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleViewDetails(withdraw)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
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
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 flex-wrap p-6 border-t border-cyan-500/20">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
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
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDetailsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-2xl w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Withdraw Request Details</h2>

            {isDetailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                <span className="ml-3 text-gray-400">Loading details...</span>
              </div>
            ) : (
              <>
                {/* User Info */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Name:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.userId?.name || selectedPayment.userDetails?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Email:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.userId?.email || selectedPayment.userDetails?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">User Balance:</span>
                      <p className="text-white font-semibold">${(paymentDetails?.data?.userId?.balance || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Withdraw Details */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Withdraw Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Amount:</span>
                      <p className="text-white font-semibold text-lg">${(paymentDetails?.data?.amount || selectedPayment.amount)?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Platform Fee:</span>
                      <p className="text-white font-semibold">${(paymentDetails?.data?.platformFee || selectedPayment.platformFee)?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Status:</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 ${getStatusColor(paymentDetails?.data?.status || selectedPayment.status)}`}>
                        {paymentDetails?.data?.status || selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Date:</span>
                      <p className="text-white font-semibold">{formatDate(paymentDetails?.data?.createdAt || selectedPayment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Bank Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Bank Name:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.bankName || selectedPayment.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Account Name:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.accountName || selectedPayment.accountName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Account Number:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.accountNumber || selectedPayment.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Bank Code:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.bankCode || selectedPayment.bankCode || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Country:</span>
                      <p className="text-white font-semibold">{paymentDetails?.data?.country || selectedPayment.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* More Info */}
                {(paymentDetails?.data?.moreInfo || selectedPayment.moreInfo) && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">Additional Info:</span>
                    <p className="text-white mt-1">{paymentDetails?.data?.moreInfo || selectedPayment.moreInfo}</p>
                  </div>
                )}

                {/* Action Buttons — only while request is still pending */}
                {isPendingWithdraw(paymentDetails?.data?.status ?? selectedPayment.status) && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAction('reject')}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-colors border border-red-500/30 hover:border-red-500/50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('approve')}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold py-3 rounded-lg transition-colors border border-green-500/30 hover:border-green-500/50"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) — only for pending requests */}
      {isActionModalOpen &&
        selectedPayment &&
        isPendingWithdraw(paymentDetails?.data?.status ?? selectedPayment.status) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsActionModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-md w-full p-8 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Header */}
            <h2 className={`text-2xl font-bold mb-6 text-center ${actionType === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Withdraw Request
            </h2>

            <div className="space-y-4 mb-6">
              {/* Rejection Reason (only for reject) */}
              {actionType === 'reject' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectedReason}
                    onChange={(e) => setRejectedReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 resize-none"
                    rows="3"
                    required
                  />
                </div>
              )}

              {/* Admin Note (optional) */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Admin Note <span className="text-gray-600">(Optional)</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 resize-none"
                  rows="3"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 font-semibold py-3 rounded-lg transition-colors border border-gray-500/30 hover:border-gray-500/50"
                disabled={isApproving || isRejecting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                className={`font-semibold py-3 rounded-lg transition-colors border ${
                  actionType === 'approve'
                    ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-500/30 hover:border-green-500/50'
                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30 hover:border-red-500/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isApproving || isRejecting || (actionType === 'reject' && !rejectedReason.trim())}
              >
                {(isApproving || isRejecting) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
