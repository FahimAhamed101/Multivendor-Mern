// "use client";
// import { useState } from 'react';
// import { X } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export default function WishlistPage() {


//  const router = useRouter();

//   const [wishlistItems, setWishlistItems] = useState([
//     {
//       id: 1,
//       name: 'Flowy Skirt',
//       image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=150&h=150&fit=crop',
//       price: 14.99,
//       status: 'In Stock'
//     },
//     {
//       id: 2,
//       name: 'Brown Shoes',
//       image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop',
//       price: 45.00,
//       status: 'In Stock'
//     },
//     {
//       id: 3,
//       name: 'Trench Coat',
//       image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=150&h=150&fit=crop',
//       price: 190.00,
//       status: 'Out of Stock'
//     }
//   ]);

//   const removeFromWishlist = (id) => {
//     setWishlistItems(items => items.filter(item => item.id !== id));
//   };

//   const addToCart = (item) => {
//     if (item.status === 'In Stock') {
//       alert(`${item.name} added to cart!`);
//     }
//   };

//   return (
//     <div className="min-h-screen mt-28 bg-black text-white p-4 md:p-8">
//       {/* Back Button */}
//       <div className="max-w-6xl mx-auto mb-6">
//         <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
//           <div className="w-8 h-8 rounded-full bg-purple-600/40 cursor-pointer flex items-center justify-center">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </div>
//         </button>
//       </div>

//       {/* Header */}
//       <div className="max-w-6xl mx-auto mb-8 text-center">
//         <h1 className="text-3xl md:text-4xl font-bold mb-3">My Wishlist</h1>
//         <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
//           Save the products you love and revisit them anytime. Your wishlist helps you keep track of outfits, fabrics, and custom designs you may want to order later. Add them to your cart whenever you're ready.
//         </p>
//       </div>

//       {/* Profile Icon - Top Right */}
//       <div className="fixed top-4 right-4 md:top-8 md:right-8 z-10">
//         <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
//           <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//           </svg>
//         </div>
//       </div>

//       {/* Wishlist Table */}
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
//           {/* Table Header - Desktop */}
//           <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900/50">
//             <div className="col-span-5 text-sm font-medium text-gray-400">PRODUCT</div>
//             <div className="col-span-2 text-sm font-medium text-gray-400 text-center">PRICE</div>
//             <div className="col-span-3 text-sm font-medium text-gray-400 text-center">STOCK STATUS</div>
//             <div className="col-span-2 text-sm font-medium text-gray-400 text-center"></div>
//           </div>

//           {/* Wishlist Items */}
//           <div className="divide-y divide-gray-800">
//             {wishlistItems.length > 0 ? (
//               wishlistItems.map((item) => (
//                 <div 
//                   key={item.id}
//                   className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-purple-900/10 transition-colors"
//                 >
//                   {/* Product */}
//                   <div className="md:col-span-5 flex items-center gap-4">
//                     <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
//                       <img 
//                         src={item.image}
//                         alt={item.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-base md:text-lg">{item.name}</h3>
//                       <p className="text-sm text-gray-400 md:hidden mt-1">${item.price.toFixed(2)}</p>
//                     </div>
//                   </div>

//                   {/* Price */}
//                   <div className="md:col-span-2 hidden md:block text-center">
//                     <span className="text-base font-semibold">${item.price.toFixed(2)}</span>
//                   </div>

