"use client";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import {
  useGetAllShowroomQuery,
  useGetHomeCategoriesQuery,
} from "@/redux/features/home/homeSlice";
import { Search, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaLocationDot } from "react-icons/fa6";

export default function ShowroomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categoriesRes } = useGetHomeCategoriesQuery({});
  const categories = categoriesRes?.data ?? [];

  const { data: showroomData, isLoading, error } = useGetAllShowroomQuery({});

  // Extract showrooms from the API response structure
  const showrooms = showroomData?.data || [];

  // Filter showrooms based on search query
  const filteredShowrooms = showrooms.filter(
    (showroom: any) =>
      showroom.showroom_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      showroom.showroom_address
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className=" mt-20 md:mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl md:text-4xl font-cormorant mb-3">
            Discover Our Showrooms
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-poppins max-w-3xl mx-auto mb-8">
            Explore our curated showrooms across the city. Each venue showcases
            the finest designs and craftsmanship, giving you a world of
            luxurious choices all within arm's reach.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find your perfect tailor, design, or outfit"
                  className="w-full backdrop-blur-sm border border-gray-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500 text-sm"
                />
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* All Showroom Section */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-white font-cormorant text-xl md:text-2xl font-semibold">
              All Showroom
            </h2>
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              {/* <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#1B1B1F] backdrop-blur-sm border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category.category_slug}>
                    {category.category_name}
                  </option>
                ))}
              </select> */}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">
                Failed to load showrooms. Please try again later.
              </p>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !error && filteredShowrooms.length === 0 && (
            <div className="text-center py-20">
              <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No showrooms found.</p>
            </div>
          )}

          {/* Showrooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredShowrooms.map((showroom: any) => (
              <div
                key={showroom._id}
                className="bg-[#1B1B1F] backdrop-blur-sm h-[380px] rounded-xl overflow-hidden group hover:bg-gray-800/50 transition-all border border-gray-700/50"
              >
                {/* Showroom Image with Logo Overlay */}
                <div className="relative h-[210px] overflow-hidden">
                  <img
                    src={`${IMAGE_BASE_URL}/${showroom.logo}`}
                    alt={showroom.showroom_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Showroom Info */}
                <div className="p-4 flex flex-col h-[170px]">
                  <h3 className="text-white font-semibold text-base mb-1">
                    {showroom.showroom_name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    <FaLocationDot className="inline-block w-4 h-4 mr-1 mb-0.5 text-gray-400" />
                    {showroom.showroom_address}
                  </p>

                  {/* View Showroom Button */}
                  <Link
                    href={`/showroom/view-showroom?showroomId=${showroom._id}`}
                  >
                    <button className="w-full bg-[#6100FF] text-[16px] cursor-pointer text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2  mt-auto">
                      <AiOutlineShoppingCart className="w-3 sm:w-4 h-3 md:h-5 md:w-5 sm:h-4" />
                      View Showroom
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
