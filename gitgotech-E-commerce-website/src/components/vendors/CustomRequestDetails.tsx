// "use client";

// import BackButton from "@/customComponent/BackButton";
// import {
//   useChangeCustomOrderStatusMutation,
//   useGetCustomOrderDetailsQuery,
// } from "@/redux/features/vendor/order/orderSlice";
// import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// interface CustomOrderDetails {
//   _id: string;
//   customer:
//     | string
//     | {
//         _id: string;
//         name: string;
//         email?: string;
//         phone?: string;
//         image?: string;
//       };
//   productId: {
//     _id: string;
//     product_name: string;
//     product_images?: string[];
//   };
//   showroomId: {
//     _id: string;
//     showroom_name: string;
//     logo?: string;
//   };
//   orderStatus: string;
//   customDetail?: string;
//   size?: string;
//   quantity?: number;
//   price?: {
//     amount: number;
//     unit: string;
//     deliveryCharge?: number;
//     tip?: number;
//   };
//   deliveryInfo?: {
//     name: string;
//     address: string;
//     country: string;
//     state: string;
//     zipcode: number;
//     phone?: number | string;
//     email?: string;
//     location?: {
//       type: string;
//       coordinates: number[];
//     };
//   };
//   pickUpInfo?: {
//     name: string;
//     address: string;
//     country: string;
//     state: string;
//     zipcode: number;
//     phone?: number | string;
//     email?: string;
//     location?: {
//       type: string;
//       coordinates: number[];
//     };
//   };
//   deliveryType?: string;
//   reason?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const CUSTOM_ORDER_STATUS_OPTIONS = [
 
//   "Processing",
//   "Ready for Pickup",
   
// ];

// export default function CustomRequestDetails() {
//   const searchParams = useSearchParams();
//   const orderId = searchParams.get("id");

//   const showroomId = useSelector(selectShowroomId);
//   const [showActionModal, setShowActionModal] = useState(false);
//   const [modalType, setModalType] = useState<"accept" | "decline" | null>(null);
//   const [price, setPrice] = useState("");
//   const [priceUnit, setPriceUnit] = useState("usd");
//   const [reason, setReason] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("");

//   console.log(selectedStatus);

//   const [changeCustomOrderStatus] = useChangeCustomOrderStatusMutation();

//   const {
//     data: orderData,
//     isLoading,
//     refetch,
//   } = useGetCustomOrderDetailsQuery(
//     { id: orderId!, showroomId },
//     { skip: !orderId },
//   );

//   const order: CustomOrderDetails | null = orderData || null;

//   useEffect(() => {
//     if (order?.orderStatus) {
//       setSelectedStatus(order.orderStatus);
//     }
//   }, [order?.orderStatus]);

//   const handleOpenAcceptModal = () => {
//     setModalType("accept");
//     setShowActionModal(true);
//     setPrice("");
//     setPriceUnit("usd");
//   };

//   const handleOpenDeclineModal = () => {
//     setModalType("decline");
//     setShowActionModal(true);
//     setReason("");
//   };

//   const handleSubmitPrice = async () => {
//     if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) return;
//     if (!orderId) return;

//     try {
//       await changeCustomOrderStatus({
//         id: orderId, 
//         orderStatus: selectedStatus, 
//         showroomId,
//       }).unwrap();
//       refetch();
//       setShowActionModal(false);
//     } catch (err) {
//       console.error("Failed to update order status:", err);
//     }
//   };

//   const handleSendReason = async () => {
//     if (!reason.trim() || !orderId) return;

//     try {
//       await changeCustomOrderStatus({
//         id: orderId,
//         action: "declined",
//         reason,
//         showroomId,
//       }).unwrap();
//       refetch();
//       setShowActionModal(false);
//     } catch (err) {
//       console.error("Failed to update order status:", err);
//     }
//   };

//   const handleStatusChange = async (newStatus: string) => {
//     if (!orderId) return;

//     const action =
//       newStatus === "Vendor Accepted" ||
//       newStatus === "Customer Accepted" ||
//       newStatus === "Paid" ||
//       newStatus === "Driver Accepted" ||
//       newStatus === "Picked Up" ||
//       newStatus === "Delivered"
//         ? "accepted"
//         : "declined";

//     try {
//       await changeCustomOrderStatus({
//         id: orderId,
//         action,
//         price: action === "accepted" ? order?.price?.amount : undefined,
//         priceUnit: action === "accepted" ? order?.price?.unit : undefined,
//         reason: action === "declined" ? reason : undefined,
//         showroomId,
//       }).unwrap();
//       setSelectedStatus(newStatus);
//       refetch();
//     } catch (err) {
//       console.error("Failed to change status:", err);
//     }
//   };

