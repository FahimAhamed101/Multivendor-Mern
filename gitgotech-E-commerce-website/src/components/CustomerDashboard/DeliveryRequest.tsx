"use client";

import BackButton from "@/customComponent/BackButton";
import { useGetDeliveryRequestsQuery } from "@/redux/features/deliveryRequest/deliveryRequest";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Loader,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Coordinates {
  lat: number;
  lng: number;
}

interface PickupLocation {
  name: string;
  phone: string;
  location: string;
  email?: string;
  coordinates?: Coordinates[];
}

interface DeliveryAddress {
  name: string;
  phone: string;
  location: string;
  email?: string;
  coordinates?: Coordinates[];
}

interface Price {
  currency: string;
  tip: number;
  deliveryFee: number;
}

interface Weight {
  unit: string;
  value: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface Delivery {
  _id: string;
  user: UserData;
  pickupLocation: PickupLocation;
  deliveryAddress: DeliveryAddress;
  numberOfItems: number;
  price: Price;
  weight: Weight;
  status: string;
  type: string;
  images?: string[];
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

const DeliveryRequest = () => {
  const router = useRouter();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: deliveriesData,
    isLoading,
    error,
  } = useGetDeliveryRequestsQuery({});

  const deliveries: Delivery[] = deliveriesData?.data || [];

  const getTotalPrice = (price: Price): number => {
    return (price?.deliveryFee || 0) + (price?.tip || 0);
  };

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-600";
      case "accepted":
        return "bg-blue-600";
      case "pending":
        return "bg-yellow-600";
      case "in progress":
      case "picked_up":
        return "bg-purple-600";
      case "rejected":
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      case "in progress":
      case "picked_up":
        return <Loader className="w-4 h-4 animate-spin" />;
      case "rejected":
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show error toast only once when error occurs
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load delivery requests");
    }
  }, [error]);

  return (
    <div className="container mx-auto mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6 min-h-screen">
      {/* Header */}
      <BackButton title="Request Delivery" className="text-[24px]" />
      <div className="text-center mt-12">
        <h1 className="text-3xl font-bold font-cormorant">
          Request A Delivery
        </h1>
        <p className="text-gray-400 mt-1">
          View the history of the requested delivery
        </p>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div></div>
        <button
          onClick={() => router.push("/customer-dashboard/newdelivery-request")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          New Request
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">
            Loading delivery requests...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-400">
            Failed to load delivery requests. Please try again later.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && deliveries.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No delivery requests found</p>
          <p className="text-gray-500 text-sm mt-2">
            Create a new request to get started
          </p>
        </div>
      )}

      {/* Deliveries List */}
      {!isLoading && deliveries.length > 0 && (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(delivery)}
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  {delivery.images && delivery.images.length > 0 ? (
                    <img
                      src={`/images/${delivery.images[0]}`}
                      alt="Delivery"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/jacket.png";
                      }}
                    />
                  ) : (
                    <Package className="w-10 h-10 text-gray-600" />
                  )}
                </div>

                {/* Delivery Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {delivery.deliveryAddress.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-xs">
                          {delivery.deliveryAddress.location}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)} flex items-center space-x-1`}
                      >
                        {getStatusIcon(delivery.status)}
                        <span className="capitalize">{delivery.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">
                        ₵{getTotalPrice(delivery.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">
                        Items: {delivery.numberOfItems}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {formatDate(delivery.createdAt)}
                      </div>
                      <div className="flex items-center space-x-1 mt-1 text-purple-400 text-xs">
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedDelivery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-r from-black via-[#0f0924] to-black border border-gray-700 rounded-lg max-w-3xl w-full max-h-[82vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-black via-[#0f0924] to-black border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-cormorant">
                Delivery Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedDelivery.status)} flex items-center space-x-2`}
                >
                  {getStatusIcon(selectedDelivery.status)}
                  <span className="capitalize">{selectedDelivery.status}</span>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Requester Information</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.user.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Pickup Location</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.pickupLocation.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.pickupLocation.phone}
                    </span>
                  </div>
                  {selectedDelivery.pickupLocation.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {selectedDelivery.pickupLocation.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-300">
                      {selectedDelivery.pickupLocation.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>Delivery Address</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.deliveryAddress.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {selectedDelivery.deliveryAddress.phone}
                    </span>
                  </div>
                  {selectedDelivery.deliveryAddress.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {selectedDelivery.deliveryAddress.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-300">
                      {selectedDelivery.deliveryAddress.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-yellow-400" />
                  <span>Package Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Number of Items</p>
                    <p className="text-white font-semibold">
                      {selectedDelivery.numberOfItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white font-semibold">
                      {selectedDelivery.weight.value}{" "}
                      {selectedDelivery.weight.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Type</p>
                    <p className="text-white font-semibold capitalize">
                      {selectedDelivery.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Created At</p>
                    <p className="text-white font-semibold">
                      {formatDate(selectedDelivery.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span>Pricing Details</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span className="text-white font-semibold">
                      ₵{selectedDelivery.price.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tip</span>
                    <span className="text-white font-semibold">
                      ₵{selectedDelivery.price.tip.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                    <span className="text-gray-300 font-semibold">Total</span>
                    <span className="text-purple-400 font-bold text-xl">
                      ₵{getTotalPrice(selectedDelivery.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Currency: {selectedDelivery.price.currency.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedDelivery.images &&
                selectedDelivery.images.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Delivery Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedDelivery.images.map((image, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 rounded-lg overflow-hidden"
                        >
                          <img
                            src={`/images/${image}`}
                            alt={`Delivery ${index + 1}`}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/jacket.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Rejection Reason */}
              {selectedDelivery.rejectedReason && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">
                    Rejection Reason
                  </h3>
                  <p className="text-gray-300">
                    {selectedDelivery.rejectedReason}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-black via-[#0f0924] to-black border-t border-gray-700 p-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRequest;
