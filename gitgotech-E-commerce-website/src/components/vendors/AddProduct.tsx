"use client";

import { useGetHomeCategoriesQuery } from "@/redux/features/home/homeSlice";
import { useAddProductMutation } from "@/redux/features/vendor/product/productSlice";
import { selectShowroomId } from "@/redux/features/vendor/showroomSlice/selectedShowroomSlice";
import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function AddProductPage() {
  const router = useRouter();
  const showroomId = useSelector(selectShowroomId);
  const [addProduct, { isLoading }] = useAddProductMutation();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [weightAmount, setWeightAmount] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [mixDesign, setMixDesign] = useState(false);
  const [customDesign, setCustomDesign] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Size & stock management
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "3X", "4X"];
  const [productStocks, setProductStocks] = useState<
    { size: string; stock: number }[]
  >([]);

  // Fetch categories from API
  const { data: categoryData, isLoading: categoriesLoading } =
    useGetHomeCategoriesQuery({});
  const categories = categoryData?.data || [];

  const toggleSize = (size: string) => {
    const exists = productStocks.find((s) => s.size === size);
    if (exists) {
      setProductStocks(productStocks.filter((s) => s.size !== size));
    } else {
      setProductStocks([...productStocks, { size, stock: 0 }]);
    }
  };

  const updateStock = (size: string, stock: number) => {
    setProductStocks(
      productStocks.map((s) => (s.size === size ? { ...s, stock } : s)),
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreviews((prev) => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    router.back();
  };

  const handleUpload = async () => {
    if (!productName || !price || !category) {
      toast.error("Please fill in product name, price, and category");
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
      isMixable: mixDesign,
      isCustom: customDesign,
    };

    if (hasDiscount) {
      productData.discount = {
        isValid: true,
        percentage: parseFloat(discountPercent) || 0,
        startDate: discountStartDate
          ? new Date(discountStartDate).toISOString()
          : "",
        endDate: discountEndDate ? new Date(discountEndDate).toISOString() : "",
      };
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(productData));
    imageFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await addProduct({ data: formData, showroomId }).unwrap();
      toast.success(res?.message || "Product added successfully");
      router.push("/vendor-dashboard/products");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="container mx-auto mt-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
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
            Add product
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Upload
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-tr from-[#040113] via-[#0b0329] to-[#050116] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/40 rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-6">Information</h2>

        {/* Product Name */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Product Name
          </label>
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
          <label className="block text-sm text-gray-400 mb-2">
            Product Description
          </label>
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
            <label className="block text-sm text-gray-400 mb-2">
              Price ($)
            </label>
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
              {categoriesLoading ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map((cat: any) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Weight Amount
            </label>
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
            <label className="block text-sm text-gray-400 mb-2">
              Weight Unit
            </label>
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

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Product Images
          </label>

          {/* Preview uploaded images */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-4 flex-wrap mb-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              <p className="text-gray-400 text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-gray-500 text-xs mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </label>
          </div>
        </div>

        {/* Available Sizes with Stock */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Available Sizes
          </label>
          <div className="flex flex-wrap gap-3 mb-4">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  productStocks.find((s) => s.size === size)
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-gray-900/50 border-gray-700 text-gray-400 hover:border-purple-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Stock inputs for selected sizes */}
          {productStocks.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productStocks.map((item) => (
                <div key={item.size}>
                  <label className="block text-xs text-gray-400 mb-1">
                    Stock for {item.size}
                  </label>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      updateStock(item.size, parseInt(e.target.value) || 0)
                    }
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
            <label className="block text-sm text-gray-400">
              Product Discount (optional)
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
            {hasDiscount && (
              <span className="text-xs text-purple-400">
                This product has a discount
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Enter discount percentage"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={discountStartDate}
                  onChange={(e) => setDiscountStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  End Date
                </label>
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
          <label className="block text-sm text-gray-400 mb-3">
            Different Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mixDesign}
                onChange={(e) => setMixDesign(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 relative"></div>
              <span className="text-sm text-gray-300">
                Mix Design Available
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customDesign}
                onChange={(e) => setCustomDesign(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 relative"></div>
              <span className="text-sm text-gray-300">
                Custom Design Available
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
