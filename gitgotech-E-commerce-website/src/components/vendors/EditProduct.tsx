'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectShowroomId } from '@/redux/features/vendor/showroomSlice/selectedShowroomSlice';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/redux/features/vendor/product/productSlice';
import toast from 'react-hot-toast';
import baseUrl from '@/redux/api/baseUrl';
import DeleteModal from '@/components/shared/DeleteModal';

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const showroomId = useSelector(selectShowroomId);

  const { data: productDetailsData, isLoading: isLoadingDetails } = useGetProductDetailsQuery(
    { id: productId, showroomId },
    { skip: !productId || !showroomId }
  );
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [weightAmount, setWeightAmount] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [mixDesign, setMixDesign] = useState(false);
  const [customDesign, setCustomDesign] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X', '4X'];
  const [productStocks, setProductStocks] = useState<{ size: string; stock: number }[]>([]);

  // Populate form with existing product data
  useEffect(() => {
    const product = productDetailsData?.data;
    if (product) {
      setProductName(product.product_name || '');
      setDescription(product.product_description || '');
      setPrice(product.product_price?.toString() || '');
      setCategory(product.product_category || '');
      setWeightAmount(product.product_weight?.amount?.toString() || '');
      setWeightUnit(product.product_weight?.unit || 'kg');
      setMixDesign(product.isMixable || false);
      setCustomDesign(product.isCustom || false);
      setExistingImages(product.product_images || []);

      if (product.product_stocks && Array.isArray(product.product_stocks)) {
        setProductStocks(product.product_stocks.map((s: any) => ({ size: s.size, stock: s.stock })));
      }

      if (product.discount?.isValid) {
        setHasDiscount(true);
        setDiscountPercent(product.discount.percentage?.toString() || '');
        setDiscountStartDate(product.discount.startDate ? product.discount.startDate.split('T')[0] : '');
        setDiscountEndDate(product.discount.endDate ? product.discount.endDate.split('T')[0] : '');
      }
    }
  }, [productDetailsData]);

  const toggleSize = (size: string) => {
    const exists = productStocks.find((s) => s.size === size);
    if (exists) {
      setProductStocks(productStocks.filter((s) => s.size !== size));
    } else {
      setProductStocks([...productStocks, { size, stock: 0 }]);
    }
  };

  const updateStock = (size: string, stock: number) => {
    setProductStocks(productStocks.map((s) => (s.size === size ? { ...s, stock } : s)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewImageFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    router.back();
  };

  const handleUpdate = async () => {
    if (!productName || !price || !category) {
      toast.error('Please fill in product name, price, and category');
      return;
    }

    const productData: any = {
      product_name: productName,
      product_category: category,
      product_description: description,
      product_price: parseFloat(price),
      product_stocks: productStocks,
      product_weight: {
        unit: weightUnit,
        amount: parseFloat(weightAmount) || 0,
      },
      product_images: existingImages,
      isMixable: mixDesign,
      isCustom: customDesign,
    };

    if (hasDiscount) {
      productData.discount = {
        isValid: true,
        percentage: parseFloat(discountPercent) || 0,
        startDate: discountStartDate ? new Date(discountStartDate).toISOString() : '',
        endDate: discountEndDate ? new Date(discountEndDate).toISOString() : '',
      };
    } else {
      productData.discount = { isValid: false };
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(productData));
    newImageFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await updateProduct({ id: productId, data: formData, showroomId }).unwrap();
      toast.success(res?.message || 'Product updated successfully');
      router.push('/vendor-dashboard/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update product');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteProduct({ id: productId, showroomId }).unwrap();
      toast.success(res?.message || 'Product deleted successfully');
      setShowDeleteModal(false);
      router.push('/vendor-dashboard/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete product');
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-600/40 cursor-pointer flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">Edit Product</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 border border-red-500 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            Update
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-tr from-[#040113] via-[#0b0329] to-[#050116] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-6">Information</h2>

        {/* Product Name */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Type here"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
          />
        </div>

        {/* Product Description */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Product Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type here"
            rows={4}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 resize-none"
          />
        </div>

        {/* Price and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Type here"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
            >
              <option value="">Choose Category</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="footwear">Footwear</option>
            </select>
          </div>
        </div>

        {/* Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Weight Amount</label>
            <input
              type="number"
              value={weightAmount}
              onChange={(e) => setWeightAmount(e.target.value)}
              placeholder="e.g. 1.5"
              step="0.1"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Weight Unit</label>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Current Images</label>
            <div className="flex gap-4 flex-wrap">
              {existingImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                    <img src={`${baseUrl}/${image}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {newImagePreviews.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">New Images</label>
            <div className="flex gap-4 flex-wrap">
              {newImagePreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-purple-500/30">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Add More Images</label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-3 text-gray-400" size={40} />
              <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
              <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
            </label>
          </div>
        </div>

        {/* Available Sizes with Stock */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Available Sizes</label>
          <div className="flex flex-wrap gap-3 mb-4">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  productStocks.find((s) => s.size === size)
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-purple-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {productStocks.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productStocks.map((item) => (
                <div key={item.size}>
                  <label className="block text-xs text-gray-400 mb-1">Stock for {item.size}</label>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => updateStock(item.size, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Discount */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <label className="block text-sm text-gray-400">Product Discount (optional)</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
            {hasDiscount && <span className="text-xs text-purple-400">This product has a discount</span>}
          </div>

          {hasDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Enter discount percentage"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={discountStartDate}
                  onChange={(e) => setDiscountStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={discountEndDate}
                  onChange={(e) => setDiscountEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Different Options */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">Different Options</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mixDesign}
                onChange={(e) => setMixDesign(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 relative"></div>
              <span className="text-sm text-gray-300">Mix Design Available</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customDesign}
                onChange={(e) => setCustomDesign(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 relative"></div>
              <span className="text-sm text-gray-300">Custom Design Available</span>
            </label>
          </div>
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        title="Delete Product"
        itemName={productName}
        deleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
