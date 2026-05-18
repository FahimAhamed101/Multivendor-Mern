// "use client"

// import { useState, useMemo } from 'react';
// import { Filter, MapPin, DollarSign, Briefcase, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { RiTimeZoneLine } from 'react-icons/ri';
// import { useGetCareersQuery } from '@/redux/features/career/careerSlice';

// const Joblist = () => {
//   const router = useRouter();
//   const [selectedCountry, setSelectedCountry] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isFilterOpen, setIsFilterOpen] = useState(true);
//   const [isLocationOpen, setIsLocationOpen] = useState(false);

//   const { data: joblistData, isLoading } = useGetCareersQuery({ page: 1, limit: 10 });

//   const jobs = joblistData?.data || [];

//   // Extract unique countries from job list
//   const countries = useMemo(() => {
//     const uniqueCountries = Array.from(new Set(jobs.map(job => job.country)));
//     return uniqueCountries;
//   }, [jobs]);

//   // Filter jobs based on search query and country
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                            job.description.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCountry = !selectedCountry || job.country === selectedCountry;
//       return matchesSearch && matchesCountry;
//     });
//   }, [jobs, searchQuery, selectedCountry]);

//   return (
//     <div className="min-h-screen md:flex container mx-auto bg-black text-white p-6">
//       {/* Header Section */}
//       <div className='md:w-[25%] w-full'>

//         <header className="">
//           <div className="flex items-center justify-between mb-6">
//             <button
//               onClick={() => setIsFilterOpen(!isFilterOpen)}
//               className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 rounded-full hover:bg-purple-700 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-purple-500/50"
//             >
//               <Filter size={20} />
//               Filter
//             </button>
//           </div>

//           {/* Filter Panel */}
//           {isFilterOpen && (
//             <div className="md:w-full rounded-2xl shadow-2xl animate-slide-down">

//               {/* Search Input */}
//               <div className="mb-6">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     placeholder="Search by job title..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
//                   />
//                 </div>
//               </div>

//               {/* Location Dropdown */}
//               <div>
//                 <button
//                   onClick={() => setIsLocationOpen(!isLocationOpen)}
//                   className="w-full flex items-center gap-4 text-white text-lg font-semibold mb-4 hover:text-purple-400 transition-colors"
//                 >
//                   <span>Select Country</span>
//                   {isLocationOpen ? (
//                     <ChevronUp size={20} className="text-gray-400" />
//                   ) : (
//                     <ChevronDown size={20} className="text-gray-400" />
//                   )}
//                 </button>

//                 {/* Location List */}
//                 {isLocationOpen && (
//                   <div className="space-y-3 animate-fade-in">
//                     {/* All Countries Option */}
//                     <label
//                       htmlFor="location-all"
//                       className="flex items-center gap-3 cursor-pointer group"
//                     >
//                       <div className="relative">
//                         <input
//                           type="radio"
//                           id="location-all"
//                           name="location"
//                           value=""
//                           checked={selectedCountry === ''}
//                           onChange={() => setSelectedCountry('')}
//                           className="sr-only"
//                         />
//                         <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
//                           selectedCountry === ''
//                             ? 'border-purple-600 bg-purple-600'
//                             : 'border-gray-600 bg-transparent group-hover:border-purple-400'
//                         }`}>
//                           {selectedCountry === '' && (
//                             <div className="w-full h-full rounded-full bg-white scale-50"></div>
//                           )}
//                         </div>
//                       </div>

//                       <span className={`transition-colors duration-300 ${
//                         selectedCountry === ''
//                           ? 'text-white font-medium'
//                           : 'text-gray-400 group-hover:text-gray-300'
//                       }`}>
//                         All Countries
//                       </span>
//                     </label>

//                     {countries.map((country) => (
//                       <label
//                         key={country}
//                         htmlFor={`location-${country}`}
//                         className="flex items-center gap-3 cursor-pointer group"
//                       >
//                         {/* Custom Radio Button */}
//                         <div className="relative">
//                           <input
//                             type="radio"
//                             id={`location-${country}`}
//                             name="location"
//                             value={country}
//                             checked={selectedCountry === country}
//                             onChange={() => setSelectedCountry(country)}
//                             className="sr-only"
//                           />
//                           <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
//                             selectedCountry === country
//                               ? 'border-purple-600 bg-purple-600'
//                               : 'border-gray-600 bg-transparent group-hover:border-purple-400'
//                           }`}>
//                             {selectedCountry === country && (
//                               <div className="w-full h-full rounded-full bg-white scale-50"></div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Country Name */}
//                         <span className={`transition-colors duration-300 ${
//                           selectedCountry === country
//                             ? 'text-white font-medium'
//                             : 'text-gray-400 group-hover:text-gray-300'
//                         }`}>
//                           {country}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//         </header>
//       </div>

