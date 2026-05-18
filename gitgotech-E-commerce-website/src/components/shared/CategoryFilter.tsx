"use client";

import { useCategoryFilter } from '@/context/CategoryFilterContext';
import { Filter } from 'lucide-react';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory, categories, isLoading } = useCategoryFilter();

  return (
    <div className="flex items-center gap-3">
      <Filter className="w-5 h-5 text-gray-400" />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        disabled={isLoading}
        className="bg-[#1B1B1F] backdrop-blur-sm border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-500 transition-colors disabled:opacity-50"
      >
        <option value="">All Categories</option>
        {isLoading ? (
          <option disabled>Loading categories...</option>
        ) : (
          categories.map((category) => (
            <option key={category._id} value={category.category_slug}>
              {category.category_name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
