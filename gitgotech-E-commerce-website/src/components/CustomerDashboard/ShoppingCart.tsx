// "use client";

// import { SectionHeader } from "@/customComponent/Header";
// import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
// import {
//   useAddToCartWishListMutation,
//   useDeleteSaveListMutation,
//   useGetWishlistAndCartQuery,
// } from "@/redux/features/home/homeSlice";
// import { Minus, Plus, Trash2 } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { FaArrowLeft } from "react-icons/fa";

// export default function ShoppingCart() {
//   const router = useRouter();
//   const [page, setPage] = useState(1);
//   const [quantities, setQuantities] = useState<Record<string, number>>({});
//   const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
//     {},
//   );
//   const [showTipModal, setShowTipModal] = useState(false);
//   const [tipAmount, setTipAmount] = useState("5");

//   const {
//     data: cartData,
//     isLoading,
//     refetch,
//   } = useGetWishlistAndCartQuery({
//     type: "cart",
//     page: page,
//   });

//   console.log(cartData);

//   const [addToCartWishList] = useAddToCartWishListMutation();
//   const [deleteSaveItem] = useDeleteSaveListMutation();

//   const cartItems =
//     cartData?.data?.filter((item: any) => item.product !== null) || [];

//   // Initialize quantities and sizes when cart data loads
//   useEffect(() => {
//     if (cartItems.length > 0) {
//       const initialQuantities: Record<string, number> = {};
//       const initialSizes: Record<string, string> = {};
//       cartItems.forEach((item: any) => {
//         initialQuantities[item._id] = 1;
//         // Set default size to first available size
//         if (
//           item.product?.product_stocks &&
//           item.product.product_stocks.length > 0
//         ) {
//           initialSizes[item._id] = item.product.product_stocks[0].size;
//         }
//       });
//       setQuantities(initialQuantities);
//       setSelectedSizes(initialSizes);
//     }
//   }, [cartItems.length]);

//   const handleRemoveFromCart = async (id: string) => {
//     try {
//       const res = await deleteSaveItem(id).unwrap();
//       if (res?.success) {
//         toast.success("Removed from cart");
//         refetch();
//       }
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to remove item");
//     }
//   };

//   const getDiscountedPrice = (product: any) => {
//   const originalPrice = product?.product_price || 0;
//   const discount = product?.discount;

//   if (discount?.isValid && discount?.percentage) {
//     const discountAmount = (originalPrice * discount.percentage) / 100;
//     return originalPrice - discountAmount;
//   }

//   return originalPrice;
// };

//   const handleIncrement = async (item: any) => {
//     const currentQty = quantities[item._id] || 1;
//     const totalStock = getTotalStock(item.product?.product_stocks);

//     if (currentQty >= totalStock) {
//       toast.error("Cannot add more. Out of stock!");
//       return;
//     }

//     const newQuantity = currentQty + 1;
//     setQuantities((prev) => ({
//       ...prev,
//       [item._id]: newQuantity,
//     }));

//     try {
//       await addToCartWishList({
//         product: item.product._id,
//         saveType: "cart",
//         quantity: newQuantity,
//       }).unwrap();

//       refetch();
//       toast.success("Quantity updated");
//     } catch (error: any) {
//       console.error("Failed to update quantity:", error);
//     }
//   };

//   const handleDecrement = async (item: any) => {
//     const currentQty = quantities[item._id] || 1;

//     if (currentQty <= 1) {
//       return;
//     }

//     const newQuantity = currentQty - 1;
//     setQuantities((prev) => ({
//       ...prev,
//       [item._id]: newQuantity,
//     }));

//     try {
//       await addToCartWishList({
//         product: item.product._id,
//         saveType: "cart",
//         quantity: newQuantity,
//       }).unwrap();

//       refetch();
//       toast.success("Quantity updated");
//     } catch (error: any) {
//       console.error("Failed to update quantity:", error);
//     }
//   };

//   const getProductImage = (product: any) => {
//     if (!product) return "/images/jacket.png";
//     if (product.product_images && product.product_images.length > 0) {
//       return `${IMAGE_BASE_URL}/${product.product_images[0]}`;
//     }
//     return "/images/jacket.png";
//   };

//   const getTotalStock = (stocks: any[]) => {
//     if (!stocks || stocks.length === 0) return 0;
//     return stocks.reduce((acc, stock) => acc + (stock.stock || 0), 0);
//   };