//       {/* Job Listings Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {isLoading ? (
//           <div className="col-span-full flex items-center justify-center py-12">
//             <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//             <span className="ml-3 text-gray-400">Loading jobs...</span>
//           </div>
//         ) : filteredJobs.length === 0 ? (
//           <div className="col-span-full flex items-center justify-center py-12 text-gray-400">
//             <p>No jobs found matching your criteria.</p>
//           </div>
//         ) : (
//           filteredJobs.map((job) => (
//             <div
//               key={job._id}
//               className="bg-gray-900 rounded-xl p-6 border border-gray-700
//               hover:shadow-[0_0_12px_rgba(34,211,238,0.35)] hover:border-blue-500/20 transition-all duration-300 group"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <h3 className="text-[24px] font-bold mb-2 font-cormorant">{job.title}</h3>
//                   <div className="text-sm text-gray-400 mb-3">
//                     <span className="flex items-center gap-1 mb-3">
//                       <MapPin className='text-white' size={26} />
//                       {job.country} {job.address && `- ${job.address}`}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <DollarSign className='text-white' size={26} />
//                       {job.salary}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
//                     <RiTimeZoneLine className='text-white' size={26} />
//                     {job.jobType}
//                   </div>
//                 </div>
//               </div>

//               <p className="text-gray-300 mb-6 leading-relaxed line-clamp-3">{job.description}</p>

//               <button
//                 onClick={() => router.push(`/careers/job-details?id=${job._id}`)}
//                 className="w-full py-3 px-4 cursor-pointer font-poppins bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 group">
//                 View Details
//                 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
//               </button>
//             </div>
//           ))
//         )}
//       </div>

//     </div>
//   );
// };

// export default Joblist;

"use client";

import { useGetCareersQuery } from "@/redux/features/career/careerSlice";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  DollarSign,
  Filter,
  MapPin,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RiTimeZoneLine } from "react-icons/ri";

const Joblist = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("searchQ") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("searchQ") || "",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Sync search query from URL parameters
  useEffect(() => {
    const urlSearchQ = searchParams.get("searchQ") || "";
    const urlCountry = searchParams.get("country") || "";
    setSearchQuery(urlSearchQ);
    setDebouncedSearch(urlSearchQ);
    setSelectedCountry(urlCountry);
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pass searchQ and country to the API for server-side filtering
  const { data: joblistData, isLoading } = useGetCareersQuery({
    page,
    limit,
    searchQ: debouncedSearch,
    country: selectedCountry,
  });

  const jobs = joblistData?.data || [];
  const totalPages = joblistData?.totalPages || 1;

  console.log(jobs);

  // Extract unique countries from job list
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(
      new Set(jobs.map((job: any) => job.country)),
    ) as string[];
    return uniqueCountries;
  }, [jobs]);

  // Handler for search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    // Update URL with search query
    if (searchQuery.trim()) {
      router.push(`/careers?searchQ=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/careers");
    }
  };

  // Handler for country change
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setPage(1); // Reset to first page on country change
    // Update URL with country
    const params = new URLSearchParams();
    if (searchQuery) params.set("searchQ", searchQuery);
    if (country) params.set("country", country);
    router.push(`/careers?${params.toString()}`);
  };

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0">
            {/* Filter toggle button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-sm font-medium mb-6"
            >
              <Filter size={16} />
              Filter
            </button>

            {isFilterOpen && (
              <div>
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-5">
                  <div className="relative mb-2">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search by job title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* Select Location */}
                <button
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center justify-between w-full text-white text-base font-semibold mb-4 hover:text-purple-400 transition-colors"
                >
                  <span>Select Location</span>
                  {isLocationOpen ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {isLocationOpen && (
                  <div className="space-y-3">
                    {/* All */}
                    <RadioOption
                      id="all"
                      label="All Countries"
                      checked={selectedCountry === ""}
                      onChange={() => handleCountryChange("")}
                    />
                    {countries.map((country) => (
                      <RadioOption
                        key={country}
                        id={country}
                        label={country}
                        checked={selectedCountry === country}
                        onChange={() => handleCountryChange(country)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* ── Job Grid ── */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-400">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                No jobs found matching your criteria.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {jobs.map((job: any) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onView={() =>
                        router.push(`/careers/job-details?id=${job._id}`)
                      }
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
                    >
                      Previous
                    </button>

                    <span className="text-gray-400 text-sm">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* ─── Radio Option ─── */
const RadioOption = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label
    htmlFor={`loc-${id}`}
    className="flex items-center gap-3 cursor-pointer group"
  >
    <input
      type="radio"
      id={`loc-${id}`}
      name="location"
      value={id}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    {/* Custom circle */}
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        checked
          ? "border-purple-500 bg-purple-500"
          : "border-gray-600 group-hover:border-purple-400"
      }`}
    >
      {checked && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
    <span
      className={`text-sm transition-colors ${checked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-300"}`}
    >
      {label}
    </span>
  </label>
);

/* ─── Job Card ─── */
const JobCard = ({ job, onView }: { job: any; onView: () => void }) => (
  <div className="bg-[#111111] border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-blue-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)] transition-all duration-300 group">
    {/* Title */}
    <h3
      className="text-xl font-bold leading-snug"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {job.title}
    </h3>

    {/* Meta */}
    <div className="space-y-1.5 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-white shrink-0" />
        <span>
          {job.country}
          {job.address ? ` - ${job.address}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign size={16} className="text-white shrink-0" />
        <span>{job.salary}</span>
      </div>
      <div className="flex items-center gap-2">
        <RiTimeZoneLine size={16} className="text-white shrink-0" />
        <span>{job.jobType}</span>
      </div>
    </div>

    {/* Description */}
    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
      {job.description}
    </p>

    {/* CTA */}
    <button
      onClick={onView}
      className="w-full py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2
        bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
        transition-all duration-300 group"
    >
      View Details
      <ChevronRight
        size={16}
        className="group-hover:translate-x-0.5 transition-transform"
      />
    </button>
  </div>
);

export default Joblist;
