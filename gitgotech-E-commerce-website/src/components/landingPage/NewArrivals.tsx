'use client'

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./../../customComponent/Discount.module.css"
import BackButton from "@/customComponent/BackButton";
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";

export default function NewArrivals({ 
  searchQuery, 
  selectedCategory,
  products = []
}: { 
  searchQuery: string; 
  selectedCategory: string | null;
  products?: any[];
}) {
  const router = useRouter();

  return (
    <div className="bg-black py-6 mt-44 sm:py-8 md:py-10 px-2 sm:px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row mt-6 sm:items-center sm:justify-between mb-4 sm:mb-6">
          <BackButton title="New Arrival" />
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => {
              const discount = product.discount?.percentage || 0;
              const imageUrl = product.product_images?.[0]
                ? `${IMAGE_BASE_URL}/${product.product_images[0]}`
                : '/images/jacket.png';

              return (
                <div
                  key={product._id}
                  onClick={() => router.push(`/product/details?id=${product._id}`)}
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
                          <div className={styles.discountBadge}>{discount}% off</div>
                        </div>
                      </div>
                    )}
                    {/* New Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white px-2 sm:px-3 py-1 md:py-2 rounded text-[10px] sm:text-xs font-semibold">
                      NEW
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <div className='flex items-center justify-between'>
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
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-600 text-gray-600'
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