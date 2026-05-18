import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetManagersQuery, 
  useToggleBlockManagerMutation 
} from '../../redux/features/allUserSlice/allUserRoleSlice';

const ManagersPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedManager, setSelectedManager] = useState(null);
  const itemsPerPage = 6;

  const { data: managersData, isLoading, refetch } = useGetManagersQuery({
    searchTerm: searchText,
    page: currentPage,
    limit: itemsPerPage,
  });

  const managers = managersData?.data?.data || [];
  const meta = managersData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const [toggleBlockManager] = useToggleBlockManagerMutation();

  // ✅ Track block status locally per manager id for instant UI update
  const [localBlockStatus, setLocalBlockStatus] = useState({});

  const displayedManagers = useMemo(() => {
    if (managersData?.data?.meta) return managers;
    if (!searchText.trim()) return managers;
    const term = searchText.toLowerCase();
    return managers.filter(m =>
      m.name?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.location?.toLowerCase().includes(term)
    );
  }, [searchText, managers, managersData]);

  // ✅ Toggle block status — updates locally + refetches
  const handleToggleBlock = async (managerId, currentBlockStatus) => {
    try {
      await toggleBlockManager({
        id: managerId,
        body: { block: !currentBlockStatus }
      }).unwrap();

      // Flip instantly in local state
      setLocalBlockStatus(prev => ({
        ...prev,
        [managerId]: !currentBlockStatus
      }));

      // Also update modal if open
      setSelectedManager(prev =>
        prev ? { ...prev, blockStatus: !currentBlockStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Failed to update manager status');
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
    return <div className="p-8 text-center text-gray-400">Loading managers...</div>;
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Managers</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 bg-purple-900/50 border border-purple-800 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => navigate('/dashboard/managers/add-manager')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          >
            + Add Manager
          </button>
        </div>
      </div>

      {/* Managers Table Card */}
      <div className="relative p-6 bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

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
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedManagers.length > 0 ? (
              displayedManagers.map((manager, index) => {
                const managerId = manager._id || manager.UserId || manager.id;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                // ✅ Use local override if toggled, else use API value
                const isBlocked = localBlockStatus.hasOwnProperty(managerId)
                  ? localBlockStatus[managerId]
                  : manager.blockStatus;

                return (
                  <tr key={managerId} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">{serialNumber}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">
                      {managerId?.slice(-8) || managerId}
                    </td>
                    <td className="p-4 font-medium">{manager.name}</td>
                    <td className="p-4 text-gray-400">{manager.email}</td>
                    <td className="p-4 text-gray-400">
                      {manager.joinDate
                        ? new Date(manager.joinDate).toLocaleDateString()
                        : manager.createdAt
                          ? new Date(manager.createdAt).toLocaleDateString()
                          : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium">
                        {manager.location || manager.address || 'N/A'}
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
                        onClick={() => handleToggleBlock(managerId, isBlocked)}
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
                        onClick={() => setSelectedManager({ ...manager, blockStatus: isBlocked })}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  No managers found
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {selectedManager && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedManager(null)}
        >
          <div
            className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manager Details</h2>
              <button
                onClick={() => setSelectedManager(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex justify-center mb-6">
              <img
                src={
                  selectedManager.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedManager.name)}&background=7c3aed&color=fff&size=100`
                }
                alt="Manager"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-600/40"
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedManager.name)}&background=7c3aed&color=fff&size=100`;
                }}
              />
            </div>

            {/* Manager Info */}
            <div className="space-y-3 text-sm">
              <DetailRow
                label="Manager ID"
                value={selectedManager._id || selectedManager.UserId || selectedManager.id}
                mono
              />
              <DetailRow label="Name" value={selectedManager.name} />
              <DetailRow label="Email" value={selectedManager.email} />
              <DetailRow label="Role" value={selectedManager.role || 'Manager'} />
              <DetailRow
                label="Join Date"
                value={
                  selectedManager.createdAt
                    ? new Date(selectedManager.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : selectedManager.joinDate
                      ? new Date(selectedManager.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : 'N/A'
                }
              />
              <DetailRow
                label="Location"
                value={selectedManager.location || selectedManager.address || 'N/A'}
              />
              <DetailRow label="Phone" value={selectedManager.phone || 'N/A'} />

              {/* ✅ Current Status Badge */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedManager.blockStatus
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {selectedManager.blockStatus ? '🔴 Blocked' : '🟢 Active'}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedManager(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>

              {/* ✅ Block/Unblock in modal — stays open after toggle */}
              <button
                onClick={() => {
                  const managerId = selectedManager._id || selectedManager.UserId || selectedManager.id;
                  handleToggleBlock(managerId, selectedManager.blockStatus);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${
                  selectedManager.blockStatus
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedManager.blockStatus ? '✅ Unblock Manager' : '🚫 Block Manager'}
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

export default ManagersPage;