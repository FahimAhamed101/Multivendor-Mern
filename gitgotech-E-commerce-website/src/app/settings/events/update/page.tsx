import UpdateEvent from "@/components/CustomerDashboard/settings/UpdateEvent";
import { Suspense } from "react";

export default function UpdateEventPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UpdateEvent />
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
