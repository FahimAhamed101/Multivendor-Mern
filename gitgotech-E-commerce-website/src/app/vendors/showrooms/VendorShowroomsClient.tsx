"use client";

import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import { useGetVendorShowroomsQuery } from "@/redux/features/vendor/showroomSlice/showroomSlice";
import {
  ArrowLeft,
  CheckCircle,
  CloudCog,
  Mail,
  MapPin,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorShowroomsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendorId, setVendorId] = useState("");

  useEffect(() => {
    const vId = searchParams.get("vendorId") || "";
    setVendorId(vId);
  }, [searchParams]);

  const { data: vendorShowroomData, isLoading } = useGetVendorShowroomsQuery(
    vendorId,
    {
      skip: !vendorId,
    },
  );

  const showrooms = vendorShowroomData?.data?.showrooms || [];
  const vendorProfile = vendorShowroomData?.data?.vendorProfile;
  console.log(vendorProfile)

  const getImageUrl = (image: string) => {
    if (!image) return undefined;
    if (image.startsWith("http")) return image;
    return `${IMAGE_BASE_URL}/${image}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black flex justify-center items-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-cormorant mb-2">
            Vendor Not Found
          </h1>
          <Link
            href="/vendors"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8 pt-24">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/vendors")}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600/40 cursor-pointer flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Vendor Profile Header */}
        <div className="bg-[#1B1B1F] backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Vendor Image/Avatar */}
            <div className="flex-shrink-0">
              {vendorProfile?.image ? (
                <img
                  src={getImageUrl(vendorProfile.image)}
                  alt={vendorProfile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/30"
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
              <div
                className={`w-32 h-32 rounded-full bg-[#2a2a2e] border-4 border-purple-500/30 flex items-center justify-center ${vendorProfile?.image ? "hidden" : "flex"}`}
              >
                <span className="text-5xl font-cormorant text-gray-400">
                  {vendorProfile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-cormorant font-semibold mb-2">
                {vendorProfile?.name}
              </h1>
              <p className="text-gray-400 text-lg mb-4">
                @{vendorProfile?.username}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                {/* Email */}
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>{vendorProfile?.email}</span>
                </div>

                {/* Verification Badge */}
                {vendorProfile?.isVerified && (
                  <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}

                {/* Top Vendor Badge */}
                {vendorProfile?.topVendor && (
                  <div className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full text-sm">
                    <User className="w-4 h-4" />
                    <span>Top Vendor</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {showrooms.length}
                  </p>
                  <p className="text-gray-500">Showrooms</p>
                </div>

                {/* <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {vendorProfile?.balance
                      ? `$${(vendorProfile.balance / 1000000).toFixed(1)}M`
                      : "$0"}
                  </p>
                  <p className="text-gray-500">Balance</p>
                </div> */}
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {new Date(
                      vendorProfile?.createdAt || Date.now(),
                    ).getFullYear()}
                  </p>
                  <p className="text-gray-500">Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showrooms Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-cormorant font-semibold text-white">
            {vendorProfile?.name}'s Showrooms
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {showrooms.length} Showroom{showrooms.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Showrooms Grid */}
        {showrooms.length === 0 ? (
          <div className="text-center py-20 bg-[#1B1B1F] rounded-2xl border border-gray-700/50">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold mb-2">
              No Showrooms Yet
            </h2>
            <p className="text-gray-400">
              This vendor hasn't created any showrooms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showrooms.map((showroom: any) => (
              <div
                key={showroom._id}
                onClick={() =>
                  router.push(
                    `/showroom/view-showroom?showroomId=${showroom._id}&vendorId=${vendorId}`,
                  )
                }
                className="bg-[#1B1B1F] backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group"
              >
                {/* Showroom Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`${IMAGE_BASE_URL}/${showroom.logo}`}
                    alt={showroom.showroom_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Approval Badge */}
                  {showroom.isApprove && (
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </div>
                  )}
                  {!showroom.isApprove && (
                    <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      Pending
                    </div>
                  )}
                </div>

                {/* Showroom Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
                    {showroom.showroom_name}
                  </h3>

                  <div className="flex items-start gap-2 text-gray-400 text-sm mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{showroom.showroom_address}</p>
                  </div>

                  {/* Created Date */}
                  <p className="text-gray-500 text-xs mb-4">
                    Created:{" "}
                    {new Date(showroom.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  {/* View Products Button */}
                  <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Products
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
