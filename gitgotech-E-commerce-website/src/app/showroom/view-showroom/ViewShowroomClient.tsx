"use client";
import TopPoduct from "@/components/landingPage/TopPoduct";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import {
  useGetAllShowroomQuery,
  useGetHomeCategoriesQuery,
  useGetShowroomProductQuery,
} from "@/redux/features/home/homeSlice";
import { ArrowLeft, CheckCircle, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ViewShowroomClient() {
  const searchParams = useSearchParams();
  const showroomId = searchParams.get("showroomId");
  const vendorId = searchParams.get("vendorId");
  const [selectedCategory, setSelectedCategory] = useState("");
  console.log(selectedCategory);

  const { data: categoriesRes } = useGetHomeCategoriesQuery({});
  const categories = categoriesRes?.data ?? [];
  console.log(categories);

  const { data: showroomData } = useGetAllShowroomQuery({});
  const { data: showroomProductData } = useGetShowroomProductQuery(
    { id: showroomId || "", product_category: selectedCategory },
    { skip: !showroomId },
  );

  // Find the current showroom from the list
  const showroom = showroomData?.data?.find((s: any) => s._id === showroomId);

  if (!showroom) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-cormorant mb-2">
            Showroom Not Found
          </h1>
          <Link
            href="/showroom"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to Showrooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/showroom"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Showrooms
        </Link>

        {/* Showroom Header */}
        <div className="bg-[#1B1B1F] backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 mb-8">
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src={`${IMAGE_BASE_URL}/${showroom.logo}`}
              alt={showroom.showroom_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-white text-3xl md:text-4xl font-cormorant font-semibold mb-2">
                {showroom.showroom_name}
              </h1>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                <span>{showroom.showroom_address}</span>
              </div>
              {showroom.isApprove && (
                <div className="flex items-center mt-2 text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Verified Showroom</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Showroom Products with Category Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-white font-cormorant text-2xl font-semibold">
              Products from {showroom.showroom_name}
            </h2>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#1B1B1F] border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <TopPoduct
            showroomId={showroomId || undefined}
            searchQuery=""
            selectedCategory={null}
            product_category={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
