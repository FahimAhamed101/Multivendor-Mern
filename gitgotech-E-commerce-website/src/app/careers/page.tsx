import CareerBanner from "@/components/landingPage/career/CareerBanner";
import Joblist from "@/components/landingPage/career/Joblist";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LoadingFallback />}>
        <CareerBanner />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Joblist />
      </Suspense>
    </div>
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
