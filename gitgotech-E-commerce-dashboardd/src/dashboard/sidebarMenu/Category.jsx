import React, { useState } from 'react';
import { Plus, X, Upload, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useAddCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation } from '../../redux/features/category/categorySlice';
import Swal from 'sweetalert2';

const CategoriesPage = () => {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryName, setCategoryName] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const categoriesPerPage = 12;

  const { data: categoriesData, isLoading, isError, refetch } = useGetCategoriesQuery({ page: currentPage, limit: categoriesPerPage });

  const categories = categoriesData?.data || [];
  const totalData = categoriesData?.pagination?.totalData || 0;
  const totalPages = Math.ceil(totalData / categoriesPerPage);

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading categories...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-10">Failed to load categories.</div>;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  const openAddModal = () => {
    setCategoryName('');
    setUploadedImage(null);
    setImageFile(null);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setCategoryName(category.name);
    setUploadedImage(category.image);
    setImageFile(null);
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName) {
      Swal.fire('Error', 'Please enter a category name!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify({ name: categoryName }));
    if (imageFile) {
      formData.append('file', imageFile);
    }

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, formData }).unwrap();
        Swal.fire('Success', 'Category updated successfully!', 'success');
      } else {
        await addCategory(formData).unwrap();
        Swal.fire('Success', 'Category added successfully!', 'success');
      }
      setCategoryName('');
      setUploadedImage(null);
      setImageFile(null);
      setEditingCategory(null);
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Something went wrong!', 'error');
    }
  };

  const handleDelete = async (category) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${category.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(category._id).unwrap();
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        refetch();
      } catch (error) {
        Swal.fire('Error', error?.data?.message || 'Failed to delete category!', 'error');
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 8;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="overflow-hidden p-6 text-white">
      <div className=" ">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Categories
          </button>
        </div>

        {/* Categories Grid */}
        <div className=" shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex flex-col items-center gap-2 group relative"
              >
                {/* Edit/Delete Actions */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => openEditModal(category)}
                    className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-all">
                  <img
                    src={`${IMAGE_URL}/${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                  />
                </div>
                <span className="text-white text-sm font-medium text-center">
                  {category.name}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 border-t border-cyan-500/20">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
                      : 'bg-transparent text-white border border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-[#2d2433] to-[#1f1b24] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  {editingCategory ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h2 className="text-xl font-bold text-white">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Name Input */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter Category Name"
                className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Images
              </label>
              <div className="flex gap-3">
                {/* Uploaded Image Preview */}
                {uploadedImage && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-purple-500/50">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <label className="w-24 h-24 border-2 border-dashed border-purple-500/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-purple-500/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-purple-400 mb-1" />
                  <span className="text-purple-400 text-xs">Upload</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isAdding || isUpdating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
            >
              {isAdding || isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;