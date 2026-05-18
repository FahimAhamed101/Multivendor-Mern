"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FooterPageBack from "@/components/landingPage/FooterPageBack";

const CareerBanner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("searchQ") || "",
  );



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to careers page with search query
      router.push(`/careers?searchQ=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  console.log(searchQuery);

  return (
    <div className="relative mt-24 w-full h-[550px] overflow-hidden rounded-xl">
      <div className="absolute top-4 left-4 z-20 rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
        <FooterPageBack />
      </div>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/careerb.png"
          alt="Professional team handshake"
          className="w-full  h-full object-cover"
        />
        {/* Gradient Overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-white">
        <h1 className="text-4xl font-cormorant md:text-5xl font-bold mb-4 text-center">
          Build Your Future With Us
        </h1>
        <p className="text-lg font-poppins md:text-xl mb-8 text-center max-w-2xl">
          Discover new opportunities and apply for roles that match your talent
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-2"
        >
          <div className="flex items-center pl-3">
            <Search size={20} className="text-white/70" />
          </div>
          <input
            type="text"
            placeholder="Find your perfect job"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Decorative Element */}
      {/* <div className="absolute top-4 right-4">
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
          <UserCheck size={24} className="text-white" />
        </div>
      </div> */}
    </div>
  );
};

export default CareerBanner;