//   const closeModal = () => {
//     setShowActionModal(false);
//     setModalType(null);
//     setPrice("");
//     setPriceUnit("usd");
//     setReason("");
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8 flex items-center justify-center">
//         <div className="text-xl text-purple-400">Loading...</div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8 flex items-center justify-center">
//         <div className="text-xl text-red-400">Order not found</div>
//       </div>
//     );
//   }

//   // Get customer name - handle both string ID and object
//   const customerName =
//     typeof order.customer === "object" ? order.customer?.name : "Customer";

//   const productImage =
//     order.productId?.product_images?.[0] || "/images/placeholder.png";

//   const canEditStatus =
//     order.orderStatus !== "Vendor Rejected" &&
//     order.orderStatus !== "Customer Rejected";

//   return (
//     <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//           <BackButton title="View Details" />
//           <div className="flex gap-4 w-full md:w-auto">
//             {canEditStatus && (
//               <>
//                 <button
//                   onClick={handleOpenAcceptModal}
//                   disabled={order.orderStatus === "Vendor Accepted"}
//                   className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Accept
//                 </button>
//                 <button
//                   onClick={handleOpenDeclineModal}
//                   disabled={order.orderStatus === "Vendor Rejected"}
//                   className="flex-1 md:flex-none px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Decline
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
//           {/* Product Image */}
//           <div className="bg-white rounded-xl p-6 flex items-center justify-center h-80">
//             <img
//               src={productImage}
//               alt={order.productId?.product_name}
//               className="object-contain max-h-full max-w-full"
//             />
//           </div>

//           {/* Details Section */}
//           <div className="flex flex-col gap-6">
//             {/* Order Details Card */}
//             <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
//               <h2 className="text-xl font-semibold mb-6">Order Details</h2>

//               <div className="space-y-4">
//                 <DetailRow
//                   label="Product Name:"
//                   value={order.productId?.product_name || "N/A"}
//                 />
//                 <DetailRow label="Size:" value={order.size || "N/A"} />
//                 <DetailRow
//                   label="Quantity:"
//                   value={order.quantity?.toString() || "N/A"}
//                 />
//                 <DetailRow
//                   label="Price:"
//                   value={
//                     order.price
//                       ? `$${order.price.amount} (${order.price.unit?.toUpperCase()})`
//                       : "N/A"
//                   }
//                 />
//                 {order.price?.deliveryCharge && (
//                   <DetailRow
//                     label="Delivery Charge:"
//                     value={`$${order.price.deliveryCharge}`}
//                   />
//                 )}
//                 {order.price?.tip && (
//                   <DetailRow label="Tip:" value={`$${order.price.tip}`} />
//                 )}
//                 <DetailRow
//                   label="Custom Detail:"
//                   value={order.customDetail || "N/A"}
//                 />
//                 <DetailRow
//                   label="Order Status:"
//                   value={
//                     <select
//                       value={selectedStatus}
//                       onChange={(e) => handleStatusChange(e.target.value)}
//                       disabled={!canEditStatus}
//                       className="bg-[#1a1a2e] border border-purple-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
//                     >
//                       {CUSTOM_ORDER_STATUS_OPTIONS.map((status) => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))}
//                     </select>
//                   }
//                 />
//                 {order.reason && (
//                   <DetailRow label="Reason:" value={order.reason} />
//                 )}
//               </div>

//               <div className="flex items-center gap-3 mt-6">
//                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
//                   👤
//                 </div>
//                 <div>
//                   <div className="text-sm font-medium">{customerName}</div>
//                   <div className="text-xs text-gray-400">
//                     {new Date(order.createdAt).toLocaleDateString()}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Details Card */}
//             <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
//               <h2 className="text-xl font-semibold mb-6">Customer Details</h2>

