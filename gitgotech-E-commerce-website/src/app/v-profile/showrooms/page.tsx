import VendorShowroomsList from "@/components/vendors/VendorShowroomsList";
import { Suspense } from "react";

export default function VendorShowrooms() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <VendorShowroomsList />
    </Suspense>
  );
}
