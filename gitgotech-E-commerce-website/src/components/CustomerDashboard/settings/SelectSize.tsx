// "use client"

// import { useState } from 'react';
// import { ChevronDown } from 'lucide-react';
// import { FaArrowLeft } from 'react-icons/fa';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useGetProductEventWishesSizeQuery, useEventProductSizeAddEditMutation } from '@/redux/features/event/eventSlice';
// import url from '@/redux/api/baseUrl';

// export default function SelectSize() {
//     const router = useRouter()

//     const searchParams = useSearchParams()
//     const product = searchParams.get("productId")
//     const event = searchParams.get("eventId")
//     console.log(product, event)
//     const data = {
//       product: product,
//       event: event
//     }

//     console.log(url)

//     const { data: sizesData, isLoading } = useGetProductEventWishesSizeQuery(data)
//     console.log(sizesData)

//     const [eventProductSizeAddEdit] = useEventProductSizeAddEditMutation()

//     const [openDropdown, setOpenDropdown] = useState<string | null>(null);
//     const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

//     const sizes = ["XS", "S", "M", "L", "XL", "XXL", "S/28", "M/30", "L/32", "XL/34"];

//     const handleSizeSelect = (itemId: string, size: string) => {
//       console.log(itemId)
//       setSelectedSizes(prev => ({
//         ...prev,
//         [itemId]: size
//       }));
//       setOpenDropdown(null);
//       console.log(`Selected size for item ${itemId}:`, size);
//     };

//     const toggleDropdown = (itemId: string) => {
//       setOpenDropdown(openDropdown === itemId ? null : itemId);
//     };

//     const handleUpdate = async () => {

//       console.log('Selected sizes to update:', selectedSizes);

//       try {
//         const updatePromises = Object.entries(selectedSizes).map(([itemId, size]) => {
//           const updateData = {
//             member: itemId,
//             product: product,
//             event: event,
//             size: size
//           };
//           console.log('Updating item:', updateData);
//           return eventProductSizeAddEdit(updateData).unwrap();
//         });

//         await Promise.all(updatePromises);
//         console.log('All sizes updated successfully!');
//       } catch (error) {
//         console.error('Error updating sizes:', error);
//       }
//     };

//     // Extract users from API data
//     const users = sizesData?.data?.map((item: any) => ({

//       _id: item?.customer._id,
//       name: item.customer?.name || 'Unknown',
//       email: item.customer?.email || '',
//       image: item.customer?.image || '/images/person.png',
//       currentSize: item.size || 'Size'
//     })) || [];

//   return (
//     <div className="min-h-screen mt-1 bg-gradient-to-r from-black via-[#0f0924] to-black flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl">
//         {/* Header */}
//         <div className="container pb-4 mx-auto flex items-center gap-4">
//              <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
//             <FaArrowLeft className='text-black' />
//           </div>
//         </button>
//           <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">Select Size</h1>
//         </div>

//         {/* User Cards */}
//         <div className="space-y-4 mb-6">
//           {isLoading ? (
//             <p className="text-gray-400 text-center">Loading...</p>
//           ) : users.length === 0 ? (
//             <p className="text-gray-400 text-center">No users found</p>
//           ) : (
//             users.map((user) => {
//               const displaySize = selectedSizes[user._id] || user.currentSize;
//               return (
//                 <div
//                   key={user._id}
//                   className="bg-[#2F2543] border border-[#67676D] rounded-xl p-4 flex items-center justify-between hover:border-purple-500 transition-all duration-200"
//                 >
//                   {/* User Info */}
//                   <div className="flex items-center gap-4">
//                     <img
//                     src={user.image
//                  ? url + user.image
//                    : "https://rat-drum-unto-hawk.trycloudflare.com/images/image_(66).png"}
//                       alt={user.name}
//                       className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
//                     />
//                     <div>
//                       <span className="text-white font-medium block">{user.name}</span>
//                       {user.email && <span className="text-gray-400 text-sm">{user.email}</span>}
//                     </div>
//                   </div>

//                   {/* Size Dropdown */}
//                   <div className="relative">
//                     <button
//                       onClick={() => toggleDropdown(user._id)}
//                       className={`flex items-center gap-8 px-6 py-3 rounded-lg transition-all duration-200 min-w-[120px] justify-between ${
//                         displaySize === "Size"
//                           ? 'bg-[#242428] text-gray-400'
//                           : 'bg-[#242428] text-purple-400'
//                       } `}
//                     >
//                       <span className="font-medium">{displaySize}</span>
//                       <ChevronDown
//                         size={18}
//                         className={`transition-transform ${openDropdown === user._id ? 'rotate-180' : ''}`}
//                       />
//                     </button>