//               <div className="space-y-4">
//                 <DetailRow
//                   label="Full Name:"
//                   value={order.deliveryInfo?.name || customerName}
//                 />
//                 {order.deliveryInfo && (
//                   <>
//                     <DetailRow
//                       label="Email:"
//                       value={order.deliveryInfo.email || "N/A"}
//                     />
//                     <DetailRow
//                       label="Phone:"
//                       value={
//                         order.deliveryInfo.phone?.toString() ||
//                         order.customer?.toString() ||
//                         "N/A"
//                       }
//                     />
//                     <DetailRow
//                       label="Country:"
//                       value={order.deliveryInfo.country || "N/A"}
//                     />
//                     <DetailRow
//                       label="State:"
//                       value={order.deliveryInfo.state || "N/A"}
//                     />
//                     <DetailRow
//                       label="Zip Code:"
//                       value={order.deliveryInfo.zipcode?.toString() || "N/A"}
//                     />
//                     <DetailRow
//                       label="Street Address:"
//                       value={order.deliveryInfo.address || "N/A"}
//                     />
//                   </>
//                 )}
//                 {order.deliveryType && (
//                   <DetailRow
//                     label="Delivery Type:"
//                     value={
//                       order.deliveryType.charAt(0).toUpperCase() +
//                       order.deliveryType.slice(1)
//                     }
//                   />
//                 )}
//               </div>
//             </div>

//             {/* Showroom Details Card */}
//             {order.showroomId && (
//               <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
//                 <h2 className="text-xl font-semibold mb-6">Showroom Details</h2>

//                 <div className="space-y-4">
//                   <DetailRow
//                     label="Showroom Name:"
//                     value={
//                       typeof order.showroomId === "object"
//                         ? order.showroomId.showroom_name
//                         : "N/A"
//                     }
//                   />
//                   {order.pickUpInfo && (
//                     <>
//                       <DetailRow
//                         label="Pickup Address:"
//                         value={order.pickUpInfo.address || "N/A"}
//                       />
//                       <DetailRow
//                         label="Pickup Phone:"
//                         value={order.pickUpInfo.phone?.toString() || "N/A"}
//                       />
//                       <DetailRow
//                         label="Pickup Email:"
//                         value={order.pickUpInfo.email || "N/A"}
//                       />
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Action Modal */}
//       {showActionModal && (
//         <div
//           className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           onClick={closeModal}
//         >
//           <div
//             className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border-2 border-purple-500/50 rounded-2xl p-8 w-full max-w-md relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={closeModal}
//               className="absolute top-4 right-4 text-[#8a8a9d] hover:text-white transition-colors text-xl font-bold"
//             >
//               ✕
//             </button>

//             {/* Accept Modal */}
//             {modalType === "accept" && (
//               <>
//                 <h2 className="text-2xl font-semibold text-center mb-2">
//                   Provide A Price
//                 </h2>
//                 <p className="text-purple-400 text-sm text-center mb-6">
//                   Enter the price for this custom order
//                 </p>

//                 <div className="mb-4">
//                   <label className="block text-sm text-gray-400 mb-2">
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={price}
//                     onChange={(e) => setPrice(e.target.value)}
//                     placeholder="Enter an offered price"
//                     className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
//                   />
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm text-gray-400 mb-2">
//                     Currency
//                   </label>
//                   <select
//                     value={priceUnit}
//                     onChange={(e) => setPriceUnit(e.target.value)}
//                     className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500"
//                   >
//                     <option value="usd">USD</option>
//                     <option value="eur">EUR</option>
//                     <option value="gbp">GBP</option>
//                     <option value="bdt">BDT</option>
//                   </select>
//                 </div>

//                 <button
//                   onClick={handleSubmitPrice}
//                   disabled={
//                     !price || isNaN(parseFloat(price)) || parseFloat(price) <= 0
//                   }
//                   className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//               </>
//             )}

//             {/* Decline Modal */}
//             {modalType === "decline" && (
//               <>
//                 <h2 className="text-2xl font-semibold text-center mb-2">
//                   Reason
//                 </h2>
//                 <p className="text-purple-400 text-sm text-center mb-6">
//                   Tell us why you&apos;re declining this order
//                 </p>

//                 <textarea
//                   value={reason}
//                   onChange={(e) => setReason(e.target.value)}
//                   placeholder="Write your reason"
//                   className="w-full min-h-[120px] bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y mb-5"
//                 />

//                 <button
//                   onClick={handleSendReason}
//                   disabled={!reason.trim()}
//                   className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Send
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Detail Row Component
// const DetailRow: React.FC<{
//   label: string;
//   value: string | React.ReactNode;
// }> = ({ label, value }) => (
//   <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
//     <span className="text-gray-400 text-sm">{label}</span>
//     <span className="text-white text-sm font-medium text-right">{value}</span>
//   </div>
// );


"use client";

