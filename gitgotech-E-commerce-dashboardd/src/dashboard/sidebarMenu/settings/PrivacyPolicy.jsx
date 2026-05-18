import { Loader2 } from "lucide-react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useGetPrivacyQuery } from "../../../redux/features/settings/settingsSlice";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { data: privacyData, isLoading, isError, refetch } = useGetPrivacyQuery();
  
  const content = privacyData?.data?.value || "";
  const lastUpdated = privacyData?.data?.updatedAt || privacyData?.data?.createdAt;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="text-white bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/dashboard/settings"
          className="p-2 rounded-lg bg-[#0f0c11] border border-gray-800 hover:bg-[#15121a] transition-colors"
        >
          <FaCircleArrowLeft className="text-purple-400 w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading privacy policy...</span>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load privacy policy</p>
            <button
              onClick={refetch}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Content Card */}
      {!isLoading && !isError && (
        <div className="relative rounded-xl overflow-hidden border border-gray-800 mb-8">
          {/* Glow Border */}
          <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

          <div className="p-6 bg-[#0f0c11]">
            {content ? (
              <div
                className="prose prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">No privacy policy content available.</p>
            )}
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      {!isLoading && !isError && lastUpdated && (
        <p className="text-gray-500 text-sm mb-4">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}

      {/* Edit Button */}
      {!isLoading && !isError && (
        <div className="text-right">
          <button
            onClick={() => navigate(`/dashboard/settings/editprivacypolicy`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;