//   // const calculateSubtotal = () => {
//   //   return cartItems.reduce((total: number, item: any) => {
//   //     const quantity = quantities[item._id] || 1;
//   //     return total + (item.product?.product_price || 0) * quantity;
//   //   }, 0);
//   // };

//   const calculateSubtotal = () => {
//   return cartItems.reduce((total: number, item: any) => {
//     const quantity = quantities[item._id] || 1;
//     const discountedPrice = getDiscountedPrice(item.product);
//     return total + discountedPrice * quantity;
//   }, 0);
// };

//   const calculateTotal = () => {
//     const subtotal = calculateSubtotal();
//     const deliveryCharge = 20.0;
//     const tax = subtotal * 0.1;
//     const tip = parseFloat(tipAmount) || 0;
//     return subtotal + deliveryCharge + tax + tip;
//   };

//   const handleTipSubmit = () => {
//     setShowTipModal(false);
//     toast.success("Tip amount saved!");
//   };

//   // Prepare cart data for checkout in the required order format
//   const getCartDataForCheckout = () => {
//     return cartItems.map((item: any) => ({
//       product: item.product._id,
//       size: [
//         {
//           type:
//             selectedSizes[item._id] ||
//             item.product.product_stocks?.[0]?.size ||
//             "",
//           quantity: quantities[item._id] || 1,
//         },
//       ],
//       orderType: item.product.vendor ? "vendor" : "custom",
//       deliveryType: "delivery", // Default to delivery, can be changed to "pick-up"
//       price: {
//         unit: "usd",
//         amount: item.product.product_price || 0,
//         tip: parseFloat(tipAmount) || 0,
//         coupon: "",
//         deliveryCharge: 30,
//       },
//     }));
//   };

//   return (
//     <div className="mt-16 md:mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
//       {/* Back Button */}
//       <div className="container mx-auto flex items-center gap-4">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
//         >
//           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
//             <FaArrowLeft className="text-black" />
//           </div>
//         </button>
//         <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant hidden md:block">
//           My Cart
//         </h1>
//       </div>

//       {/* Header */}
//       <div className="mb-6 md:mb-8 text-center">
//         <h1 className="flex items-center justify-center text-3xl md:text-4xl font-bold mb-3">
//           <SectionHeader title="My Shopping Cart"></SectionHeader>
//         </h1>
//         <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
//           Review your selected items before completing your order.
//         </p>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Cart Items */}
//         <div className="lg:col-span-2">
//           <div className="bg-gradient-to-br from-purple-900/10 to-gray-900/50 border-[#B8B8B8] border rounded-2xl p-4 md:p-6">
//             {/* Loading State */}
//             {isLoading && (
//               <div className="flex justify-center py-20">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
//               </div>
//             )}

//             {/* Cart Items */}
//             <div className="space-y-4">
//               {cartItems.length > 0
//                 ? cartItems.map((item: any) => {
//                     const product = item.product;
//                     const imageUrl = getProductImage(product);
//                     const totalStock = getTotalStock(product?.product_stocks);
//                     const isInStock = totalStock > 0;
//                     const quantity = quantities[item._id] || 1;
//                     const subtotal = (product?.product_price || 0) * quantity;

//                     return (
//                       <div
//                         key={item._id}
//                         className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-purple-900/10 p-4 border-[#B8B8B8] border-b rounded-lg"
//                       >
//                         {/* Product */}
//                         <div className="md:col-span-4 flex items-center gap-4">
//                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
//                             <img
//                               src={imageUrl}
//                               alt={product?.product_name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-sm md:text-base">
//                               {product?.product_name}
//                             </h3>
//                             <p className="text-xs text-gray-400 md:hidden mt-1">
//                               ${(product?.product_price || 0).toFixed(2)}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Size Selector */}
//                         <div className="md:col-span-2 text-left md:text-center">
//                           {product?.product_stocks &&
//                           product.product_stocks.length > 0 ? (
//                             <select
//                               value={selectedSizes[item._id] || ""}
//                               onChange={(e) => {
//                                 setSelectedSizes((prev) => ({
//                                   ...prev,
//                                   [item._id]: e.target.value,
//                                 }));
//                               }}
//                               className="bg-[#2E2E34] text-white px-3 py-2 rounded-lg text-sm border border-purple-500/30 focus:outline-none focus:border-purple-500"
//                             >
//                               {product.product_stocks.map((stock: any) => (
//                                 <option key={stock._id} value={stock.size}>
//                                   {stock.size} ({stock.stock} in stock)
//                                 </option>
//                               ))}
//                             </select>
//                           ) : (
//                             <span className="text-xs text-gray-400">
//                               No sizes available
//                             </span>
//                           )}
//                         </div>

