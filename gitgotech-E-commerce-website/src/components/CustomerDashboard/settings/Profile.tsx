// "use client";
// import React, { useState } from 'react';
// import { Edit2, Calendar, Settings, LogOut } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { FaArrowLeft } from 'react-icons/fa';
// import { useGetMyProfileQuery } from '@/redux/features/settings/settingsSlice';

// export default function ProfilePage() {
//   const router = useRouter();
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

//   const {data: profileData, isLoading: isProfileLoading, error: profileError} = useGetMyProfileQuery();

//   console.log(profileData);

//   const handleLogout = () => {
//     console.log('User logged out');
//     setIsLogoutModalOpen(false);
//   localStorage.removeItem('user');
//   localStorage.removeItem('token');
//     router.push('/');
//   };

//   return (
//     <div className="mt-16 md:mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">

//       <div className="max-w-3xl mx-auto">
//         {/* Header */}

//  <div className="container mx-auto flex items-center gap-4">
//              <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
//             <FaArrowLeft className='text-black'/>
//           </div>
//         </button>
//           <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">Profile infodd</h1>
//         </div>

//         {/* Profile Picture Section */}
//         <div className="flex flex-col items-center mb-8">
//           <div className="relative mb-4">
//             <img
//               src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-4 border-purple-600"
//             />
//           </div>
//           <Link href="/profile/edit-profile">
//           <button
//           className="bg-[#6100FF] cursor-pointer text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
//             <Edit2 className="w-4 h-4" />
//             Edit Profile
//           </button>
//         </Link>
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-3 gap-4 mb-8">

//           <button
//            onClick={() => router.push("/profile/event")}
//           className="bg-[#29223A] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2">
//             <Calendar className="w-6 h-6" />
//             <span className="text-sm">Event</span>
//           </button>

//             <button
//              onClick={() => router.push("/settings")}
//             className="bg-[#29223A] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2">
//             <Settings className="w-6 h-6" />
//             <span className="text-sm">Settings</span>
//           </button>

//           <button
//           onClick={() => setIsLogoutModalOpen(true)}
//            className="bg-[#261224] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2">
//             <LogOut className="w-6 h-6" />
//             <span className="text-sm">Leave</span>
//           </button>
//         </div>

//         {/* Profile Information Card */}
//         <div className="bg-gradient-to-b from-[#0a2930] to-[#0c0111] bg-opacity-50 border-2 border-blue-500 rounded-3xl p-6 backdrop-blur-sm">
//           <div className="space-y-6">
//             {/* User Name */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">User Name</label>
//               <div className="text-gray-400">AlexDennis1512</div>
//             </div>

//             {/* Name */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">Name</label>
//               <div className="text-gray-400">Alex dennis</div>
//             </div>

//             {/* Email Address */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">Email Address</label>
//               <div className="text-gray-400">alexdennis@gmail.com</div>
//             </div>

//             {/* Phone Number */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">Phone Number</label>
//               <div className="text-gray-400">2334567</div>
//             </div>

//             {/* Address */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">Address</label>
//               <div className="text-gray-400">London, UK</div>
//             </div>

//             {/* Communication */}
//             <div>
//               <label className="text-sm text-gray-300 mb-2 block">Communication</label>
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-400">Email : </span>
//                  Mail
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//     {isLogoutModalOpen && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-semibold text-white mb-2 font-cormorant">Logout</h2>
//               <p className="text-gray-400 mb-6">Do you want to logout?</p>

//               <div className="flex gap-4">
//                 <button
//                   onClick={() => setIsLogoutModalOpen(false)}
//                   className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

"use client";
import url from "@/redux/api/baseUrl";
import { useGetMyProfileQuery } from "@/redux/features/settings/settingsSlice";
import { Calendar, Edit2, LogOut, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useGetMyProfileQuery({});

  const profile = profileData?.data;

  const handleLogout = () => {
    console.log("User logged out");
    setIsLogoutModalOpen(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Notify Navbar to update
    window.dispatchEvent(new Event("authChanged"));

    // Navigate to home page without reload
    router.push("/");
  };

  // Helper for profile image URL (adjust base URL as needed)
  const profileImageUrl = url + "/" + profile?.image;

  return (
    <div className="mt-16 md:mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
            Profile info
          </h1>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={profileImageUrl} // Assuming profileImage is the path returned by the API
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-600"
            />
          </div>
          <Link href="/profile/edit-profile">
            <button className="bg-[#6100FF] cursor-pointer text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push("/profile/event")}
            className="bg-[#29223A] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Event</span>
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="bg-[#29223A] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={() => router.push("/profile/wallet")}
            className="bg-[#29223A] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2"
          >
            <Wallet className="w-6 h-6" />
            <span className="text-sm">Wallet</span>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="bg-[#261224] bg-opacity-50 border cursor-pointer border-gray-700 rounded-xl p-4 hover:bg-opacity-70 transition-all flex flex-col items-center gap-2"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-sm">Leave</span>
          </button>
        </div>

        {/* Profile Information Card */}
        <div className="bg-gradient-to-b from-[#0a2930] to-[#0c0111] bg-opacity-50 border-2 border-blue-500 rounded-3xl p-6 backdrop-blur-sm">
          <div className="space-y-6">
            {/* User Name */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                User Name
              </label>
              <div className="text-gray-400">
                {isProfileLoading ? "Loading..." : profile?.username || "N/A"}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Name</label>
              <div className="text-gray-400">
                {isProfileLoading ? "Loading..." : profile?.name || "N/A"}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Email Address
              </label>
              <div className="text-gray-400">
                {isProfileLoading ? "Loading..." : profile?.email || "N/A"}
              </div>
            </div>

            {/* Phone Number - Not in API response, keeping placeholder */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Phone Number
              </label>
              <div className="text-gray-400">
                {isProfileLoading ? "Loading..." : "Not provided"}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Address
              </label>
              <div className="text-gray-400">
                {isProfileLoading ? "Loading..." : profile?.address || "N/A"}
              </div>
            </div>

            {/* Communication */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Communication
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Preference : </span>
                <span className="text-gray-400 capitalize">
                  {isProfileLoading
                    ? "Loading..."
                    : profile?.preference || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2 font-cormorant">
                Logout
              </h2>
              <p className="text-gray-400 mb-6">Do you want to logout?</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
