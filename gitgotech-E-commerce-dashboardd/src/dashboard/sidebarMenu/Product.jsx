import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, X, EyeOff, Eye } from 'lucide-react';
import { useGetAdminProductQuery, useGetAdminProductsQuery, useToggleProductPrivateMutation } from '../../redux/features/product/productSlice';
 

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL; // 🔁 Replace with your actual base URL
 

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [privateReason, setPrivateReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [localPrivateStatus, setLocalPrivateStatus] = useState({});
  const productsPerPage = 8;

  // ✅ Fetch all products
  const { data: productsData, isLoading, refetch } = useGetAdminProductsQuery({
    page: currentPage,
    limit: productsPerPage,
  });

  const products = productsData?.data?.data || [];
  const meta = productsData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;
  const totalProducts = meta?.total || 0;
  const startIndex = (currentPage - 1) * productsPerPage + 1;
  const endIndex = Math.min(currentPage * productsPerPage, totalProducts);

  // ✅ Fetch single product for modal
  const { data: singleProductData, isLoading: isSingleLoading } = useGetAdminProductQuery(
    selectedProductId,
    { skip: !selectedProductId }
  );
  const selectedProduct = singleProductData?.data;

  // ✅ Toggle private mutation
  const [toggleProductPrivate] = useToggleProductPrivateMutation();

  // ✅ Handle private/public toggle
  const handleTogglePrivate = async (productId, currentPrivateStatus, reason = '') => {
    if (!currentPrivateStatus && !reason.trim()) {
      setShowReasonInput(true);
      return;
    }

    console.log(productId,currentPrivateStatus, reason)
   

    try {
      await toggleProductPrivate({
        id: productId,
        body: {
          isPrivate: !currentPrivateStatus,
           privateReason: reason.trim() || undefined,
        }
      }).unwrap();

      setLocalPrivateStatus(prev => ({
        ...prev,
        [productId]: !currentPrivateStatus,
      }));

      setShowReasonInput(false);
      setPrivateReason('');
      refetch();
    } catch (error) {
      console.error('Toggle private failed:', error);
      alert('Failed to update product visibility');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const closeModal = () => {
    setSelectedProductId(null);
    setShowReasonInput(false);
    setPrivateReason('');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading products...</div>;
  }

  return (
    <div className="px-4 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
        <p className="text-gray-400">
          Showing {startIndex} - {endIndex} of {totalProducts} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {products.map((product) => {
          const productId = product._id;
          const isPrivate = localPrivateStatus.hasOwnProperty(productId)
            ? localPrivateStatus[productId]
            : product.isPrivate;

          const firstImage = product.product_images?.[0];
          const totalStock = product.product_stocks?.reduce((sum, s) => sum + s.stock, 0) || 0;

          return (
            <div
              key={productId}
              className="bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-800">
                {firstImage ? (
                  <img
                    src={`${IMAGE_BASE_URL}/${firstImage}`}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://via.placeholder.com/300/2d2433/ffffff?text=No+Image'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                    No Image
                  </div>
                )}

                {/* Discount Badge */}
                {product.discount?.isValid && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    -{product.discount.percentage}%
                  </div>
                )}

                {/* Private Badge */}
                {isPrivate && (
                  <div className="absolute top-3 right-3 bg-gray-900/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Private
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white text-lg font-bold">
                    ${product.product_price?.toFixed(2)}
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.review_rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-600 text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-gray-400 text-xs mb-1">
                  {product.review_count || 0} Reviews • {totalStock} in stock
                </div>

                <h3 className="text-white font-medium text-sm mb-1 line-clamp-1 capitalize">
                  {product.product_name}
                </h3>

                <p className="text-gray-400 text-xs mb-1">
                  By {product.vendor?.name || 'N/A'}
                </p>

                <p className="text-purple-300 text-xs mb-3 capitalize">
                  {product.product_category}
                </p>

                <button
                  onClick={() => setSelectedProductId(productId)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-500 py-16">No products found</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-[#2d2433] to-[#1f1b24] text-white border border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                page === currentPage
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : page === '...'
                  ? 'bg-transparent text-gray-400 cursor-default'
                  : 'bg-gradient-to-br from-[#2d2433] to-[#1f1b24] text-white border border-purple-500/30 hover:border-purple-500/60'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-[#2d2433] to-[#1f1b24] text-white border border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ✅ Product Details Modal */}
      {selectedProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-purple-500/40 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <div className="p-6">
              {/* Modal Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Product Details</h2>
                <p className="text-gray-400 text-sm">Complete information about the product</p>
              </div>

              {isSingleLoading ? (
                <div className="text-center text-gray-400 py-12">Loading product details...</div>
              ) : selectedProduct ? (
                <>
                  {/* Image + Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Image */}
                    <div className="rounded-lg overflow-hidden border border-purple-500/20">
                      {selectedProduct.product_images?.[0] ? (
                        <img
                          src={`${IMAGE_BASE_URL}/${selectedProduct.product_images[0]}`}
                          alt={selectedProduct.product_name}
                          className="w-full h-64 object-cover"
                          onError={e => { e.target.src = 'https://via.placeholder.com/300/2d2433/ffffff?text=No+Image'; }}
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gray-800 text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Product Name</p>
                        <p className="text-white font-semibold text-lg capitalize">{selectedProduct.product_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Vendor</p>
                        <p className="text-white font-semibold">{selectedProduct.vendor?.name}</p>
                        <p className="text-gray-400 text-xs">{selectedProduct.vendor?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Showroom</p>
                        <p className="text-white font-semibold">{selectedProduct.showroom?.showroom_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Price</p>
                          <p className="text-white font-bold text-xl">${selectedProduct.product_price?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Discount</p>
                          <p className="text-green-400 font-bold text-xl">
                            {selectedProduct.discount?.isValid ? `-${selectedProduct.discount.percentage}%` : 'None'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.review_rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-600 text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-gray-400 text-sm">({selectedProduct.review_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Detail Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    <InfoCard label="Product ID" value={selectedProduct._id?.slice(-8)} mono />
                    <InfoCard label="Category" value={selectedProduct.product_category} capitalize />
                    <InfoCard
                      label="Weight"
                      value={`${selectedProduct.product_weight?.amount} ${selectedProduct.product_weight?.unit}`}
                    />
                    <InfoCard label="Sale Count" value={selectedProduct.sale_count ?? 0} />
                    <InfoCard
                      label="Custom"
                      value={selectedProduct.isCustom ? '✅ Yes' : '❌ No'}
                    />
                    <InfoCard
                      label="Mixable"
                      value={selectedProduct.isMixable ? '✅ Yes' : '❌ No'}
                    />
                    <InfoCard
                      label="Created"
                      value={new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    />
                    {selectedProduct.discount?.isValid && (
                      <InfoCard
                        label="Discount Period"
                        value={
                          selectedProduct.discount.startDate && selectedProduct.discount.endDate
                            ? `${new Date(selectedProduct.discount.startDate).toLocaleDateString()} - ${new Date(selectedProduct.discount.endDate).toLocaleDateString()}`
                            : 'Always'
                        }
                      />
                    )}

                    {/* ✅ Visibility Status */}
                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-gray-400 text-xs mb-1">Visibility</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
                        (localPrivateStatus.hasOwnProperty(selectedProduct._id)
                          ? localPrivateStatus[selectedProduct._id]
                          : selectedProduct.isPrivate)
                          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {(localPrivateStatus.hasOwnProperty(selectedProduct._id)
                          ? localPrivateStatus[selectedProduct._id]
                          : selectedProduct.isPrivate)
                          ? '🔒 Private'
                          : '🌐 Public'}
                      </span>
                    </div>
                  </div>

                  {/* Stocks */}
                  <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20 mb-4">
                    <p className="text-gray-400 text-xs mb-3">Stock by Size</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.product_stocks?.map(s => (
                        <div key={s._id} className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-3 py-2 text-center min-w-[60px]">
                          <p className="text-purple-300 text-xs font-semibold">{s.size}</p>
                          <p className="text-white font-bold text-sm">{s.stock}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Private Reason */}
                  {selectedProduct.isPrivate && selectedProduct.privateReason && (
                    <div className="bg-gray-500/10 rounded-lg p-4 border border-gray-500/20 mb-4">
                      <p className="text-gray-400 text-xs mb-1">Private Reason</p>
                      <p className="text-gray-300 text-sm">{selectedProduct.privateReason}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20 mb-6">
                    <p className="text-gray-400 text-xs mb-2">Description</p>
                    <p className="text-white text-sm leading-relaxed">{selectedProduct.product_description}</p>
                  </div>

                  {/* ✅ Private Reason Input (shows when making private) */}
                  {showReasonInput && (
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">
                        Reason for making private <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={privateReason}
                        onChange={e => setPrivateReason(e.target.value)}
                        placeholder="Enter reason for making this product private..."
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => { setShowReasonInput(false); setPrivateReason(''); }}
                          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleTogglePrivate(selectedProduct._id, false, privateReason)}
                          disabled={!privateReason.trim()}
                          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <EyeOff className="w-4 h-4" /> Confirm Private
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ✅ Private/Public Toggle Button */}
                  {!showReasonInput && (
                    <button
                      onClick={() => {
                        const currentPrivate = localPrivateStatus.hasOwnProperty(selectedProduct._id)
                          ? localPrivateStatus[selectedProduct._id]
                          : selectedProduct.isPrivate;
                        handleTogglePrivate(selectedProduct._id, currentPrivate);
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 border ${
                        (localPrivateStatus.hasOwnProperty(selectedProduct._id)
                          ? localPrivateStatus[selectedProduct._id]
                          : selectedProduct.isPrivate)
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-500/30'
                          : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border-gray-500/30'
                      }`}
                    >
                      {(localPrivateStatus.hasOwnProperty(selectedProduct._id)
                        ? localPrivateStatus[selectedProduct._id]
                        : selectedProduct.isPrivate)
                        ? <><Eye className="w-4 h-4" /> Make Public</>
                        : <><EyeOff className="w-4 h-4" /> Make Private</>
                      }
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">Product not found</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

// Reusable Info Card
const InfoCard = ({ label, value, mono = false, capitalize = false }) => (
  <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className={`text-white font-semibold text-sm ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>
      {value}
    </p>
  </div>
);

export default ProductsPage;