//                     {/* Dropdown Menu */}
//                     {openDropdown === user._id && (
//                       <div className="absolute top-full mt-2 right-0 w-40 bg-[#2a2438] border border-purple-500 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
//                         {sizes.map((size) => (
//                           <button
//                             key={size}
//                             onClick={() => handleSizeSelect(user._id, size)}
//                             className={`w-full px-4 py-2.5 text-left hover:bg-purple-600/30 transition-colors ${
//                               displaySize === size ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300'
//                             }`}
//                           >
//                             {size}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* Update Button */}
//         <button
//           onClick={handleUpdate}
//           className="w-full bg-[#6100FF] cursor-pointer text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg"
//         >
//           Update
//         </button>
//       </div>

//       {/* Click outside to close dropdown */}
//       {openDropdown && (
//         <div
//           className="fixed inset-0 z-0"
//           onClick={() => setOpenDropdown(null)}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import url from "@/redux/api/baseUrl";
import {
  useEventProductSizeAddEditMutation,
  useGetProductEventWishesSizeQuery,
} from "@/redux/features/event/eventSlice";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function SelectSize() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const product = searchParams.get("productId");
  const event = searchParams.get("eventId");

  const data = {
    product: product,
    event: event,
  };

  const { data: sizesData, isLoading } =
    useGetProductEventWishesSizeQuery(data);
    console.log(sizesData)

  const [eventProductSizeAddEdit] = useEventProductSizeAddEditMutation();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "S/28",
    "M/30",
    "L/32",
    "XL/34",
  ];

  const handleSizeSelect = (itemId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [itemId]: size,
    }));
    setOpenDropdown(null);
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const handleUpdate = async () => {
    try {
      const updatePromises = Object.entries(selectedSizes).map(
        ([itemId, size]) => {
          const updateData = {
            member: itemId,
            product: product,
            event: event,
            size: size,
          };
          return eventProductSizeAddEdit(updateData).unwrap();
        },
      );

      await Promise.all(updatePromises);
      console.log("All sizes updated successfully!");
    } catch (error) {
      console.error("Error updating sizes:", error);
    }
  };

  // ❗ FIXED: এখানে fallback remove করা হয়েছে
  const users =
    sizesData?.data?.map((item: any) => ({
      _id: item?.customer._id,
      name: item.customer?.name || "Unknown",
      email: item.customer?.email || "",
      image: item.customer?.image, // ✅ no fallback here
      currentSize: item.size || "Size",
    })) || [];

  return (
    <div className="min-h-screen mt-1 bg-gradient-to-r from-black via-[#0f0924] to-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="container pb-4 mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
            Select Size
          </h1>
        </div>

        {/* User Cards */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-400 text-center">No users found</p>
          ) : (
            users.map((user: any) => {
              const displaySize = selectedSizes[user._id] || user.currentSize;
              return (
                <div
                  key={user._id}
                  className="bg-[#2F2543] border border-[#67676D] rounded-xl p-4 flex items-center justify-between hover:border-purple-500 transition-all duration-200"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        user.image
                          ? `${url}${user.image}`
                          : "https://rat-drum-unto-hawk.trycloudflare.com/images/image_(66).png"
                      }
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://rat-drum-unto-hawk.trycloudflare.com/images/image_(66).png";
                      }}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                    />
                    <div>
                      <span className="text-white font-medium block">
                        {user.name}
                      </span>
                      {user.email && (
                        <span className="text-gray-400 text-sm">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Size Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(user._id)}
                      className={`flex items-center gap-8 px-6 py-3 rounded-lg transition-all duration-200 min-w-[120px] justify-between ${
                        displaySize === "Size"
                          ? "bg-[#242428] text-gray-400"
                          : "bg-[#242428] text-purple-400"
                      } `}
                    >
                      <span className="font-medium">{displaySize}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${openDropdown === user._id ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === user._id && (
                      <div className="absolute top-full mt-2 right-0 w-40 bg-[#2a2438] border border-purple-500 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(user._id, size)}
                            className={`w-full px-4 py-2.5 text-left hover:bg-purple-600/30 transition-colors ${
                              displaySize === size
                                ? "bg-purple-600/20 text-purple-400"
                                : "text-gray-300"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          className="w-full bg-[#6100FF] cursor-pointer text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg"
        >
          Update
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
