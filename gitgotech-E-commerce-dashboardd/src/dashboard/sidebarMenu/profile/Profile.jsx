import { ArrowLeft, Edit3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetMyProfileQuery } from "../../../redux/features/settings/settingsSlice";
import url from "../../../redux/api/baseUrl";

// TODO: Replace with your actual API base URL
console.log(url);

const Profile = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading, isError } = useGetMyProfileQuery();

  // Safely extract user data
  const user = profileData?.data;
  console.log(profileData);

  const profileImageUrl = user?.image
    ? `${url}/${user.image}`
    : "https://via.placeholder.com/176/3b82f6/ffffff?text=Profile";

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-white bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isError || !profileData?.success) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-white bg-black min-h-screen flex items-center justify-center">
        <p className="text-red-400">
          Failed to load profile information. Please try again.
        </p>
      </div>
    );
  }

  // Handle profile image URL

  // Format last updated date
  const lastUpdated = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Today";

  return (
    <div className="p-6 max-w-6xl mx-auto text-white bg-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-xl bg-[#0f0c11] border border-gray-800 hover:bg-[#15121a] transition-colors">
            <Link to="/dashboard/settings">
              <ArrowLeft className="w-6 h-6 text-purple-400" />
            </Link>
          </button>
          <h1 className="text-2xl font-bold">Profile Information</h1>
        </div>

        <button
          onClick={() => navigate(`/dashboard/settings/editprofile`)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="relative rounded-xl overflow-hidden border border-gray-800">
        {/* Glow Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

        <div className="lg:flex">
          {/* Profile Section */}
          <div className="lg:w-1/3 bg-[#0f0c11] border-r border-gray-800 p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="rounded-full overflow-hidden h-40 w-40 mx-auto border-2 border-purple-600/30">
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center space-y-2">
                <div className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium capitalize">
                  {user?.role || "user"}
                </div>
                <h2 className="text-xl font-bold">
                  {user?.name || "Unknown User"}
                </h2>
                <div className="h-0.5 w-12 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:w-2/3 p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <div className="px-4 py-3 bg-[#15121a] rounded-lg font-medium">
                  {user?.name || "N/A"}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-[#15121a] rounded-lg font-medium break-all">
                  {user?.email || "N/A"}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Address
                </label>
                <div className="px-4 py-3 bg-[#15121a] rounded-lg font-medium">
                  {user?.address || "N/A"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center flex-wrap gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated}
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Profile Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