//                         {/* Price */}
//                         <div className="md:col-span-2 text-left md:text-center">
//                           <span className="text-sm md:text-base hidden md:inline">
//                             ${(product?.product_price || 0).toFixed(2)}
//                           </span>
//                         </div>

//                         {/* Quantity */}
//                         <div className="md:col-span-2 flex justify-start md:justify-center">
//                           <div className="flex items-center gap-3 bg-[#2E2E34] rounded-3xl px-3 py-2">
//                             <button
//                               onClick={() => handleDecrement(item)}
//                               disabled={!isInStock || quantity <= 1}
//                               className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
//                             >
//                               <Minus className="w-3 h-3" />
//                             </button>
//                             <span className="text-sm font-semibold min-w-[20px] text-center">
//                               {quantity}
//                             </span>
//                             <button
//                               onClick={() => handleIncrement(item)}
//                               disabled={!isInStock || quantity >= totalStock}
//                               className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
//                             >
//                               <Plus className="w-3 h-3" />
//                             </button>
//                           </div>
//                         </div>

//                         {/* Subtotal & Remove */}
//                         <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
//                           <span className="font-semibold text-sm md:text-base">
//                             ${subtotal.toFixed(2)}
//                           </span>
//                           <button
//                             onClick={() =>
//                               handleRemoveFromCart(
//                                 item.product?._id || item._id,
//                               )
//                             }
//                             className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
//                           >
//                             <Trash2 className="w-4 h-4 text-red-400" />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })
//                 : !isLoading && (
//                     <div className="p-12 text-center">
//                       <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
//                         <svg
//                           className="w-10 h-10 text-purple-400"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
//                           />
//                         </svg>
//                       </div>
//                       <h3 className="text-xl font-semibold mb-2">
//                         Your cart is empty
//                       </h3>
//                       <button
//                         onClick={() => router.push("/")}
//                         className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
//                       >
//                         Browse Products
//                       </button>
//                     </div>
//                   )}
//             </div>
//           </div>
//         </div>

//         {/* Cart Total */}
//         <div className="lg:col-span-1">
//           <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-gray-800 rounded-2xl p-6 sticky top-8">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold">Cart Total</h2>
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                 <svg
//                   className="w-5 h-5 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                   />
//                 </svg>
//               </div>
//             </div>

//             {/* Price Breakdown */}
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">
//                   Subtotal
//                 </span>
//                 <span className="font-medium">
//                   ${calculateSubtotal().toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Delivery Charge</span>
//                 <span className="font-medium">$20.00</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Tax (10%)</span>
//                 <span className="font-medium">
//                   ${(calculateSubtotal() * 0.1).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">Tip</span>
//                 <button
//                   onClick={() => setShowTipModal(true)}
//                   className="text-purple-400 hover:text-purple-300 font-medium"
//                 >
//                   ${tipAmount}
//                 </button>
//               </div>
//               <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
//                 <span>Total</span>
//                 <span className="text-purple-400">
//                   ${calculateTotal().toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <Link
//               href={{
//                 pathname: "/checkout",
//                 query: {
//                   tip: tipAmount,
//                   cartData: JSON.stringify(getCartDataForCheckout()),
//                 },
//               }}
//             >
//               <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
//                 Proceed to Checkout
//               </button>
//             </Link>

//             <button
//               onClick={() => setShowTipModal(true)}
//               className="w-full mt-3 py-3 border border-purple-500/30 hover:bg-purple-500/10 rounded-full font-semibold transition-all duration-300"
//             >
//               Tip Your Driver
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tip Modal */}
//       {showTipModal && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
//           <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 rounded-2xl p-6 max-w-md w-full">
//             <button
//               onClick={() => setShowTipModal(false)}
//               className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <h2 className="text-2xl font-bold text-center mb-6">Add Tip</h2>
//             <p className="text-gray-400 text-sm text-center mb-6">
//               Show appreciation for your delivery person
//             </p>

