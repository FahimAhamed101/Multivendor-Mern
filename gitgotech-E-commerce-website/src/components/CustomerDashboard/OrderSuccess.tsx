'use client";'
import React from 'react';
import { Check, ChevronRight,ShoppingBag  } from 'lucide-react';
import Link from 'next/link';

export default function OrderCompletedPage() {
  const orderNumber = "#44567";
  const orderItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop' },
    { id: 2, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&h=100&fit=crop' },
    { id: 3, image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=100&h=100&fit=crop' }
  ];

  return (
    <div className="mt-24 bg-gradient-to-r from-gray-950 via-purple-900/15 to-black text-white flex items-center justify-center p-4">
      <div className="container mx-auto">
        {/* Success Animation Container */}
        <div className="flex flex-col items-center mb-8">
          {/* Animated Check Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-900/30 to-purple-600/30 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-purple-500/30">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Check className="w-12 h-12 text-white stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-3xl font-cormorant md:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-[#6100FF] to-[#E19E75] bg-clip-text text-transparent">
            Thank you For Your Payment
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Your Order is Now being Prepared
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          {/* Order Number */}
          <div className="mb-6">
            <p className="text-white font-medium">
              Order Number: <span className="text-purple-400">{orderNumber}</span>
            </p>
          </div>

          {/* Order Items */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{orderItems.length} Item(s)</span>
              <div className="flex -space-x-3">
                {orderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-900 bg-gray-800"
                  >
                    <img 
                      src={item.image} 
                      alt={`Product ${item.id}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* View Order Button */}
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium">
              View Order
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div> 

          <div 
          className="relative rounded-3xl overflow-hidden h-48 md:h-60 my-6 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/imgages/discount.png)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D78813] to-[#B630F4]"></div>
          
          {/* Content */}
          <div className="relative flex mt-5 items-center justify-between px-6 md:px-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs md:text-sm font-medium">Sale ends in 🕐 2:58:59 PM</span>
              </div>
              <div className="mb-3">
                <div className="text-sm md:text-base font-semibold mb-1">UP TO</div>
                <div className="text-3xl md:text-5xl font-black tracking-tight">90% OFF</div>
              </div>

          <Link href="/hotdeals">
              <button className="group/btn cursor-pointer relative px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-sm md:text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50">
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  View
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              </button>
            </Link>
            
            </div>
            
            {/* Decorative 3D Megaphone/Icon on Right */}
            <div className="hidden md:flex items-center justify-center w-48 h-full">
              <div className="relative">
                <div className="text-8xl opacity-30">📢</div>
                <div className="absolute inset-0 blur-2xl bg-white/10"></div>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}