'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectShowroomId } from '@/redux/features/vendor/showroomSlice/selectedShowroomSlice';
import { useGetProductsQuery, useDeleteProductMutation } from '@/redux/features/vendor/product/productSlice';
import baseUrl from '@/redux/api/baseUrl';
import toast from 'react-hot-toast';
import DeleteModal from '@/components/shared/DeleteModal';

export default function MyProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Filter');
  const router = useRouter();

  const showroomId = useSelector(selectShowroomId);

  const { data: productData, isLoading } = useGetProductsQuery({ showroomId }, { skip: !showroomId });
 
  console.log(productData)

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const openDeleteModal = (product: any) => {
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteProduct({ id: deleteTarget._id, showroomId }).unwrap();
      toast.success(res?.message || 'Product deleted');
    } catch (error: any) {
      const msg = error?.data?.message || 'Failed to delete product';
      toast.error(typeof msg === 'string' ? msg : 'Failed to delete product');
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };
 
  

  const allProducts: any[] = productData?.data?.data ?? [];
 

  const products = allProducts?.filter((p) => {
    const matchSearch = p.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterType === 'Filter' || filterType === 'All Products'
        ? true
        : filterType === 'In Stock'
        ? p.product_stocks === true
        : p.product_stocks === false;
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 border-purple-600/40 shadow-[0_0_12px_rgba(34,211,238,0.35)] border rounded-xl md:rounded-2xl p-4 md:p-8">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Products
            {productData?.pagination && (
              <span className="ml-2 text-sm text-gray-400 font-normal">
                ({productData.pagination.totalData})
              </span>
            )}
          </h2>
          <button
            onClick={() => router.push('/vendor-dashboard/products/add-product')}
            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span className="text-xl">+</span> Add Product
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800/50 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white backdrop-blur-sm"
          >
            <option>Filter</option>
            <option>All Products</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-sm text-white placeholder-gray-400 backdrop-blur-sm"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-gray-400">Loading products...</div>
      )}

      {/* No showroom selected */}
      {!showroomId && !isLoading && (
        <div className="text-center py-12 text-gray-400">Select a showroom from the sidebar to view products.</div>
      )}

      {/* Empty state */}
      {showroomId && !isLoading && products.length === 0 && (
        <div className="text-center py-12 text-gray-400">No products found.</div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product: any) => (
          <div
            key={product._id}
            className="bg-[#1B1B1F] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all group"
          >
            {/* Product Image */}
            <div className="relative bg-gray-800 aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={product.product_images?.[0] ? `${baseUrl}/${product.product_images[0]}` : '/images/jacket.png'}
                alt={product.product_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Buttons overlay */}
              <div className="absolute bottom-2 md:bottom-3 left-2 right-2 md:left-auto md:right-3 flex justify-between md:justify-end gap-2 md:gap-4">
                <button
                  onClick={() => router.push(`products/details?id=${product._id}`)}
                  className="bg-purple-600 px-3 md:px-5 py-1.5 md:py-2 rounded text-xs md:text-sm text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => router.push(`products/edit-product?id=${product._id}`)}
                  className="bg-blue-500 px-3 md:px-5 py-1.5 md:py-2 rounded text-xs md:text-sm text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(product)}
                  className="bg-red-600 px-3 md:px-5 py-1.5 md:py-2 rounded text-xs md:text-sm text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <span
                  className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium ${
                    product.product_stocks
                      ? 'bg-[#BAFF9466] backdrop-blur-[4px] text-[#00AA33]'
                      : 'bg-[#AEAEAE66] backdrop-blur-[4px] text-black'
                  }`}
                >
                  {product.product_stocks ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-base md:text-lg font-bold text-white">
                  ₵{product.product_price?.toFixed(2)}
                </div>
                {product.isMixable && (
                  <span className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full">
                    Mixable
                  </span>
                )}
              </div>

              <h3 className="text-sm md:text-base font-semibold text-white mb-1 truncate">
                {product.product_name}
              </h3>

              <p className="text-xs text-gray-400 truncate">
                {product.showroom?.showroom_name}
              </p>
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        show={showDeleteModal}
        title="Delete Product"
        itemName={deleteTarget?.product_name}
        deleting={deleting}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onDelete={handleDelete}
      />
    </div>
  );
}