//             <div className="grid grid-cols-4 gap-3 mb-6">
//               {["0", "5", "10", "15"].map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setTipAmount(amount)}
//                   className={`py-3 rounded-lg font-medium transition-colors ${
//                     tipAmount === amount
//                       ? "bg-purple-600 text-white"
//                       : "bg-gray-800 text-gray-400 hover:bg-gray-700"
//                   }`}
//                 >
//                   ${amount}
//                 </button>
//               ))}
//             </div>

//             <input
//               type="number"
//               value={tipAmount}
//               onChange={(e) => setTipAmount(e.target.value)}
//               placeholder="Custom amount"
//               className="w-full bg-purple-950/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-4"
//             />

//             <button
//               onClick={handleTipSubmit}
//               className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold transition-all"
//             >
//               Save Tip
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { SectionHeader } from "@/customComponent/Header";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import {
  FALLBACK_DISTANCE_DELIVERY_USD,
  productWeightToKg,
  RATE_PER_KG,
  RATE_PER_KM,
} from "@/lib/deliveryPricing";
import {
  useAddToCartWishListMutation,
  useDeleteSaveListMutation,
  useGetWishlistAndCartQuery,
} from "@/redux/features/home/homeSlice";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function ShoppingCart() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const {
    data: cartData,
    isLoading,
    refetch,
  } = useGetWishlistAndCartQuery({
    type: "cart",
    page: page,
  });

  console.log(cartData)

  const [addToCartWishList] = useAddToCartWishListMutation();
  const [deleteSaveItem] = useDeleteSaveListMutation();

  const cartItems =
    cartData?.data?.filter((item: any) => item.product !== null) || [];

  // Initialize quantities and sizes when cart data loads
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialQuantities: Record<string, number> = {};
      const initialSizes: Record<string, string> = {};
      cartItems.forEach((item: any) => {
        initialQuantities[item._id] = 1;
        if (
          item.product?.product_stocks &&
          item.product.product_stocks.length > 0
        ) {
          initialSizes[item._id] = item.product.product_stocks[0].size;
        }
      });
      setQuantities(initialQuantities);
      setSelectedSizes(initialSizes);
    }
  }, [cartItems.length]);

  // Get discounted price
  const getDiscountedPrice = (product: any) => {
    const originalPrice = product?.product_price || 0;
    const discount = product?.discount;

    if (discount?.isValid && discount?.percentage) {
      const discountAmount = (originalPrice * discount.percentage) / 100;
      return originalPrice - discountAmount;
    }

    return originalPrice;
  };

  const handleRemoveFromCart = async (id: string) => {
    try {
      const res = await deleteSaveItem(id).unwrap();
      if (res?.success) {
        toast.success("Removed from cart");
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove item");
    }
  };

  const handleIncrement = async (item: any) => {
    const currentQty = quantities[item._id] || 1;
    const selectedSize = selectedSizes[item._id];
    const stockInfo = item.product?.product_stocks?.find(
      (stock: any) => stock.size === selectedSize
    );
    const sizeStock = stockInfo ? stockInfo.stock : 0;

    if (currentQty >= sizeStock) {
      toast.error(`Cannot add more. Only ${sizeStock} items available for size ${selectedSize}`);
      return;
    }

    const newQuantity = currentQty + 1;
    setQuantities((prev) => ({
      ...prev,
      [item._id]: newQuantity,
    }));

   
  };

  const handleDecrement = async (item: any) => {
    const currentQty = quantities[item._id] || 1;
    if (currentQty <= 1) return;

    const newQuantity = currentQty - 1;
    setQuantities((prev) => ({
      ...prev,
      [item._id]: newQuantity,
    }));
  };

  const getProductImage = (product: any) => {
    if (!product) return "/images/jacket.png";
    if (product.product_images && product.product_images.length > 0) {
      return `${IMAGE_BASE_URL}/${product.product_images[0]}`;
    }
    return "/images/jacket.png";
  };

  const getTotalStock = (stocks: any[]) => {
    if (!stocks || stocks.length === 0) return 0;
    return stocks.reduce((acc, stock) => acc + (stock.stock || 0), 0);
  };

  const calculateSubtotal = () => {
    if (!selectedProduct) return 0;

    const selectedItem = cartItems.find(
      (item: any) => item._id === selectedProduct,
    );
    if (!selectedItem) return 0;

    const quantity = quantities[selectedItem._id] || 1;
    const discountedPrice = getDiscountedPrice(selectedItem.product);
    return discountedPrice * quantity;
  };

  const estimatedDeliveryCharge = useMemo(() => {
    if (!selectedProduct) return FALLBACK_DISTANCE_DELIVERY_USD;
    const item = cartItems.find((i: any) => i._id === selectedProduct);
    if (!item?.product) return FALLBACK_DISTANCE_DELIVERY_USD;
    const qty = quantities[item._id] || 1;
    const weightFee =
      productWeightToKg(item.product.product_weight) * qty * RATE_PER_KG;
    return parseFloat(
      (FALLBACK_DISTANCE_DELIVERY_USD + weightFee).toFixed(2),
    );
  }, [selectedProduct, cartItems, quantities]);

  const calculateTotal = () => {
    return calculateSubtotal() + estimatedDeliveryCharge;
  };

  const selectedItem = cartItems.find((item: any) => item._id === selectedProduct);
  const selectedSize = selectedProduct ? selectedSizes[selectedProduct] : null;
  const selectedStockInfo = selectedItem?.product?.product_stocks?.find(
    (s: any) => s.size === selectedSize
  );
  const isOutOfStock = selectedProduct ? (selectedStockInfo ? selectedStockInfo.stock <= 0 : true) : false;

  // Prepare cart data for checkout - ONLY selected product
  const getCartDataForCheckout = () => {
    if (!selectedProduct) return [];

    const selectedItem = cartItems.find(
      (item: any) => item._id === selectedProduct,
    );
    if (!selectedItem) return [];

    return [
      {
        product: selectedItem.product._id,
        size: [
          {
            type:
              selectedSizes[selectedItem._id] ||
              selectedItem.product.product_stocks?.[0]?.size ||
              "",
            quantity: quantities[selectedItem._id] || 1,
          },
        ],
        orderType: selectedItem.product.vendor ? "vendor" : "custom",
        deliveryType: "delivery",
        price: {
          unit: "usd",
          amount: getDiscountedPrice(selectedItem.product),
          tip: 0,
          coupon: "",
          deliveryCharge: estimatedDeliveryCharge,
        },
      },
    ];
  };

  return (
    <div className="mt-16 md:mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      {/* Back Button */}
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
          My Cart
        </h1>
      </div>

      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="flex items-center justify-center text-3xl md:text-4xl font-bold mb-3">
          <SectionHeader title="My Shopping Cart"></SectionHeader>
        </h1>
        <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
          Review your selected items before completing your order.
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-purple-900/10 to-gray-900/50 border-[#B8B8B8] border rounded-2xl p-4 md:p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.length > 0
                ? cartItems.map((item: any) => {
                    const product = item.product;
                    const imageUrl = getProductImage(product);
                    const currentSize = selectedSizes[item._id];
                    const stockInfo = product?.product_stocks?.find(
                      (s: any) => s.size === currentSize,
                    );
                    const sizeStock = stockInfo ? stockInfo.stock : 0;
                    const isInStock = sizeStock > 0;
                    const quantity = quantities[item._id] || 1;
                    const discountedPrice = getDiscountedPrice(product);
                    const subtotal = discountedPrice * quantity;
                    const hasDiscount =
                      product?.discount?.isValid &&
                      product?.discount?.percentage;

                    return (
                      <div
                        key={item._id}
                        className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-[#B8B8B8] border-b rounded-lg transition-all ${
                          selectedProduct === item._id
                            ? "bg-purple-900/30 border-purple-500"
                            : "bg-purple-900/10 hover:bg-purple-900/20"
                        }`}
                      >
                        {/* Radio Button for Selection */}
                        <div className="md:col-span-1 flex justify-center">
                          <input
                            type="radio"
                            name="selectedProduct"
                            checked={selectedProduct === item._id}
                            onChange={() => setSelectedProduct(item._id)}
                            className="w-5 h-5 text-purple-600 cursor-pointer"
                          />
                        </div>

                        {/* Product */}
                        <div className="md:col-span-3 flex items-center gap-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={product?.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm md:text-base">
                              {product?.product_name}
                            </h3>
                            {/* Mobile price */}
                            <div className="md:hidden mt-1">
                              {hasDiscount ? (
                                <>
                                  <span className="text-gray-400 line-through text-xs block">
                                    ₵{(product?.product_price || 0).toFixed(2)}
                                  </span>
                                  <span className="text-green-400 text-xs font-semibold">
                                    ₵{discountedPrice.toFixed(2)}{" "}
                                    <span className="text-purple-400">
                                      -{product.discount.percentage}% off
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <p className="text-xs text-gray-400">
                                  ₵{(product?.product_price || 0).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Size Selector */}
                        <div className="md:col-span-2 text-left md:text-center">
                          {product?.product_stocks &&
                          product.product_stocks.length > 0 ? (
                            <select
                              value={selectedSizes[item._id] || ""}
                              onChange={(e) => {
                                const newSize = e.target.value;
                                setSelectedSizes((prev) => ({
                                  ...prev,
                                  [item._id]: newSize,
                                }));

                                // Check if current quantity exceeds new size stock
                                const stockInfo = product.product_stocks.find(
                                  (s: any) => s.size === newSize,
                                );
                                const newSizeStock = stockInfo
                                  ? stockInfo.stock
                                  : 0;
                                if (quantities[item._id] > newSizeStock) {
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [item._id]:
                                      newSizeStock > 0 ? newSizeStock : 1,
                                  }));
                                }
                              }}
                              className="bg-[#2E2E34] text-white px-3 py-2 rounded-lg text-sm border border-purple-500/30 focus:outline-none focus:border-purple-500"
                            >
                              {product.product_stocks.map((stock: any) => (
                                <option key={stock._id} value={stock.size}>
                                  {stock.size} ({stock.stock} in stock)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No sizes available
                            </span>
                          )}
                        </div>

                        {/* Price - Desktop */}
                        <div className="md:col-span-2 text-left md:text-center hidden md:block">
                          {hasDiscount ? (
                            <>
                              <span className="text-gray-400 line-through text-xs block">
                                ₵{(product?.product_price || 0).toFixed(2)}
                              </span>
                              <span className="text-green-400 text-sm font-semibold">
                                ₵{discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-purple-400 block">
                                -{product.discount.percentage}% off
                              </span>
                            </>
                          ) : (
                            <span className="text-sm md:text-base">
                              ₵{(product?.product_price || 0).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex justify-start md:justify-center">
                          <div className="flex items-center gap-3 bg-[#2E2E34] rounded-3xl px-3 py-2">
                            <button
                              onClick={() => handleDecrement(item)}
                              disabled={!isInStock || quantity <= 1}
                              className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold min-w-[20px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item)}
                              disabled={!isInStock || quantity >= sizeStock}
                              className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                          <div>
                            <span className="font-semibold text-sm md:text-base">
                              ₵{subtotal.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-green-400 block">
                                Saved ₵
                                {(
                                  (product.product_price - discountedPrice) *
                                  quantity
                                ).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveFromCart(
                                item.product?._id || item._id,
                              )
                            }
                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                : !isLoading && (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Your cart is empty
                      </h3>
                      <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  )}
            </div>
          </div>
        </div>

        {/* Cart Total */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-gray-800 rounded-2xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Cart Total</h2>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-medium">
                  ₵{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivery (est.)</span>
                <span className="font-medium">
                  ₵{estimatedDeliveryCharge.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 -mt-1 mb-1">
                ₵{RATE_PER_KM}/km (distance) + ₵{RATE_PER_KG}/kg × product weight;
                finalized at checkout with your pin.
              </p>
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax (10%)</span>
                <span className="font-medium">
                  ₵{(calculateSubtotal() * 0.1).toFixed(2)}
                </span>
              </div> */}
              <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                <span>Total</span>
                <span className="text-purple-400">
                  ₵{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href={
                selectedProduct && !isOutOfStock
                  ? {
                      pathname: "/checkout",
                      query: {
                        tip: "0",
                        cartData: JSON.stringify(getCartDataForCheckout()),
                      },
                    }
                  : "#"
              }
              className={!selectedProduct || isOutOfStock ? "pointer-events-none" : ""}
            >
              <button
                disabled={!selectedProduct || isOutOfStock}
                className={`w-full py-3 rounded-full font-semibold transition-all duration-300 transform ${
                  selectedProduct && !isOutOfStock
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Proceed to Checkout"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}