import ApplyForm from "@/components/landingPage/career/ApplyForm";
import { Suspense } from "react";

export default function ApplyJobPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Application Form */}
      <div className="pb-12">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          }
        >
          <ApplyForm />
        </Suspense>
      </div>
    </div>
  );
}
