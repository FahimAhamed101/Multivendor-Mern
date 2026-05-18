'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useGetReturnDetailsQuery, useReturnOrderActionMutation } from '@/redux/features/vendor/order/orderSlice';
import { useSelector } from 'react-redux';
import { selectShowroomId } from '@/redux/features/vendor/showroomSlice/selectedShowroomSlice';

interface ReturnDetails {
  _id: string;
  product: {
    _id: string;
    product_name: string;
  };
  showroom: {
    _id: string;
    showroom_name: string;
  };
  status: string;
  clientReason: string;
  vendorReason: string | null;
  deliveryInfo: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: number;
    email?: string;
    phone?: number;
  };
  pickUpInfo?: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: number;
    email?: string;
    phone?: number;
  };
  price: {
    unit: string;
    tip: number;
    deliveryCharge: number;
  };
  createdAt?: string;
}

export default function ReturnDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnId = searchParams.get('id') || '';
 
  
  const [showChat, setShowChat] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const showroomId = useSelector(selectShowroomId)

  const { data, isLoading, error } = useGetReturnDetailsQuery({
    id: returnId,
    showroomId,
  });

  const [returnOrderAction, { isLoading: isActionLoading }] = useReturnOrderActionMutation();

  const returnData: ReturnDetails | null = data?.data || null;

  const handleAccept = () => {
    setShowConfirmModal(true);
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleBack = () => {
    router.back();
  };

  const confirmAccept = async () => {
    try {
      await returnOrderAction({ id: returnId, action: 'accept', showroomId }).unwrap();
      setShowConfirmModal(false);
      router.back();
    } catch (err) {
      console.error('Failed to accept return:', err);
    }
  };

  const confirmDecline = async () => {
    try {
      await returnOrderAction({ id: returnId, action: 'decline', showroomId }).unwrap();
      setShowDeclineModal(false);
      router.back();
    } catch (err) {
      console.error('Failed to decline return:', err);
    }
  };

  const submitReport = () => {
    console.log('Report submitted with reason:', reportReason, 'and images:', uploadedImages);
    setShowReportModal(false);
    // Add your report submission logic here
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading return details...</div>
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load return details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center hover:bg-blue-600/30 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Return Details</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={isActionLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionLoading ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={handleDecline}
              disabled={isActionLoading}
              className="px-6 py-2.5 bg-transparent border border-red-500/50 hover:bg-red-500/10 rounded-lg text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionLoading ? 'Processing...' : 'Decline'}
            </button>
            {/* <button
              onClick={handleReport}
              className="px-6 py-2.5 bg-transparent border border-yellow-500/50 hover:bg-yellow-500/10 rounded-lg text-yellow-400 font-medium transition-all"
            >
              Report
            </button> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
            <img
              src="/images/jacket.png"
              alt={returnData.product.product_name}
              className="max-w-full h-auto object-contain"
            />
          </div>

          {/* Reason Box */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Reason for Return</h2>
              <p className="text-gray-300 leading-relaxed">
                {returnData.clientReason}
              </p>
              {returnData.vendorReason && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <p className="text-purple-400 text-sm mb-2">Vendor Response:</p>
                  <p className="text-gray-300">{returnData.vendorReason}</p>
                </div>
              )}
            </div>

            {/* Chat Button */}
            {/* <button
              onClick={() => setShowChat(!showChat)}
              className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button> */}

          </div>
        </div>

        {/* Return Information */}
        <div className="mt-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Return Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Return ID</p>
              <p className="text-white font-medium">#{returnData._id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Showroom</p>
              <p className="text-white font-medium">{returnData.showroom.showroom_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-white font-medium">{returnData.status}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium">{returnData.product.product_name}</p>
                <p className="text-gray-400 text-sm mt-1">Product ID: #{returnData.product._id.slice(-8)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Tip: ₵{returnData.price.tip}</p>
                <p className="text-gray-400 text-sm">Delivery: ₵{returnData.price.deliveryCharge}</p>
                <p className="text-white font-semibold text-lg">Total: ₵{returnData.price.tip + returnData.price.deliveryCharge}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & PickUp Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Delivery Information */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Delivery Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Name</p>
                <p className="text-white font-medium">{returnData.deliveryInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Address</p>
                <p className="text-white font-medium">
                  {returnData.deliveryInfo.address}, {returnData.deliveryInfo.state}, {returnData.deliveryInfo.zipcode}, {returnData.deliveryInfo.country}
                </p>
              </div>
              {returnData.deliveryInfo.email && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{returnData.deliveryInfo.email}</p>
                </div>
              )}
              {returnData.deliveryInfo.phone && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Phone</p>
                  <p className="text-white font-medium">{returnData.deliveryInfo.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* PickUp Information */}
          {returnData.pickUpInfo && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">PickUp Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Name</p>
                  <p className="text-white font-medium">{returnData.pickUpInfo.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Address</p>
                  <p className="text-white font-medium">
                    {returnData.pickUpInfo.address}
                    {returnData.pickUpInfo.state && `, ${returnData.pickUpInfo.state}`}
                    {returnData.pickUpInfo.zipcode && `, ${returnData.pickUpInfo.zipcode}`}
                    {returnData.pickUpInfo.country && `, ${returnData.pickUpInfo.country}`}
                  </p>
                </div>
                {returnData.pickUpInfo.email && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{returnData.pickUpInfo.email}</p>
                  </div>
                )}
                {returnData.pickUpInfo.phone && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Phone</p>
                    <p className="text-white font-medium">{returnData.pickUpInfo.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel (Optional) */}
        {showChat && (
          <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
              <h3 className="text-white font-semibold">Chat with Customer</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-400 text-center text-sm">Chat functionality coming soon...</p>
            </div>
            <div className="p-4 border-t border-gray-700/30">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Modal for Decline */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Decline Return</h3>
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-purple-400 text-sm mb-4">Tell us why you're declining this return request.</p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Write your reason"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 resize-none h-24"
              />
              <button
                onClick={confirmDecline}
                disabled={!declineReason.trim() || isActionLoading}
                className={`w-full mt-4 px-6 py-3 rounded-lg font-medium transition-all ${
                  declineReason.trim() && !isActionLoading
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isActionLoading ? 'Processing...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Modal for Confirm Accept */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-green-500/30 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Confirm Acceptance</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-400 text-sm mb-4">Are you sure you want to accept this return request?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isActionLoading}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAccept}
                  disabled={isActionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                >
                  {isActionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Report */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0f] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-purple-400 text-sm mb-4 text-center">Your report will go to admin</p>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Upload Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img src={image} alt="Uploaded" className="w-full h-full object-cover rounded" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-purple-500">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Write your reason"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 resize-none h-24 mb-4"
              />
              <button
                onClick={submitReport}
                disabled={!reportReason.trim()}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                  reportReason.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
