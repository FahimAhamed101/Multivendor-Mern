"use client"

import React, { useState } from 'react';
import { ShoppingCart, Eye, Plus, ChevronDown } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGetProductByEventQuery, useGetEventByIdQuery } from '@/redux/features/event/eventSlice';
import { IMAGE_BASE_URL } from '@/lib/imageBaseUrl';

type Product = {
  _id: string;
  product: {
    _id: string;
    product_name: string;
    product_price: number;
    review_count?: number | null;
    review_rating?: number | null;
    product_images?: string[];
    vendor?: {
      name?: string;
    } | string;
  };
  event: string;
  isOrderd: boolean;
  createdAt: string;
  updatedAt: string;
};

const ProductCard = ({ product, purchaseOption }: { product: Product, purchaseOption: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const eventId = searchParams.get("id")
   const type = searchParams.get('type')

  const isInvited = status === "invited";
  const isParticipator = purchaseOption === 'participator';

  const productData = product.product;
  const imageSrc = productData.product_images?.[0]
    ? `${IMAGE_BASE_URL}/${productData.product_images[0]}`
    : '/images/jacket.png';

  const vendorName = typeof productData.vendor === 'object'
    ? productData.vendor?.name || 'Vendor'
    : productData.vendor || 'Vendor';

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "S/28", "M/30", "L/32", "XL/34"];

  const toggleDropdown = () => {
    setOpenDropdown(openDropdown === productData._id ? null : productData._id);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setOpenDropdown(null);
  };

  const handleCheckout = () => {
    if (isInvited && isParticipator && !selectedSize) {
      alert('Please select a size before checkout');
      return;
    }
    router.push(`/checkout?productId=${productData._id}&eventId=${product.event}&size=${selectedSize}`);
  };

  const cardContent = (
    <>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={productData.product_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
          {product.isOrderd ? 'Ordered' : 'No Design'}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">₵{productData.product_price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-4 h-4 ${i < (productData.review_rating || 0) ? 'fill-yellow-400' : 'fill-gray-600'}`} viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="text-sm   ml-1">{productData.review_count || 0} Reviews</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold   mb-2">{productData.product_name}</h3>

        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-4 h-4 text-red-500" />
          <span className="text-[16px] text-[#B8B8B8]">{vendorName}</span>
        </div>

        {/* Size Selection for Invited Participator Events */}
        {isInvited && isParticipator && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Size</label>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  selectedSize
                    ? 'bg-[#242428] text-purple-400 border border-purple-500'
                    : 'bg-[#242428] text-gray-400 border border-gray-600'
                } `}
              >
                <span className="font-medium">{selectedSize || 'Select Size'}</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openDropdown === productData._id ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {openDropdown === productData._id && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-[#2a2438] border border-purple-500 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-purple-600/30 transition-colors ${
                        selectedSize === size ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Size Display */}
            {selectedSize && (
              <div className="mt-3 flex items-center justify-between px-4 py-3 bg-[#242428] border border-purple-500 rounded-lg">
                <span className="text-gray-300 text-sm">Selected Size:</span>
                <span className="text-purple-400 font-semibold text-lg">{selectedSize}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isInvited && (
          <div className="flex gap-3">
            {!isParticipator && (
              <button onClick={() => router.push(`/profile/event/view-deaign/select-size?productId=${productData._id}&eventId=${product.event}`)} className="flex-1 border-2 border-purple-600 text-purple-600 py-2.5 rounded-lg font-medium transition-colors">
                View Size
              </button>
            )}

            <button onClick={handleCheckout} className="flex-1 w-full cursor-pointer bg-[#6100FF] text-white py-2.5 rounded-lg font-medium transition-colors">
              Place Order
            </button>
          </div>
        )}

        {/* Checkout Button for Invited Participator */}
        {isInvited && isParticipator && (
          <button 
            onClick={handleCheckout} 
            disabled={!selectedSize}
            className={`flex-1 w-full cursor-pointer py-2.5 rounded-lg font-medium transition-colors ${
              selectedSize 
                ? 'bg-[#6100FF] text-white hover:bg-purple-700' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedSize ? `Checkout - Size: ${selectedSize}` : 'Select Size to Checkout'}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="text-white bg-[#1B1B1F] rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
      {isInvited ? (
        <Link href={`/profile/event/details?id=${productData._id}&type=${type}&eventId=${eventId}`}>
          <div className="cursor-pointer">
            {cardContent}
          </div>
        </Link>
      ) : (
        cardContent
      )}
    </div>
  );
};

export default function EventViewDeaign() {


 const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const {data: eventProduct, isLoading, error} = useGetProductByEventQuery(id)
  console.log(eventProduct)
  
  const {data: eventData} = useGetEventByIdQuery(id || '')
  
  const purchaseOption = eventData?.data?.purchaseOption || 'creator';

  const router = useRouter()

  const products: Product[] = eventProduct?.data || [];

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black  text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="container mx-auto flex items-center gap-4">

             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black' />
          </div>
        </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant hidden md:block">View Design</h1>
        </div>
          <Link href={"/profile/event/add-design"}>
          <button className="flex items-center w-45 py-2 cursor-pointer px-4 gap-2 bg-gradient-to-l from-blue-600 to-cyan-600 text-white px-2  rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Add Design
          </button>
          </Link>

        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-purple-400 text-xl">Loading products...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-400 text-xl">Failed to load products</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">No products in this event yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product._id} product={product} purchaseOption={purchaseOption} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}