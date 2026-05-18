'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '@/redux/features/vendor/order/orderSlice';
import { useSelector } from 'react-redux';
import { selectShowroomId } from '@/redux/features/vendor/showroomSlice/selectedShowroomSlice';

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Order Placed',
  'Processing',
  'Ready for Pickup',
  'Driver Accepted',
  'Picked Up',
  'Delivered',
  'Rejected',
];

interface SizeItem {
  _id: string;
  type: string;
  quantity: number;
}

interface OrderDetails {
  _id: string;
  product: {
    _id: string;
    product_name: string;
  };
  size: SizeItem[];
  orderStatus: string;
  price: {
    unit: string;
    amount: number;
    tip: number;
    coupon: string;
    deliveryCharge: number;
  };
  deliveryInfo: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: number;
    email: string;
    phone: number;
    location: {
      type: string;
      coordinates: number[];
    };
  };
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';

  const showroomId = useSelector(selectShowroomId);

  const { data, isLoading, error } = useGetOrderDetailsQuery({
    id: orderId,
    showroomId,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orderDetails: OrderDetails | null = data?.data || null;
  const [selectedStatus, setSelectedStatus] = useState(orderDetails?.orderStatus || '');

  // Update selected status when order details load
  useEffect(() => {
    if (orderDetails?.orderStatus) {
      setSelectedStatus(orderDetails.orderStatus);
    }
  }, [orderDetails?.orderStatus]);

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === orderDetails?.orderStatus) return;
    
    try {
      await updateOrderStatus({
        id: orderId,
        orderStatus: selectedStatus,
        showroomId,
      }).unwrap();
      // Show success message or notification here
    } catch (err) {
      console.error('Failed to update order status:', err);
      // Show error message here
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: string } = {
      'Order Placed': 'bg-yellow-900/30 text-yellow-500 border border-yellow-500/30',
      'Processing': 'bg-purple-900/30 text-purple-400 border border-purple-500/30',
      'Ready for Pickup': 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
      'Driver Accepted': 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30',
      'Picked Up': 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30',
      'Delivered': 'bg-green-900/30 text-green-400 border border-green-500/30',
      'Pending': 'bg-gray-900/30 text-gray-400 border border-gray-500/30',
      'Rejected': 'bg-red-900/30 text-red-400 border border-red-500/30',
    };
    return styles[status] || 'bg-gray-900/30 text-gray-400 border border-gray-500/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading order details...</div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load order details</div>
      </div>
    );
  }

  const totalAmount = orderDetails.price.amount + orderDetails.price.tip + orderDetails.price.deliveryCharge;
  const discountAmount = orderDetails.price.coupon ? totalAmount * 0.1 : 0; // Assuming 10% coupon discount
  const finalTotal = totalAmount - discountAmount;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center hover:bg-purple-600/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-purple-400" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="bg-white rounded-2xl p-6">
            <div className="bg-white rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              <img
                src="/images/jacket.png"
                alt={orderDetails.product.product_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-gradient-to-tr from-[#05011a] via-[#090322] to-[#05011a] border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700/50 pb-3">Order Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Product Name:</span>
                  <span className="text-white font-medium">{orderDetails.product.product_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Order ID:</span>
                  <span className="text-white font-medium">#{orderDetails._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Order Status:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-gray-800/50 border border-purple-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusChange}
                      disabled={isUpdating || selectedStatus === orderDetails.orderStatus}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Sizes & Quantity:</span>
                  <div className="flex gap-2">
                    {orderDetails.size.map((size) => (
                      <span key={size._id} className="text-white font-medium">
                        {size.type} x{size.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-gradient-to-tr from-[#05011a] via-[#090322] to-[#05011a] border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700/50 pb-3">Price Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Subtotal:</span>
                  <span className="text-white font-medium">{formatCurrency(orderDetails.price.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Tip:</span>
                  <span className="text-white font-medium">{formatCurrency(orderDetails.price.tip)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Delivery Charge:</span>
                  <span className="text-white font-medium">{formatCurrency(orderDetails.price.deliveryCharge)}</span>
                </div>
                {orderDetails.price.coupon && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Coupon ({orderDetails.price.coupon}):</span>
                    <span className="text-green-400 font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                  <span className="text-gray-300 font-medium">Total:</span>
                  <span className="text-white font-semibold text-lg">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-gradient-to-tr from-[#05011a] via-[#090322] to-[#05011a] border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-700/50 pb-3">Customer & Delivery Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Full Name:</span>
                <span className="text-white font-medium">{orderDetails.deliveryInfo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Email:</span>
                <span className="text-white font-medium text-sm">{orderDetails.deliveryInfo.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Phone:</span>
                <span className="text-white font-medium">{orderDetails.deliveryInfo.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Country:</span>
                <span className="text-white font-medium">{orderDetails.deliveryInfo.country}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">State:</span>
                <span className="text-white font-medium">{orderDetails.deliveryInfo.state}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Zip Code:</span>
                <span className="text-white font-medium">{orderDetails.deliveryInfo.zipcode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Address:</span>
                <span className="text-white font-medium text-sm">{orderDetails.deliveryInfo.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
