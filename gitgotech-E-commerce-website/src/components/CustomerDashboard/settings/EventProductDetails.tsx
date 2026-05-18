"use client"

import { useState, useEffect } from 'react';
import { MessageCircle, Ruler, Calendar, ChevronDown } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetProductDetailsforCustomerQuery } from '@/redux/features/home/homeSlice';
import { IMAGE_BASE_URL } from '@/lib/imageBaseUrl';
import { useEventProductSizeAddEditMutation } from '@/redux/features/event/eventSlice';
import toast from 'react-hot-toast';

export default function EventProductDetails() {
  const [activeTab, setActiveTab] = useState('description');
  const [user, setUser] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const eventType = searchParams.get('type');
  const eventId = searchParams.get('eventId');

  const { data: eventProductData, isLoading } = useGetProductDetailsforCustomerQuery(productId);

  console.log(eventProductData);

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const productData = eventProductData?.data;

  const isCreator = eventType === 'creator';
  const isInvited = eventType === 'invited';

  const imageSrc = productData?.product_images?.[0]
    ? `${IMAGE_BASE_URL}/${productData.product_images[0]}`
    : '/images/jacket.png';

  const vendorName = typeof productData?.vendor === 'object'
    ? productData?.vendor?.name || 'Vendor'
    : productData?.vendor || 'Vendor';

  const [eventProductSizeAddEdit] = useEventProductSizeAddEditMutation()

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "S/28", "M/30", "L/32", "XL/34"];

  const handleSubmitSize = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!eventId || !productId || !user?._id) {
      console.log("Missing required data");
      return;
    }

    const updateData = {
      event: eventId,
      product: productId,
      member: user?._id,
      size: selectedSize
    };

    console.log(updateData);

    try {
      const res = await eventProductSizeAddEdit(updateData).unwrap();
      if(res?.status ===200){
        toast.success(res?.message)
      }
      console.log("Success:", res);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCheckout = () => {
    if (isInvited && !selectedSize) {
      alert('Please select a size before checkout');
      return;
    }
    router.push(`/checkout?productId=${productId}&eventId=${eventId}&size=${selectedSize}`);
  };

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setOpenDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen mt-24 bg-gradient-to-r from-black via-[#130a36] to-black p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-purple-400 text-xl">Loading product details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-r from-black via-[#130a36] to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className='text-black' />
            </div>
          </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">view details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden relative">
              <img
                src={imageSrc}
                alt={productData?.product_name || 'Product'}
                className="w-full object-cover"
              />
              <button className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                {productData?.isOrderd ? 'Ordered' : 'No Design'}
              </button>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-4xl font-bold font-cormorant text-white">{productData?.product_name || 'Product'}</h2>
                <button className="bg-[#BDDABC33] text-[#00AA33] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  In Stock
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{productData?.review_count || 0} Reviews</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="border border-[#6100FF] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <img
                  src={"/images/person.png"}
                  alt={vendorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{vendorName}</h3>
                  <p className="text-gray-400 text-sm">Seller</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl p-6">
              <div className="text-4xl font-bold text-[#6100FF] mb-2">
                ₵{productData?.product_price?.toFixed(2) || '0.00'}
              </div>

              <div className="flex items-center gap-2 text-[#767676] text-sm">
                <Calendar size={16} />
                <span>Category: {productData?.product_category || 'N/A'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="border border-[#6100FF] p-2 rounded-xl overflow-hidden">
              <h1 className='text-2xl ml-5 text-white font-medium font-cormorant'>Description</h1>
              <div className="p-6">
                <p className="text-gray-300 leading-relaxed">
                  {productData?.product_description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Size Selection for Creator - Submit Size API */}
            {/* {isCreator && productData?.product_stocks && productData.product_stocks.length > 0 && (
              <div className="border border-[#6100FF] p-4 rounded-xl">
                <h2 className="text-xl text-white font-medium font-cormorant mb-4">Select Size</h2>
                <div className="flex flex-wrap gap-3">
                  {productData.product_stocks.map((stock: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(stock.size)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === stock.size
                          ? 'bg-[#6100FF] text-white border-2 border-[#6100FF]'
                          : 'bg-[#272238] text-gray-300 border-2 border-[#3d3648] hover:border-[#6100FF]'
                      }`}
                    >
                      {stock.size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-purple-400 mt-3 text-sm">Selected Size: <span className="font-semibold text-white">{selectedSize}</span></p>
                )}
              </div>
            )} */}

            {/* Size Selection for Invited - No API Call, Just Checkout */}
            {/* {isInvited && productData?.product_stocks && productData.product_stocks.length > 0 && (
              <div className="border border-[#6100FF] p-4 rounded-xl">
                <h2 className="text-xl text-white font-medium font-cormorant mb-4">Select Size</h2>
                <div className="flex flex-wrap gap-3">
                  {productData.product_stocks.map((stock: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(stock.size)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === stock.size
                          ? 'bg-[#6100FF] text-white border-2 border-[#6100FF]'
                          : 'bg-[#272238] text-gray-300 border-2 border-[#3d3648] hover:border-[#6100FF]'
                      }`}
                    >
                      {stock.size}
                      {stock.stock === 0 && ' (Out)'}
                      {stock.stock > 0 && ` (${stock.stock})`}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <div className="mt-3 flex items-center justify-between px-4 py-3 bg-[#242428] border border-purple-500 rounded-lg">
                    <span className="text-gray-300 text-sm">Selected Size:</span>
                    <span className="text-purple-400 font-semibold text-lg">{selectedSize}</span>
                  </div>
                )}
              </div>
            )} */}

            {/* Size Selection for Creator - Submit Size API */}
{isCreator && productData?.product_stocks && productData.product_stocks.length > 0 && (
  <div className="border border-[#6100FF] p-4 rounded-xl">
    <h2 className="text-xl text-white font-medium font-cormorant mb-4">Select Size</h2>
    <div className="flex flex-wrap gap-3">
      {productData.product_stocks.map((stock: any, index: number) => {
        const isOutOfStock = stock.stock === 0;
        return (
          <button
            key={index}
            onClick={() => !isOutOfStock && setSelectedSize(stock.size)}
            disabled={isOutOfStock}
            className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isOutOfStock
                ? 'bg-[#1a1a1a] text-gray-600 border-2 border-[#2a2a2a] cursor-not-allowed opacity-50'
                : selectedSize === stock.size
                ? 'bg-[#6100FF] text-white border-2 border-[#6100FF]'
                : 'bg-[#272238] text-gray-300 border-2 border-[#3d3648] hover:border-[#6100FF]'
            }`}
          >
            {stock.size}
            {isOutOfStock && (
              <span className="block text-[10px] text-red-400 font-normal leading-tight">Out of Stock</span>
            )}
          </button>
        );
      })}
    </div>
    {selectedSize && (
      <p className="text-purple-400 mt-3 text-sm">
        Selected Size: <span className="font-semibold text-white">{selectedSize}</span>
      </p>
    )}
  </div>
)}

{/* Size Selection for Invited - No API Call, Just Checkout */}
{isInvited && productData?.product_stocks && productData.product_stocks.length > 0 && (
  <div className="border border-[#6100FF] p-4 rounded-xl">
    <h2 className="text-xl text-white font-medium font-cormorant mb-4">Select Size</h2>
    <div className="flex flex-wrap gap-3">
      {productData.product_stocks.map((stock: any, index: number) => {
        const isOutOfStock = stock.stock === 0;
        return (
          <button
            key={index}
            onClick={() => !isOutOfStock && setSelectedSize(stock.size)}
            disabled={isOutOfStock}
            className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isOutOfStock
                ? 'bg-[#1a1a1a] text-gray-600 border-2 border-[#2a2a2a] cursor-not-allowed opacity-50'
                : selectedSize === stock.size
                ? 'bg-[#6100FF] text-white border-2 border-[#6100FF]'
                : 'bg-[#272238] text-gray-300 border-2 border-[#3d3648] hover:border-[#6100FF]'
            }`}
          >
            {stock.size}
            {isOutOfStock && (
              <span className="block text-[10px] text-red-400 font-normal leading-tight">Out of Stock</span>
            )}
          </button>
        );
      })}
    </div>
    {selectedSize && (
      <div className="mt-3 flex items-center justify-between px-4 py-3 bg-[#242428] border border-purple-500 rounded-lg">
        <span className="text-gray-300 text-sm">Selected Size:</span>
        <span className="text-purple-400 font-semibold text-lg">{selectedSize}</span>
      </div>
    )}
  </div>
)}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {isCreator ? (
                <button
                  onClick={handleSubmitSize}
                  className="flex items-center justify-center gap-2 bg-[#6100FF] cursor-pointer border border-[#3d3648] text-white py-4 rounded-xl hover:bg-[#7A2491] transition-all duration-200 col-span-2"
                >
                  <Ruler size={20} />
                  <span className="font-medium">Submit Size</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isInvited && !selectedSize}
                  className={`flex items-center justify-center gap-2 border border-[#3d3648] text-white py-4 rounded-xl transition-all duration-200 col-span-2 ${
                    isInvited && !selectedSize
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#6100FF] cursor-pointer hover:bg-[#7A2491]'
                  }`}
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">
                    {isInvited && selectedSize ? `Checkout - Size: ${selectedSize}` : isInvited ? 'Select Size to Checkout' : 'Checkout'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}