"use client";

import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/features/settings/settingsSlice";
import { useGetShowroomQuery } from "@/redux/features/vendor/showroomSlice/showroomSlice";
import { Camera, Edit, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import url from "./../../redux/api/baseUrl.js";

export default function VendorProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  const { data: profileData, refetch: refetchProfile } =
    useGetMyProfileQuery(undefined);
  const [updateProfile] = useUpdateProfileMutation();

  const { data: showroomData } = useGetShowroomQuery({});
  console.log(showroomData);

  const profile = profileData?.data;

  const profileImageUrl = url + "/" + profile?.image;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    bio: "",
    image: null as File | null,
  });

  const showrooms = showroomData?.data ?? [];

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone?.toString() || "",
        gender: profile.gender || "",
        address: profile.address || "",
        bio: profile.bio || "",
        image: null,
      });
    }
  }, [profile]);

  const handleImageUpload = () => {
    document.getElementById("profileImageInput")?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      if (formData.gender) submitData.append("gender", formData.gender);
      if (formData.address) submitData.append("address", formData.address);
      if (formData.bio) submitData.append("bio", formData.bio);
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const res = await updateProfile(submitData).unwrap();

      if (res?.success) {
        toast.success("Profile updated successfully!");
        refetchProfile();
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone?.toString() || "",
        gender: profile.gender || "",
        address: profile.address || "",
        bio: profile.bio || "",
        image: null,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Notify Navbar to update
    window.dispatchEvent(new Event("authChanged"));

    // Navigate to home page without reload
    router.push("/");
  };

  const handleAddShowroom = () => {
    router.push("/v-profile/add-showroom");
  };

  return (
    <div className="space-y-6 pb-5 md:mt-24 mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black min-h-screen">
      {/* Header */}
      <div className="flex items-center container mx-auto justify-between pt-0 md:pt-4">
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
            Profile Info
          </h1>
        </div>
        <div className="md:mr-24 mr-14 flex items-center gap-2">
          <img
            onClick={() => router.push("/v-profile/wallet")}
            className="cursor-pointer"
            src="/images/wallet.png"
            alt=""
          />
          <img
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
            src="/images/settinsg.png"
            alt=""
          />
          <img
            onClick={() => setIsLogoutModalOpen(true)}
            className="cursor-pointer"
            src="/images/log.png"
            alt=""
          />
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center">
        <h3 className="text-sm text-gray-400 mb-4">Profile Picture</h3>
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center overflow-hidden border-4 border-purple-500/30">
            {profile?.image ? (
              <img
                src={profileImageUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : (
              <span className="text-5xl">👤</span>
            )}
          </div>
          {/* <input
            id="profileImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          /> */}
        </div>
        {/* <button
          onClick={handleImageUpload}
          className="mt-4 px-6 py-2 bg-[#6100FF] cursor-pointer text-white hover:bg-[#5000dd] rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Upload size={16} />
          Upload
        </button> */}
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] max-w-6xl mx-auto border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold font-cormorant text-white">
            Personal Information
          </h2>
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 bg-[#6100FF] cursor-pointer text-white hover:bg-[#5000dd] rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">User Name</span>
            <span className="text-white">{profile?.username || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Name</span>
            <span className="text-white">{profile?.name || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Email</span>
            <span className="text-white">{profile?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Phone Number</span>
            <span className="text-white">{profile?.phone || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Gender</span>
            <span className="text-white">
              {profile?.gender || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Address</span>
            <span className="text-white">
              {profile?.address || "Not specified"}
            </span>
          </div>
          {profile?.bio && (
            <div className="py-3">
              <span className="text-sm text-gray-400 block mb-2">Bio</span>
              <p className="text-white text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Role</span>
            <span className="text-white capitalize">
              {profile?.role || "Vendor"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
            <span className="text-sm text-gray-400">Verification Status</span>
            <span
              className={`text-white ${profile?.isVerified ? "text-green-400" : "text-yellow-400"}`}
            >
              {profile?.isVerified ? "✓ Verified" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* My Showrooms */}
      <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] max-w-6xl mx-auto border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-white font-cormorant">
            My Showrooms
          </h2>
          <div className="flex items-center gap-2">
            <Link href={"/v-profile/showrooms"}>
              <button className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm">
                View All
              </button>
            </Link>
            <button
              onClick={handleAddShowroom}
              className="px-4 py-2 bg-[#6100FF] cursor-pointer text-white hover:bg-[#5000dd] rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
              + Add Showroom
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showrooms.map((showroom: any) => (
            <div
              key={showroom._id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
            >
              <img
                src={`${url}/${showroom?.logo}`}
                className="w-full h-40 object-cover"
                alt={showroom.showroom_name}
              />
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1">
                  {showroom.showroom_name}
                </h3>
                {!showroom.isApprove && (
                  <p className="text-yellow-400 text-xs mb-1">
                    Pending Approval
                  </p>
                )}
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                  <MapPin size={14} />
                  <span className="truncate">{showroom.showroom_address}</span>
                </div>
                <Link href={`/v-profile/view-showroom?id=${showroom._id}`}>
                  <button className="w-full py-2 bg-[#6100FF] text-white cursor-pointer hover:bg-[#5000dd] rounded-lg transition-all text-sm font-medium">
                    View Info
                  </button>
                </Link>
              </div>
            </div>
          ))}
          {showrooms.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No showrooms added yet
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 mt-16">
          <div className="bg-gradient-to-b from-[#2C223C] to-[#18161C] border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white font-cormorant">
                Edit Profile
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Profile Picture in Modal */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-purple-500/30">
                  {formData.image ? (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.image ? (
                    <img
                      src={`${url}${profile.image}`}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#6100FF] rounded-full flex items-center justify-center hover:bg-[#5000dd] transition-colors cursor-pointer">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-400">
                Click camera to update profile picture
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-6 py-3 bg-[#6100FF] hover:bg-[#5000dd] text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
