'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedCategory: string | null;
  searchQuery: string;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <FilterContext.Provider
      value={{
        selectedCategory,
        searchQuery,
        setSelectedCategory,
        setSearchQuery,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
