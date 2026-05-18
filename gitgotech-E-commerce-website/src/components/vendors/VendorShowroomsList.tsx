"use client";

import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import { useGetShowroomByVendorQuery } from "@/redux/features/vendor/showroomSlice/showroomSlice";
import { CheckCircle, MapPin, Plus, Store } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendorShowroomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendorId, setVendorId] = useState("");

  useEffect(() => {
    const vId = searchParams.get("vendorId") || "";
    setVendorId(vId);
  }, [searchParams]);

  const { data: vendorShowroomData, isLoading } = useGetShowroomByVendorQuery(
    {},
  );

  console.log(vendorShowroomData);

  const showrooms = vendorShowroomData?.data || [];
  const vendorProfile = vendorShowroomData?.data?.vendorProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8 pt-24">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-cormorant font-semibold mb-2">
              My Showrooms
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome, {vendorProfile?.name || "Vendor"} • {showrooms.length}{" "}
              Showroom{showrooms.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/v-profile/add-showroom")}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Showroom
          </button>
        </div>

        {/* Showrooms Grid */}
        {showrooms.length === 0 ? (
          <div className="text-center py-20 bg-[#1B1B1F] rounded-2xl border border-gray-700/50">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold mb-2">
              No Showrooms Yet
            </h2>
            <p className="text-gray-400 mb-6">
              Create your first showroom to start displaying products
            </p>
            <button
              onClick={() => router.push("/v-profile/add-showroom")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Add Showroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showrooms.map((showroom: any) => (
              <div
                key={showroom._id}
                onClick={() =>
                  router.push(`/v-profile/view-showroom?id=${showroom._id}`)
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

                  {/* View Details Button */}
                  <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
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