import BackButton from "@/customComponent/BackButton";
import {
  getVendorCustomOrderStatusSelectOptions,
  isAllowedVendorCustomOrderStatusTransition,
  vendorCanChangeCustomOrderStatus,
} from "@/lib/vendorCustomOrderStatusFlow";
import {
  useAcceptOrDeclineCustomOrderMutation,
  useChangeCustomOrderStatusMutation,
  useGetCustomOrderDetailsQuery,
} from "@/redux/features/vendor/order/orderSlice";
import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface CustomOrderDetails {
  _id: string;
  customer:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        image?: string;
      };
  productId: {
    _id: string;
    product_name: string;
    product_images?: string[];
  };
  showroomId: {
    _id: string;
    showroom_name: string;
    logo?: string;
  };
  orderStatus: string;
  customDetail?: string;
  size?: string;
  quantity?: number;
  price?: {
    amount: number;
    unit: string;
    deliveryCharge?: number;
    tip?: number;
  };
  deliveryInfo?: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: number;
    phone?: number | string;
    email?: string;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
  pickUpInfo?: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: number;
    phone?: number | string;
    email?: string;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
  deliveryType?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomRequestDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const showroomId = useSelector(selectShowroomId);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "decline" | null>(null);
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("usd");
  const [reason, setReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [changeCustomOrderStatus] = useChangeCustomOrderStatusMutation();
  const [acceptOrDeclineCustomOrder] =
    useAcceptOrDeclineCustomOrderMutation();

  const {
    data: orderData,
    isLoading,
    refetch,
  } = useGetCustomOrderDetailsQuery(
    { id: orderId!, showroomId },
    { skip: !orderId },
  );

  const order: CustomOrderDetails | null = orderData || null;

  useEffect(() => {
    if (order?.orderStatus) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order?.orderStatus]);

  const handleOpenAcceptModal = () => {
    setModalType("accept");
    setShowActionModal(true);
    setPrice("");
    setPriceUnit("usd");
  };

  const handleOpenDeclineModal = () => {
    setModalType("decline");
    setShowActionModal(true);
    setReason("");
  };

  const handleSubmitAccept = async () => {
    if (!orderId) return;
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) return;

    try {
      await acceptOrDeclineCustomOrder({
        id: orderId,
        action: "accepted",
        price: parseFloat(price),
        priceUnit,
        showroomId,
      }).unwrap();
      refetch();
      setShowActionModal(false);
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const handleSendReason = async () => {
    if (!reason.trim() || !orderId) return;

    try {
      await acceptOrDeclineCustomOrder({
        id: orderId,
        action: "declined",
        reason,
        showroomId,
      }).unwrap();
      refetch();
      setShowActionModal(false);
    } catch (err) {
      console.error("Failed to decline order:", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!orderId || !order) return;
    if (!isAllowedVendorCustomOrderStatusTransition(order.orderStatus, newStatus)) {
      return;
    }

    try {
      await changeCustomOrderStatus({
        id: orderId,
        orderStatus: newStatus,
        showroomId,
      }).unwrap();
      setSelectedStatus(newStatus);
      refetch();
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  const closeModal = () => {
    setShowActionModal(false);
    setModalType(null);
    setPrice("");
    setPriceUnit("usd");
    setReason("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8 flex items-center justify-center">
        <div className="text-xl text-purple-400">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8 flex items-center justify-center">
        <div className="text-xl text-red-400">Order not found</div>
      </div>
    );
  }

  const customerName =
    typeof order.customer === "object" ? order.customer?.name : "Customer";

  const productImage =
    order.productId?.product_images?.[0] || "/images/placeholder.png";

  const canRespondOrderPlaced = order.orderStatus === "Order Placed";

  const canUseVendorStatusSelect = vendorCanChangeCustomOrderStatus(
    order.orderStatus,
  );

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <BackButton title="View Details" />
          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={handleOpenAcceptModal}
              disabled={!canRespondOrderPlaced}
              className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={handleOpenDeclineModal}
              disabled={!canRespondOrderPlaced}
              className="flex-1 md:flex-none px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl p-6 flex items-center justify-center h-80">
            <img
              src={productImage}
              alt={order.productId?.product_name}
              className="object-contain max-h-full max-w-full"
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            {/* Order Details Card */}
            <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Order Details</h2>

              <div className="space-y-4">
                <DetailRow
                  label="Product Name:"
                  value={order.productId?.product_name || "N/A"}
                />
                <DetailRow label="Size:" value={order.size || "N/A"} />
                <DetailRow
                  label="Quantity:"
                  value={order.quantity?.toString() || "N/A"}
                />
                <DetailRow
                  label="Price:"
                  value={
                    order.price
                      ? `₵${order.price.amount} (${order.price.unit?.toUpperCase()})`
                      : "N/A"
                  }
                />
                {order.price?.deliveryCharge && (
                  <DetailRow
                    label="Delivery Charge:"
                    value={`₵${order.price.deliveryCharge}`}
                  />
                )}
                {order.price?.tip && (
                  <DetailRow label="Tip:" value={`₵${order.price.tip}`} />
                )}
                <DetailRow
                  label="Custom Detail:"
                  value={order.customDetail || "N/A"}
                />
                <DetailRow
                  label="Order Status:"
                  value={
                    canUseVendorStatusSelect ? (
                      <select
                        value={selectedStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="bg-[#1a1a2e] border border-purple-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        {getVendorCustomOrderStatusSelectOptions(
                          order.orderStatus,
                        ).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-white">{order.orderStatus}</span>
                    )
                  }
                />
                {order.reason && (
                  <DetailRow label="Reason:" value={order.reason} />
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <div className="text-sm font-medium">{customerName}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Customer Details</h2>

              <div className="space-y-4">
                <DetailRow
                  label="Full Name:"
                  value={order.deliveryInfo?.name || customerName}
                />
                {order.deliveryInfo && (
                  <>
                    <DetailRow
                      label="Email:"
                      value={order.deliveryInfo.email || "N/A"}
                    />
                    <DetailRow
                      label="Phone:"
                      value={
                        order.deliveryInfo.phone?.toString() ||
                        order.customer?.toString() ||
                        "N/A"
                      }
                    />
                    <DetailRow
                      label="Country:"
                      value={order.deliveryInfo.country || "N/A"}
                    />
                    <DetailRow
                      label="State:"
                      value={order.deliveryInfo.state || "N/A"}
                    />
                    <DetailRow
                      label="Zip Code:"
                      value={order.deliveryInfo.zipcode?.toString() || "N/A"}
                    />
                    <DetailRow
                      label="Street Address:"
                      value={order.deliveryInfo.address || "N/A"}
                    />
                  </>
                )}
                {order.deliveryType && (
                  <DetailRow
                    label="Delivery Type:"
                    value={
                      order.deliveryType.charAt(0).toUpperCase() +
                      order.deliveryType.slice(1)
                    }
                  />
                )}
              </div>
            </div>

            {/* Showroom Details Card */}
            {order.showroomId && (
              <div className="bg-[#1e1e32]/80 border border-purple-500/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Showroom Details</h2>

                <div className="space-y-4">
                  <DetailRow
                    label="Showroom Name:"
                    value={
                      typeof order.showroomId === "object"
                        ? order.showroomId.showroom_name
                        : "N/A"
                    }
                  />
                  {order.pickUpInfo && (
                    <>
                      <DetailRow
                        label="Pickup Address:"
                        value={order.pickUpInfo.address || "N/A"}
                      />
                      <DetailRow
                        label="Pickup Phone:"
                        value={order.pickUpInfo.phone?.toString() || "N/A"}
                      />
                      <DetailRow
                        label="Pickup Email:"
                        value={order.pickUpInfo.email || "N/A"}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border-2 border-purple-500/50 rounded-2xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#8a8a9d] hover:text-white transition-colors text-xl font-bold"
            >
              ✕
            </button>

            {/* Accept Modal */}
            {modalType === "accept" && (
              <>
                <h2 className="text-2xl font-semibold text-center mb-2">
                  Provide a price
                </h2>
                <p className="text-purple-400 text-sm text-center mb-6">
                  Accepted orders require price and currency for the customer.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter offered price"
                    className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Currency (priceUnit)
                  </label>
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="usd">usd</option>
                    <option value="eur">eur</option>
                    <option value="gbp">gbp</option>
                    <option value="bdt">bdt</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAccept}
                  disabled={
                    !price ||
                    isNaN(parseFloat(price)) ||
                    parseFloat(price) <= 0
                  }
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </>
            )}

            {/* Decline Modal */}
            {modalType === "decline" && (
              <>
                <h2 className="text-2xl font-semibold text-center mb-2">
                  Reason
                </h2>
                <p className="text-purple-400 text-sm text-center mb-6">
                  Tell us why you&apos;re declining this order
                </p>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Write your reason"
                  className="w-full min-h-[120px] bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y mb-5"
                />

                <button
                  type="button"
                  onClick={handleSendReason}
                  disabled={!reason.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Detail Row Component
const DetailRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white text-sm font-medium text-right">{value}</span>
  </div>
);