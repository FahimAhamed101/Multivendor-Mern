"use client";
import { useGetPrivacyQuery } from "@/redux/features/settings/settingsSlice";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { data: privacyData, isLoading } = useGetPrivacyQuery({});

  const privacyInfo = privacyData?.data;

  return (
    <div className="min-h-screen md:mt-24 mt-12 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="container   mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">
            Privacy Policy
          </h1>
        </div>

        {/* Last Updated */}
        {privacyInfo?.updatedAt && (
          <div className="my-6">
            <p className="text-sm text-gray-400">
              Last Updated:{" "}
              {new Date(privacyInfo.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-gradient-to-br from-gray-800/40 to-purple-900/20 border-2 border-blue-500/50 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">
                Loading privacy policy...
              </span>
            </div>
          ) : (
            <div className="space-y-6 text-sm text-gray-400 leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-gray-300 whitespace-pre-wrap">
                {privacyInfo?.description ||
                  "No privacy policy content available."}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
            I Accept Privacy Policy
          </button>
          <button className="w-full py-4 border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
            Download PDF
          </button>
        </div> */}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}
