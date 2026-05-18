'use client';

import { Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useGetProductsByCategoryQuery } from '@/redux/features/home/homeSlice';
import styles from '@/customComponent/Discount.module.css';
import { IMAGE_BASE_URL } from '@/lib/imageBaseUrl';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryName = params.categoryName as string;
  const decodedCategory = decodeURIComponent(categoryName);

  const { data, isLoading, isError } = useGetProductsByCategoryQuery(decodedCategory);
  const products = data?.data?.data || [];

  return (
    <div className="bg-black min-h-screen py-6 sm:py-8 md:py-10 mt-28 px-2 sm:px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="container mx-auto mt-24 mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant capitalize">
            {decodedCategory}
          </h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-400 text-lg">Failed to load products. Please try again.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">No products found in this category.</p>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product: any) => {
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
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        ${product.product_price?.toFixed(2)}
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
                    <p className="text-gray-400 text-xs sm:text-sm capitalize">
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
