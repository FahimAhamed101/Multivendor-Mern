import ReturnRequestForm from "@/components/CustomerDashboard/ReturnRequest";
import { Suspense } from "react";

export default function ReturnRequest() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReturnRequestForm />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
}
