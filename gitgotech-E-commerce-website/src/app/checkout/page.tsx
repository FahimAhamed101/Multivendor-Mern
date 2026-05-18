"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CheckoutPage = dynamic(
  () => import("@/components/CustomerDashboard/CheckOut"),
  {
    ssr: false,
  },
);

const page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutPage />
    </Suspense>
  );
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default page;
