// 'use client'

// import { Star } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { FaArrowLeft } from 'react-icons/fa';
// import styles from "./../../customComponent/Discount.module.css"
// import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";

// export default function AllHotdealsProduct({ 
//   searchQuery, 
//   selectedCategory,
//   products = []
// }: { 
//   searchQuery: string; 
//   selectedCategory: string | null;
//   products?: any[];
// }) {
//   const router = useRouter();

//   return (
//     <div className="bg-black py-6 mt-28 sm:py-8 md:py-10 px-2 sm:px-4">
//       <div className="container mx-auto">
//         {/* Header */}
//         <div className="container mx-auto mt-24 mb-2 flex items-center gap-4">
//           <button onClick={() => router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
//             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
//               <FaArrowLeft className='text-black' />
//             </div>
//           </button>
//           <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">Hot Deals</h1>
//         </div>

//         <Image
//           alt="banner"
//           src="/images/discount.png"
//           width={1200}
//           height={300}
//           className="w-full h-auto mb-6 rounded-lg"
//         />

//         {/* Products Grid */}
//         {products.length === 0 ? (
//           <div className="flex items-center justify-center py-20">
//             <p className="text-gray-400 text-lg">No products found.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//             {products.map((product) => {
//               const discount = product.discount?.percentage || 0;
//               const imageUrl = product.product_images?.[0]
//                 ? `${IMAGE_BASE_URL}/${product.product_images[0]}`
//                 : '/images/jacket.png';

//               return (
//                 <div
//                   key={product._id}
//                   onClick={() => router.push(`/product/details?id=${product._id}`)}
//                   className="bg-[#1B1B1F] rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
//                 >
//                   {/* Product Image */}
//                   <div className="relative aspect-square overflow-hidden">
//                     <img
//                       src={imageUrl}
//                       alt={product.product_name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                     />
//                     {/* Discount Badge */}
//                     {discount > 0 && (
//                       <div className="absolute top-2 left-0 inline-flex items-center">
//                         <div className={styles.card}>
//                           <div className={styles.discountBadge}>{discount}% off</div>
//                         </div>
//                       </div>
//                     )}
//                     {/* Hot Deal Badge */}
//                     <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#2388FF] text-white px-2 sm:px-3 py-1 md:py-2 rounded text-[10px] sm:text-xs font-semibold">
//                       HOT DEAL
//                     </div>
//                   </div>

//                   {/* Product Info */}
//                   <div className="p-3 sm:p-4">
//                     <div className='flex items-center justify-between'>
//                       <div className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">
//                         ₵{product.product_price?.toFixed(2)}
//                       </div>
//                       {/* Rating */}
//                       <div className="flex items-center mb-1 sm:mb-2">
//                         {[...Array(5)].map((_, index) => (
//                           <Star
//                             key={index}
//                             className={`w-3 sm:w-4 h-3 sm:h-4 ${
//                               index < Math.floor(product.review_rating || 0)
//                                 ? 'fill-yellow-400 text-yellow-400'
//                                 : 'fill-gray-600 text-gray-600'
//                             }`}
//                           />
//                         ))}
//                         <span className="text-gray-400 text-[10px] sm:text-xs ml-1 sm:ml-2">
//                           {product.review_count || 0} Reviews
//                         </span>
//                       </div>
//                     </div>

//                     <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-1">
//                       {product.product_name}
//                     </h3>
//                     <p className="text-gray-400 text-xs sm:text-sm">
//                       {product.product_category}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client'

import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from 'react-icons/fa';
import styles from "./../../customComponent/Discount.module.css"
import { IMAGE_BASE_URL } from "@/lib/imageBaseUrl";

export default function AllHotdealsProduct({ 
  searchQuery, 
  selectedCategory,
  products = []
}: { 
  searchQuery: string; 
  selectedCategory: string | null;
  products?: any[];
}) {
  const router = useRouter();

  // ─── Get max discount from all products ───────────────────────
  const maxDiscount = products.length > 0
    ? Math.max(...products.map((p) => p.discount?.percentage || 0))
    : 0;

  return (
    <div className="bg-black py-6 mt-28 sm:py-8 md:py-10 px-2 sm:px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="container mx-auto mt-24 mb-2 flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className='text-black' />
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">Hot Deals</h1>
        </div>

        {/* ─── Banner with dynamic discount overlay ─────────────── */}
        <div className="relative w-full mb-6">
          <Image
            alt="banner"
            src="/images/discount.png"
            width={1200}
            height={300}
            className="w-full h-auto rounded-lg"
          />

          {/* Discount % overlay — positioned center of the banner */}
          {maxDiscount > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Push it down a bit to sit below "UP TO" text in the image */}
              <div className="mt-8 sm:mt-10 md:mt-12 text-center">
                <span
                  className="font-extrabold text-white drop-shadow-lg leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
                >
                  {maxDiscount}%
                </span>
                <p
                  className="text-white font-semibold tracking-widest uppercase drop-shadow"
                  style={{ fontSize: 'clamp(0.75rem, 2vw, 1.5rem)' }}
                >
                  OFF
                </p>
                 <button>go</button>
              </div>
            </div>
          )}
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
                    {/* Hot Deal Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#2388FF] text-white px-2 sm:px-3 py-1 md:py-2 rounded text-[10px] sm:text-xs font-semibold">
                      HOT DEAL
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