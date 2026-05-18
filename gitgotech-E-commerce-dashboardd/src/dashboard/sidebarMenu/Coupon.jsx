import { ChevronLeft, ChevronRight, Edit2, Eye, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAddCouponMutation, useDeleteCouponMutation, useGetCouponsQuery, useUpdateCouponMutation } from '../../redux/features/couponSlice/couponSlice';

const CouponsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const couponsPerPage = 12;

  const initialFormData = {
    couponName: '',
    percentage: '',
    quantity: '',
    startAt: '',
    expiresAt: '',
    minAmount: '',
    maxAmount: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const { data: couponsData, isLoading, isError, refetch } = useGetCouponsQuery({ page: currentPage, limit: couponsPerPage, searchTerm });
  const [addCoupon, { isLoading: isAdding }] = useAddCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const coupons = couponsData?.data || [];
  const meta = couponsData?.meta || {};
  const totalData = meta.total || 0;
  const totalPages = Math.ceil(totalData / couponsPerPage);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleCreateCoupon = async () => {
    if (!formData.couponName || !formData.percentage || !formData.quantity || !formData.startAt || !formData.expiresAt) {
      Swal.fire('Error', 'Please fill in all required fields!', 'error');
      return;
    }

    const body = {
      couponName: formData.couponName,
      percentage: Number(formData.percentage),
      quantity: Number(formData.quantity),
      startAt: formData.startAt,
      expiresAt: formData.expiresAt,
    };

    if (formData.minAmount) body.minAmount = Number(formData.minAmount);
    if (formData.maxAmount) body.maxAmount = Number(formData.maxAmount);

    try {
      await addCoupon(body).unwrap();
      Swal.fire('Success', 'Coupon created successfully!', 'success');
      resetForm();
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Failed to create coupon!', 'error');
    }
  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      couponName: coupon.couponName,
      percentage: coupon.percentage.toString(),
      quantity: coupon.quantity.toString(),
      startAt: coupon.startAt ? coupon.startAt.split('T')[0] : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('.')[0] : '',
      minAmount: coupon.minAmount?.toString() || '',
      maxAmount: coupon.maxAmount?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!formData.couponName || !formData.percentage || !formData.quantity) {
      Swal.fire('Error', 'Please fill in all required fields!', 'error');
      return;
    }

    const body = {
      couponName: formData.couponName,
      percentage: Number(formData.percentage),
      quantity: Number(formData.quantity),
    };

    if (formData.startAt) body.startAt = formData.startAt;
    if (formData.expiresAt) body.expiresAt = formData.expiresAt;
    if (formData.minAmount) body.minAmount = Number(formData.minAmount);
    if (formData.maxAmount) body.maxAmount = Number(formData.maxAmount);

    try {
      await updateCoupon({ id: selectedCoupon._id, body }).unwrap();
      Swal.fire('Success', 'Coupon updated successfully!', 'success');
      resetForm();
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Failed to update coupon!', 'error');
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: `Are you sure you want to delete "${coupon.couponName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteCoupon(coupon._id).unwrap();
        Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
        refetch();
      } catch (error) {
        Swal.fire('Error', error?.data?.message || 'Failed to delete coupon!', 'error');
      }
    }
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = 1; i <= 6; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading coupons...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-10">Failed to load coupons.</div>;
  }

  return (
    <div className=" ">
      <div className=" ">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">All Coupons</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by coupon name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full max-w-sm px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>

        {/* Coupons Grid */}
        <div className="shadow-xl">
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiresAt);
                return (
                  <div
                    key={coupon._id}
                    className="bg-[#1a1a1f] rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                  >
                    {/* Header with Name and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold truncate">{coupon.couponName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        expired ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                    </div>

                    {/* Percentage */}
                    <div className="mb-2">
                      <p className="text-2xl font-bold text-white">{coupon.percentage}% Off</p>
                    </div>

                    {/* Info */}
                    <div className="mb-3 space-y-1">
                      <p className="text-gray-400 text-sm">Qty: {coupon.quantity}</p>
                      <p className="text-gray-400 text-sm">Used: {coupon.usedCount || 0}</p>
                    </div>

                    {/* Coupon Icon */}
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 5H3a1 1 0 0 0-1 1v4h.893c.996 0 1.92.681 2.08 1.664A2.001 2.001 0 0 1 3 14H2v4a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4h-1a2.001 2.001 0 0 1-1.973-2.336c.16-.983 1.084-1.664 2.08-1.664H22V6a1 1 0 0 0-1-1zM9 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(coupon)}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-2 rounded-lg transition-colors border border-blue-500/30"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 p-2 rounded-lg transition-colors border border-green-500/30"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded-lg transition-colors border border-red-500/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No coupons found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 border-t border-cyan-500/20">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
          />

          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-md w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Create Coupon</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Coupon Name *</label>
                <input
                  type="text"
                  name="couponName"
                  value={formData.couponName}
                  onChange={handleInputChange}
                  placeholder="Enter coupon name"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Percentage (%) *</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  placeholder="Enter percentage"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Expiry Date *</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Min Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    placeholder="Min amount"
                    className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Max Amount</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                    placeholder="Max amount"
                    className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateCoupon}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                {isAdding ? 'Creating...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDetailsModalOpen(false)}
          />

          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-md w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Coupon Details</h2>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Coupon Name</p>
                <p className="text-white font-semibold">{selectedCoupon.couponName}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Discount</p>
                <p className="text-white font-semibold text-xl">{selectedCoupon.percentage}% Off</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Quantity</p>
                  <p className="text-white font-semibold">{selectedCoupon.quantity}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Used</p>
                  <p className="text-white font-semibold">{selectedCoupon.usedCount || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Start Date</p>
                  <p className="text-white font-semibold text-sm">{formatDate(selectedCoupon.startAt)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Expiry Date</p>
                  <p className="text-white font-semibold text-sm">{formatDate(selectedCoupon.expiresAt)}</p>
                </div>
              </div>

              {selectedCoupon.minAmount && (
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Min Amount</p>
                  <p className="text-white font-semibold">{selectedCoupon.minAmount}</p>
                </div>
              )}

              {selectedCoupon.maxAmount && (
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-400 text-xs mb-1">Max Amount</p>
                  <p className="text-white font-semibold">{selectedCoupon.maxAmount}</p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                  isExpired(selectedCoupon.expiresAt) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {isExpired(selectedCoupon.expiresAt) ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setIsEditModalOpen(false); resetForm(); }}
          />

          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-md w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsEditModalOpen(false); resetForm(); }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Edit Coupon</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Coupon Name *</label>
                <input
                  type="text"
                  name="couponName"
                  value={formData.couponName}
                  onChange={handleInputChange}
                  placeholder="Enter coupon name"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Percentage (%) *</label>
                <input
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  placeholder="Enter percentage"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Min Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    placeholder="Min amount"
                    className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Max Amount</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                    placeholder="Max amount"
                    className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateCoupon}
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                {isUpdating ? 'Saving...' : 'Save'}
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

export default CouponsPage;
