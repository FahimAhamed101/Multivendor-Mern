import MessagingPage from "@/components/landingPage/Messaging";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MessagingPage />
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
