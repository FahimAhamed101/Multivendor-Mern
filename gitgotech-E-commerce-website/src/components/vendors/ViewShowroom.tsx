"use client";
import DeleteModal from "@/components/shared/DeleteModal";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import {
  useGetHomeCategoriesQuery,
  useGetShowroomProductQuery,
} from "@/redux/features/home/homeSlice";
import {
  useDeleteShowroomMutation,
  useGetShowroomDetailsQuery,
  useGetVendorShowroomsQuery,
} from "@/redux/features/vendor/showroomSlice/showroomSlice";
import { Edit, Star, Store, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./../../customComponent/Discount.module.css";
import url from "./../../redux/api/baseUrl.js";

// Read time directly from ISO string (no timezone conversion)
const formatTime = (iso: string) => {
  const timeStr = iso?.slice(11, 16) ?? "00:00"; // "09:00"
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const isClosed = (iso: string) => iso?.slice(11, 19) === "00:00:00";

export default function ViewShowroomPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categoriesRes } = useGetHomeCategoriesQuery({});
  const categories = categoriesRes?.data ?? [];

  // Get vendor showrooms data using vendorId
  const { data: vendorShowroomData, isLoading: isLoadingShowrooms } =
    useGetVendorShowroomsQuery(vendorId, {
      skip: !vendorId,
    });

  console.log(vendorShowroomData);
  const showrooms = vendorShowroomData?.data?.showrooms || [];
  const vendorProfile = vendorShowroomData?.data?.vendorProfile;

  console.log(showrooms);
  console.log(showrooms);

  // Get showroom details for the selected showroom
  const { data: showroomDetails } = useGetShowroomDetailsQuery(id, {
    skip: !id,
  });
  const { data: showroomProducts } = useGetShowroomProductQuery(
    { id, product_category: selectedCategory },
    { skip: !id },
  );
  const [deleteShowroom, { isLoading: deleting }] = useDeleteShowroomMutation();

  const details = showroomDetails?.data;
  const products = showroomProducts?.data?.data || [];
  const totalProducts = showroomProducts?.data?.meta?.total || 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showroomId = params.get("id") || "";
    const vId = params.get("vendorId") || "";
    setId(showroomId);
    setVendorId(vId);
  }, []);

  const handleNavigate = (showroomId: string) => {
    router.push(
      `/v-profile/view-showroom?id=${showroomId}&vendorId=${vendorId}`,
    );
  };

  const handleDelete = async () => {
    try {
      const res = await deleteShowroom(id).unwrap();
      console.log(res);
      if (res?.status === 200) {
        toast.success(res?.message || "Showroom deleted");
        router.push("/v-profile");
      }
    } catch (error: any) {
      const msg = error?.data?.message || "Failed to delete showroom";
      toast.error(typeof msg === "string" ? msg : "Failed to delete showroom");
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      {/* Loading State */}
      {isLoadingShowrooms && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mt-16 md:mt-24 mb-2.5 md:mb-8">
        <div className="container mx-auto mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/v-profile/showrooms")}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600/40 cursor-pointer flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </button>
            <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">
              Showroom Details
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Showroom Selector */}
            <select
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="bg-[#1B1B1F] border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Showroom</option>
              {showrooms.map((showroom: any) => (
                <option key={showroom._id} value={showroom._id}>
                  {showroom.showroom_name}
                </option>
              ))}
            </select>

            <button
              onClick={() => router.push(`/v-profile/update-showroom?id=${id}`)}
              disabled={!id}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!id}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">
            Business Logo
          </h2>
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-2 border-purple-500/30">
              <img
                src={`${url}/${details?.logo}`}
                alt="Business Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-gradient-to-br from-purple-900/30 via-gray-900/80 to-purple-900/20 border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-300 mb-6">
            Showroom's Information
          </h2>
          <div className="space-y-4">
            <InfoRow
              label="Showroom Name"
              value={details?.showroom_name ?? "—"}
            />
            <InfoRow
              label="Category"
              value={details?.showroom_category?.join(", ") ?? "—"}
            />
            <InfoRow label="Address" value={details?.showroom_address ?? "—"} />
            <InfoRow
              label="Referral Code"
              value={details?.referralCode ?? "—"}
            />
            <InfoRow
              label="Status"
              value={details?.isApprove ? "Approved" : "Pending Approval"}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-gradient-to-br from-purple-900/30 via-gray-900/80 to-purple-900/20 border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-300 mb-6">
            Showroom Hours
          </h2>
          <div className="space-y-3">
            {(details?.showroom_schedule ?? []).map((slot: any) => {
              const closed = isClosed(slot.open);
              return (
                <div
                  key={slot._id}
                  className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0"
                >
                  <span className="text-white font-medium">{slot.day}</span>
                  <span
                    className={`text-sm ${closed ? "text-red-400" : "text-gray-400"}`}
                  >
                    {closed
                      ? "Closed"
                      : `${formatTime(slot.open)} - ${formatTime(slot.close)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-white font-cormorant text-xl md:text-2xl font-semibold">
              Showroom Products ({totalProducts})
            </h2>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#1B1B1F] border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category.category_slug}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-purple-900/30 via-gray-900/80 to-purple-900/20 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
              <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No products found in this showroom.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any) => {
                const discount = product.discount?.percentage || 0;
                const imageUrl = product.product_images?.[0]
                  ? `${IMAGE_BASE_URL}/${product.product_images[0]}`
                  : "/images/jacket.png";

                return (
                  <div
                    key={product._id}
                    onClick={() =>
                      router.push(`/product/details?id=${product._id}`)
                    }
                    className="bg-[#1B1B1F] rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow border border-gray-700/50"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-0 left-0 inline-flex items-center">
                          <div className={styles.card}>
                            <div className={styles.discountBadge}>
                              {discount}% off
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white text-lg font-bold">
                          ₵{product.product_price?.toFixed(2)}
                        </div>
                        {/* Rating */}
                        {product.review_rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index < Math.floor(product.review_rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-600 text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="text-gray-400 text-xs ml-1">
                              ({product.review_count || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">
                        {product.product_category}
                      </p>

                      {/* Stock Info */}
                      {product.product_stocks && (
                        <div className="text-xs text-gray-500">
                          Total Stock:{" "}
                          {product.product_stocks.reduce(
                            (acc: number, s: any) => acc + s.stock,
                            0,
                          )}{" "}
                          units
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        title="Delete Showroom"
        itemName={details?.showroom_name}
        deleting={deleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-800/50 last:border-0">
      <span className="text-white font-medium">{label}</span>
      <span className="text-gray-400 text-sm">{value}</span>
    </div>
  );
}