//                   {/* Stock Status */}
//                   <div className="md:col-span-3 flex md:justify-center">
//                     {item.status === 'In Stock' ? (
//                       <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
//                         In Stock
//                       </span>
//                     ) : (
//                       <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
//                         Out of Stock
//                       </span>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
//                     <button
//                       onClick={() => addToCart(item)}
//                       disabled={item.status !== 'In Stock'}
//                       className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                         item.status === 'In Stock'
//                           ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
//                           : 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                       }`}
//                     >
//                       Add to Cart
//                     </button>
//                     <button
//                       onClick={() => removeFromWishlist(item.id)}
//                       className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors flex-shrink-0"
//                       aria-label="Remove from wishlist"
//                     >
//                       <X className="w-5 h-5 text-red-400" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="p-12 text-center">
//                 <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
//                   <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
//                 <p className="text-gray-400 text-sm">Start adding products you love!</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";
import { useState } from 'react';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useDeleteSaveListMutation, useGetWishlistAndCartQuery, useAddToCartWishListMutation, useAddWishlistToCartMutation } from '@/redux/features/home/homeSlice';
import { IMAGE_BASE_URL } from '@/lib/imageBaseUrl';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const { data: wishlistData, isLoading, refetch } = useGetWishlistAndCartQuery({
        type: "wishlist",
        page: page,
    });

    const [deleteSaveItem] = useDeleteSaveListMutation();
    const [addToCartWishList] = useAddWishlistToCartMutation();

    const wishlistItems = wishlistData?.data || [];
    const pagination = wishlistData?.pagination || {};

    const removeFromWishlist = async (id: string) => {
      
        try {
            const res = await deleteSaveItem(id).unwrap();
         
            if (res?.success) {
                toast.success('Removed from wishlist');
                refetch();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to remove item');
            console.log(error.data)
        }
    };

    const handleAddToCart = async (item: any) => {
        try {
            const data = {
                product: item.product._id,
                saveType: "cart"
            };
            const res = await addToCartWishList(item.product._id).unwrap();
            console.log(res)
            if (res?.success) {
                toast.success('Added to cart!');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to add to cart');
            console.log(error.data, 'add to cart error');
        }
    };

    const getProductImage = (product: any) => {
        if (product.product_images && product.product_images.length > 0) {
            return `${IMAGE_BASE_URL}/${product.product_images[0]}`;
        }
        return '/images/jacket.png';
    };

    const getTotalStock = (stocks: any[]) => {
        if (!stocks || stocks.length === 0) return 0;
        return stocks.reduce((acc, stock) => acc + stock.stock, 0);
    };

    return (
        <div className="min-h-screen mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
            {/* Back Button */}
            <div className="container mx-auto flex items-center gap-4">
                <button onClick={() => router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
                        <FaArrowLeft className='text-black' />
                    </div>
                </button>
                <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant hidden md:block">Wish list</h1>
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-cormorant font-semibold mb-3">My Wishlist</h1>
                <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                    Save the products you love and revisit them anytime. Your wishlist helps you keep track of outfits, fabrics, and custom designs you may want to order later. Add them to your cart whenever you're ready.
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="max-w-6xl mx-auto flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            )}

            {/* Wishlist Table */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Table Header - Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800">
                        <div className="col-span-5 text-sm font-medium text-gray-400">PRODUCT</div>
                        <div className="col-span-2 text-sm font-medium text-gray-400 text-center">PRICE</div>
                        <div className="col-span-3 text-sm font-medium text-gray-400 text-center">STOCK STATUS</div>
                        <div className="col-span-2 text-sm font-medium text-gray-400 text-center"></div>
                    </div>

                    {/* Wishlist Items */}
                    <div className="divide-y divide-gray-800">
                        {wishlistItems.length > 0 ? (
                            wishlistItems.map((item: any) => {
                                const product = item.product;
                                const totalStock = getTotalStock(product.product_stocks);
                                const isInStock = totalStock > 0;
                                const imageUrl = getProductImage(product);

                                return (
                                    <div
                                        key={item._id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-purple-900/10 transition-colors"
                                    >
                                        {/* Product */}
                                        <div className="md:col-span-5 flex items-center gap-4">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-base md:text-lg">{product.product_name}</h3>
                                                <p className="text-sm text-gray-400 md:hidden mt-1">₵{product.product_price?.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 hidden md:block">{product.product_category}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="md:col-span-2 hidden md:block text-center">
                                            <span className="text-base font-semibold">₵{product.product_price?.toFixed(2)}</span>
                                        </div>

                                        {/* Stock Status */}
                                        <div className="md:col-span-3 flex md:justify-center">
                                            {isInStock ? (
                                                <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                                                    In Stock ({totalStock})
                                                </span>
                                            ) : (
                                                <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!isInStock}
                                                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                                    isInStock
                                                        ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlist(product._id)}
                                                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors flex-shrink-0"
                                                aria-label="Remove from wishlist"
                                            >
                                                <X className="w-5 h-5 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            !isLoading && (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                                        <Heart className="w-10 h-10 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-400 text-sm mb-4">Start adding products you love!</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {wishlistItems.length > 0 && pagination.totalPage > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/30 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-400">
                            Page {pagination.currentPage} of {pagination.totalPage}
                        </span>
                        <button
                            onClick={() => setPage(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPage}
                            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/30 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}