import { Suspense } from "react";
import ProductDetailsClient from "./ProductDetailsClient";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <ProductDetailsClient />
    </Suspense>
  );
};

export default page;
