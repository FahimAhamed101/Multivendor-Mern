"use client";

import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import { useTopVendorsQuery } from "@/redux/features/home/homeSlice";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import FooterPageBack from "@/components/landingPage/FooterPageBack";

export default function VendorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  console.log(searchQuery);

  const { data: topVendorsRes } = useTopVendorsQuery(searchQuery);
  const vendors = topVendorsRes?.data?.data ?? [];

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const getImageUrl = (image: string) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${IMAGE_BASE_URL}/${image}`;
  };

  return (
    <div className="mt-16 md:mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black min-h-screen py-8 sm:py-10 md:py-12 px-2 sm:px-4">
      <div className="container mx-auto">
        <FooterPageBack className="mb-6 sm:mb-8" />
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cormorant mb-2 sm:mb-3 md:mb-4">
            Meet our Vendors
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-8">
            Discover Talented Designers creating worldwide Fashions
          </p>

          {/* Search Bar */}
          <div className="max-w-full sm:max-w-2xl mx-auto px-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Find your perfect tailor, design, or outfit"
                  className="w-full border border-[#414149] bg-transparent text-white rounded-lg pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* All Vendors Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-white text-xl font-cormorant sm:text-2xl font-semibold mb-4 sm:mb-6 px-2">
            All Vendors
          </h2>

          {vendors.length === 0 ? (
            <p className="text-gray-400 text-center py-16">No vendors found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {vendors.map((vendor: any) => {
                const imageUrl = getImageUrl(vendor.image);
                return (
                  <div
                    key={vendor._id}
                    className="bg-[#1B1B1F] backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden group hover:bg-gray-800 transition-all"
                  >
                    {/* Vendor Image */}
                    <div className="aspect-square overflow-hidden bg-[#2a2a2e]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              (
                                e.currentTarget.nextSibling as HTMLElement
                              ).style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      {/* Fallback Avatar — always rendered, hidden if image loads */}
                      <div
                        className="w-full h-full items-center justify-center bg-[#2a2a2e]"
                        style={{ display: imageUrl ? "none" : "flex" }}
                      >
                        <span className="text-6xl font-cormorant text-gray-400">
                          {vendor.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="p-3 sm:p-4 md:p-5">
                      <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                        {vendor.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-3">
                        @{vendor.username}
                      </p>

                      {/* View Showroom Button */}
                      <Link href={`/vendors/showrooms?vendorId=${vendor._id}`}>
                        <button className="w-full bg-[#6100FF] text-[16px] cursor-pointer text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-auto hover:bg-purple-700">
                          <AiOutlineShoppingCart className="w-3 sm:w-4 h-3 md:h-5 md:w-5 sm:h-4" />
                          View Showroom
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
