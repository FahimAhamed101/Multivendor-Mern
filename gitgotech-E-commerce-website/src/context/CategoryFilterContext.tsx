"use client";

import { useGetHomeCategoriesQuery } from "@/redux/features/home/homeSlice";
import { createContext, ReactNode, useContext, useState } from "react";

interface Category {
  _id: string;
  category_name: string;
  category_slug: string;
}

interface CategoryFilterContextType {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  isLoading: boolean;
}

const CategoryFilterContext = createContext<
  CategoryFilterContextType | undefined
>(undefined);

export function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: categoriesData, isLoading } = useGetHomeCategoriesQuery({});

  // Extract categories from API response
  const categories: Category[] = categoriesData?.data || [];

  return (
    <CategoryFilterContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        categories,
        isLoading,
      }}
    >
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryFilter must be used within a CategoryFilterProvider",
    );
  }
  return context;
}
