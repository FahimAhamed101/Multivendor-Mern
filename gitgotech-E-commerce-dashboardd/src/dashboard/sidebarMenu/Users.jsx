import { useState, useMemo } from 'react';
import { 
  useGetUsersQuery, 
  useToggleBlockUserMutation 
} from '../../redux/features/allUserSlice/allUserRoleSlice';

const UsersPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const itemsPerPage = 10;

  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchText,
  });

  const users = usersData?.data?.data || [];
  const meta = usersData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const [toggleBlockUser] = useToggleBlockUserMutation();

  // ✅ Track block status locally per user id for instant UI update
  const [localBlockStatus, setLocalBlockStatus] = useState({});

  const displayedUsers = useMemo(() => {
    if (usersData?.data?.meta) return users;
    if (!searchText.trim()) return users;
    const term = searchText.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.location?.toLowerCase().includes(term)
    );
  }, [searchText, users, usersData]);

  // ✅ Toggle block status — updates locally + refetches
  const handleToggleBlock = async (userId, currentBlockStatus) => {
    try {
      await toggleBlockUser({
        id: userId,
        body: { block: !currentBlockStatus }
      }).unwrap();

      // Flip instantly in local state
      setLocalBlockStatus(prev => ({
        ...prev,
        [userId]: !currentBlockStatus
      }));

      // Also update modal if open
      setSelectedUser(prev =>
        prev ? { ...prev, blockStatus: !currentBlockStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Failed to update user status');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading users...</div>;
  }

  return (
    <div className="mx-auto text-white">
      {/* Header */}
      <div className="flex justify-between items-center py-2 px-2 rounded">
        <h1 className="text-2xl font-bold">All Users</h1>
        <input
          type="text"
          placeholder="Search by name, email..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          className="w-64 bg-purple-900/50 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800 mt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="p-4 w-12">#</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Join Date</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Block</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user, index) => {
                const userId = user._id || user.UserId;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                // ✅ Use local override if toggled, else use API value
                const isBlocked = localBlockStatus.hasOwnProperty(userId)
                  ? localBlockStatus[userId]
                  : user.blockStatus;

                return (
                  <tr key={userId} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">{serialNumber}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{userId?.slice(-8)}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-gray-400">
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs">
                        {user.location || 'N/A'}
                      </span>
                    </td>

                    {/* ✅ Status Badge */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        isBlocked
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {isBlocked ? '🔴 Blocked' : '🟢 Active'}
                      </span>
                    </td>

                    {/* ✅ Block/Unblock Toggle Button in table row */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(userId, isBlocked)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                          isBlocked
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isBlocked ? '✅ Unblock' : '🚫 Block'}
                      </button>
                    </td>

                    {/* View Details */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedUser({ ...user, blockStatus: isBlocked })}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex justify-center mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=7c3aed&color=fff&size=100`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-600/40"
              />
            </div>

            {/* User Info */}
            <div className="space-y-3 text-sm">
              <DetailRow
                label="User ID"
                value={selectedUser._id || selectedUser.UserId}
                mono
              />
              <DetailRow label="Name" value={selectedUser.name} />
              <DetailRow label="Email" value={selectedUser.email} />
              <DetailRow label="Username" value={selectedUser.username || 'N/A'} />
              <DetailRow label="Role" value={selectedUser.role || 'customer'} />
              <DetailRow
                label="Join Date"
                value={
                  selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : selectedUser.joinDate
                      ? new Date(selectedUser.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : 'N/A'
                }
              />
              <DetailRow
                label="Location"
                value={selectedUser.address || selectedUser.location || 'N/A'}
              />
              <DetailRow label="Phone" value={selectedUser.phone || 'N/A'} />

              {/* ✅ Current Status Badge */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedUser.blockStatus
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {selectedUser.blockStatus ? '🔴 Blocked' : '🟢 Active'}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>

              {/* ✅ Block/Unblock in modal — stays open after toggle */}
              <button
                onClick={() => {
                  const userId = selectedUser._id || selectedUser.UserId;
                  handleToggleBlock(userId, selectedUser.blockStatus);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${
                  selectedUser.blockStatus
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedUser.blockStatus ? '✅ Unblock User' : '🚫 Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable DetailRow component
const DetailRow = ({ label, value, mono = false, className = '' }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-800">
    <span className="text-gray-400">{label}</span>
    <span className={`font-medium ${mono ? 'font-mono text-xs text-gray-300' : ''} ${className}`}>
      {value}
    </span>
  </div>
);

export default UsersPage;