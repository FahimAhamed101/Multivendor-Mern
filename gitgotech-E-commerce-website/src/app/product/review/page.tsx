import ReviewsPage from "@/components/landingPage/ProductReview";
import React, { Suspense } from "react";

function ReviewFallback() {
  return (
    <div className="min-h-screen mt-24 flex items-center justify-center bg-black text-gray-400">
      <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ProductReviewPage() {
  return (
    <div>
      <Suspense fallback={<ReviewFallback />}>
        <ReviewsPage />
      </Suspense>
    </div>
  );
}
