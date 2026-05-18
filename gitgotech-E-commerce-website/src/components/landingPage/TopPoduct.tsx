"use client";

import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";
import { useGetShowroomProductQuery } from "@/redux/features/home/homeSlice";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./../../customComponent/Discount.module.css";

export default function TopPoduct({
  searchQuery,
  selectedCategory,
  products = [],
  showroomId,
  product_category,
  categories = [],
  onCategoryChange,
}: {
  searchQuery: string;
  selectedCategory: string | null;
  products?: any[];
  showroomId?: string;
  product_category?: string;
  categories?: any[];
  onCategoryChange?: (category: string) => void;
}) {
  const router = useRouter();

  // Fetch showroom products if showroomId is provided
  const { data: showroomProductsData } = useGetShowroomProductQuery(
    { id: showroomId || "", product_category: product_category || "" },
    { skip: !showroomId },
  );

  // Use showroom products if showroomId is provided, otherwise use passed products
  const displayProducts = showroomId
    ? showroomProductsData?.data?.data || []
    : products;

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onCategoryChange) {
      onCategoryChange(e.target.value);
    }
  };

  return (
    <div
      className={`bg-black py-6 sm:py-8 md:py-10 ${showroomId ? "" : "mt-44 md:mt-52"} px-2 sm:px-4`}
    >
      <div className="container mx-auto">
        {/* Header - Only show if not in showroom context */}
        {!showroomId && (
          <div className="container mx-auto flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
                  <FaArrowLeft className="text-black" />
                </div>
              </button>
              <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
                Top Product
              </h1>
            </div>

            {/* Category Filter - Show only if categories provided */}
            {categories.length > 0 && onCategoryChange && (
              <select
                value={selectedCategory || ""}
                onChange={handleCategoryChange}
                className="bg-[#1B1B1F] backdrop-blur-sm border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category.category_slug}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayProducts.map((product: any) => {
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
                  className="bg-[#1B1B1F] rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
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
                      <div className="absolute top-2 left-0 inline-flex items-center">
                        <div className={styles.card}>
                          <div className={styles.discountBadge}>
                            {discount}% off
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Best Seller Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#2388FF] text-white px-2 sm:px-3 py-1 md:py-2 rounded text-[10px] sm:text-xs font-semibold">
                      BEST SELLER
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        ₵{product.product_price?.toFixed(2)}
                      </div>
                      {/* Rating */}
                      <div className="flex items-center mb-1 sm:mb-2">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3 sm:w-4 h-3 sm:h-4 ${
                              index < Math.floor(product.review_rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-600 text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="text-gray-400 text-[10px] sm:text-xs ml-1 sm:ml-2">
                          {product.review_count || 0} Reviews
                        </span>
                      </div>
                    </div>

                    <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-1">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {product.product_category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
