import { useState, useMemo } from 'react';
import { 
  useGetDriversQuery, 
  useToggleBlockDriverMutation 
} from '../../redux/features/allUserSlice/allUserRoleSlice';

const DriversPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const itemsPerPage = 6;

  const { data: driversData, isLoading, refetch } = useGetDriversQuery({
    searchTerm: searchText,
    page: currentPage,
    limit: itemsPerPage,
  });

  const drivers = driversData?.data?.data || [];
  const meta = driversData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const [toggleBlockDriver] = useToggleBlockDriverMutation();

  // ✅ Track block status locally per driver id for instant UI update
  const [localBlockStatus, setLocalBlockStatus] = useState({});

  const displayedDrivers = useMemo(() => {
    if (driversData?.data?.meta) return drivers;
    if (!searchText.trim()) return drivers;
    const term = searchText.toLowerCase();
    return drivers.filter(driver =>
      driver.name?.toLowerCase().includes(term) ||
      driver.email?.toLowerCase().includes(term) ||
      driver.location?.toLowerCase().includes(term)
    );
  }, [searchText, drivers, driversData]);

  // ✅ Toggle in table row
  const handleToggleBlock = async (driverId, currentBlockStatus) => {
    try {
      await toggleBlockDriver({
        id: driverId,
        body: { block: !currentBlockStatus }
      }).unwrap();

      // Flip instantly in local state
      setLocalBlockStatus(prev => ({
        ...prev,
        [driverId]: !currentBlockStatus
      }));

      // Also update modal if open
      setSelectedDriver(prev =>
        prev ? { ...prev, blockStatus: !currentBlockStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Failed to update driver status');
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
    return <div className="p-8 text-center text-gray-400">Loading drivers...</div>;
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Drivers</h1>
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
      </div>

      {/* Drivers Table */}
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
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Block</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedDrivers.length > 0 ? (
              displayedDrivers.map((driver, index) => {
                const driverId = driver._id || driver.UserId;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                // ✅ Use local override if toggled, else use API value
                const isBlocked = localBlockStatus.hasOwnProperty(driverId)
                  ? localBlockStatus[driverId]
                  : driver.blockStatus;

                return (
                  <tr key={driverId} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">{serialNumber}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{driverId?.slice(-8)}</td>
                    <td className="p-4 font-medium">{driver.name}</td>
                    <td className="p-4 text-gray-400">{driver.email}</td>
                    <td className="p-4 text-gray-400">
                      {driver.joinDate
                        ? new Date(driver.joinDate).toLocaleDateString()
                        : driver.createdAt
                          ? new Date(driver.createdAt).toLocaleDateString()
                          : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium">
                        {driver.location || driver.address || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{driver.phone || 'N/A'}</td>

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
                        onClick={() => handleToggleBlock(driverId, isBlocked)}
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
                        onClick={() => setSelectedDriver({ ...driver, blockStatus: isBlocked })}
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
                <td colSpan="10" className="p-8 text-center text-gray-500">
                  No drivers found
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Driver Details</h2>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex justify-center mb-6">
              <img
                src={
                  selectedDriver.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name)}&background=3b82f6&color=fff&size=100`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-600/40"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name)}&background=3b82f6&color=fff&size=100`;
                }}
              />
            </div>

            {/* Driver Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Driver ID</span>
                <span className="font-mono text-xs text-gray-300">
                  {selectedDriver._id || selectedDriver.UserId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{selectedDriver.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Email</span>
                <span className="font-medium">{selectedDriver.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium">{selectedDriver.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Location</span>
                <span className="font-medium text-right max-w-[60%]">
                  {selectedDriver.location || selectedDriver.address || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Joined Date</span>
                <span className="font-medium">
                  {selectedDriver.joinDate
                    ? new Date(selectedDriver.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Total Deliveries</span>
                <span className="font-medium text-blue-400">
                  {selectedDriver.totalDeliveries || selectedDriver.deliveriesCount || 0}
                </span>
              </div>

              {/* Status in modal */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedDriver.blockStatus
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {selectedDriver.blockStatus ? '🔴 Blocked' : '🟢 Active'}
                </span>
              </div>
            </div>

            {/* Block/Unblock in modal */}
            <div className="mt-6">
              <button
                onClick={() => {
                  const driverId = selectedDriver._id || selectedDriver.UserId;
                  handleToggleBlock(driverId, selectedDriver.blockStatus);
                }}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
                  selectedDriver.blockStatus
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedDriver.blockStatus ? '✅ Unblock Driver' : '🚫 Block Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;