"use client";
import NewArrivals from "@/components/landingPage/NewArrivals";
import { useFilterContext } from "@/context/FilterContext";
import { useGetNewestProductsQuery } from "@/redux/features/home/homeSlice";
import { useEffect, useState } from "react";

const page = () => {
  const { searchQuery } = useFilterContext();
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: newArrivalsData } = useGetNewestProductsQuery({
    searchTerm: searchQuery,
    product_category: selectedCategory || "",
  });

  useEffect(() => {
    console.log("New Arrivals Page - Category:", selectedCategory);
    console.log("New Arrivals Page - Search:", searchQuery);
    console.log("New Arrivals API Response:", newArrivalsData);
  }, [selectedCategory, searchQuery, newArrivalsData]);

  return (
    <div>
      <NewArrivals
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        products={newArrivalsData?.data?.data || []}
      />
    </div>
  );
};

export default page;
