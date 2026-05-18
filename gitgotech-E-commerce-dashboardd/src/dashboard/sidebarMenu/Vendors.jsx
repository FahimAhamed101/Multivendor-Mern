import { useState, useMemo } from 'react';
import { 
  useGetVendorsQuery, 
  useToggleBlockVendorMutation,
  useMarkAsTopVendorMutation
} from '../../redux/features/allUserSlice/allUserRoleSlice';

const VendorPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const itemsPerPage = 10;

  const { data: vendorsData, isLoading, refetch } = useGetVendorsQuery({
    searchTerm: searchText,
    page: currentPage,
    limit: itemsPerPage,
  });

  const vendors = vendorsData?.data?.data || [];
  const meta = vendorsData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const [toggleBlockVendor] = useToggleBlockVendorMutation();
  const [markAsTopVendor] = useMarkAsTopVendorMutation();

  // ✅ Track block & topVendor status locally for instant UI update
  const [localBlockStatus, setLocalBlockStatus] = useState({});
  const [localTopVendorStatus, setLocalTopVendorStatus] = useState({});

  const displayedVendors = useMemo(() => {
    if (vendorsData?.data?.meta) return vendors;
    if (!searchText.trim()) return vendors;
    const term = searchText.toLowerCase();
    return vendors.filter(vendor =>
      vendor.name?.toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      vendor.shopName?.toLowerCase().includes(term) ||
      vendor.location?.toLowerCase().includes(term)
    );
  }, [searchText, vendors, vendorsData]);

  // ✅ Block/Unblock toggle
  const handleToggleBlock = async (vendorId, currentBlockStatus) => {
    try {
      await toggleBlockVendor({
        id: vendorId,
        body: { block: !currentBlockStatus }
      }).unwrap();

      setLocalBlockStatus(prev => ({
        ...prev,
        [vendorId]: !currentBlockStatus
      }));

      setSelectedVendor(prev =>
        prev ? { ...prev, blockStatus: !currentBlockStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Block toggle failed:', error);
      alert('Failed to update vendor status');
    }
  };

  // ✅ Top Vendor mark/unmark toggle
  const handleToggleTopVendor = async (vendorId, currentTopStatus) => {
    try {
      await markAsTopVendor({
        id: vendorId,
        body: { topVendor: !currentTopStatus }
      }).unwrap();

      setLocalTopVendorStatus(prev => ({
        ...prev,
        [vendorId]: !currentTopStatus
      }));

      setSelectedVendor(prev =>
        prev ? { ...prev, topVendor: !currentTopStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Top vendor toggle failed:', error);
      alert('Failed to update top vendor status');
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
    return <div className="p-8 text-center text-gray-400">Loading vendors...</div>;
  }

  return (
    <div className="mx-auto text-white">
      {/* Header */}
      <div className="flex justify-between items-center py-2 px-2 rounded">
        <h1 className="text-2xl font-bold">All Vendors</h1>
        <input
          type="text"
          placeholder="Search by name, shop, email..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          className="w-72 bg-purple-900/50 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Vendors Table */}
      <div className="bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800 mt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Vendor ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Location</th>
              <th className="p-4">Earning</th>
              <th className="p-4">Top Vendor</th>
              <th className="p-4">Status</th>
              <th className="p-4">Block</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedVendors.length > 0 ? (
              displayedVendors.map((vendor, index) => {
                const vendorId = vendor._id || vendor.vendor_id;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                // ✅ Use local override if toggled, else use API value
                const isBlocked = localBlockStatus.hasOwnProperty(vendorId)
                  ? localBlockStatus[vendorId]
                  : vendor.blockStatus;

                const isTopVendor = localTopVendorStatus.hasOwnProperty(vendorId)
                  ? localTopVendorStatus[vendorId]
                  : vendor.topVendor;

                return (
                  <tr key={vendorId} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">{serialNumber}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{vendorId?.slice(-8)}</td>
                    <td className="p-4 font-medium">{vendor.name}</td>
                    <td className="p-4 text-gray-400">{vendor.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs">
                        {vendor.location || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-yellow-400 font-medium">
                      {vendor.earning ?? 0} BDT
                    </td>

                    {/* ✅ Top Vendor Badge + Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleTopVendor(vendorId, isTopVendor)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 border ${
                          isTopVendor
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30'
                            : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        {isTopVendor ? '⭐ Top Vendor' : '☆ Mark Top'}
                      </button>
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

                    {/* ✅ Block/Unblock Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(vendorId, isBlocked)}
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
                        onClick={() => setSelectedVendor({ ...vendor, blockStatus: isBlocked, topVendor: isTopVendor })}
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
                  No vendors found
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

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Vendor Details</h2>
                {/* ✅ Top Vendor badge in modal header */}
                {selectedVendor.topVendor && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full text-xs font-semibold">
                    ⭐ Top Vendor
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Shop Logo / Avatar */}
            <div className="flex justify-center mb-6">
              <img
                src={
                  selectedVendor.shopLogo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVendor.name || 'Vendor')}&background=7c3aed&color=fff&size=100`
                }
                alt="Vendor"
                className="w-24 h-24 rounded-xl object-cover ring-4 ring-purple-600/40"
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVendor.name || 'Vendor')}&background=7c3aed&color=fff&size=100`;
                }}
              />
            </div>

            {/* Vendor Info */}
            <div className="space-y-1 text-sm">
              <DetailRow
                label="Vendor ID"
                value={selectedVendor._id || selectedVendor.vendor_id}
                mono
              />
              <DetailRow label="Name" value={selectedVendor.name} />
              <DetailRow label="Email" value={selectedVendor.email} />
              <DetailRow label="Phone" value={selectedVendor.phone || 'N/A'} />
              <DetailRow
                label="Location"
                value={selectedVendor.location || selectedVendor.address || 'N/A'}
              />
              <DetailRow
                label="Join Date"
                value={
                  selectedVendor.join_date || selectedVendor.createdAt
                    ? new Date(selectedVendor.join_date || selectedVendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : 'N/A'
                }
              />
              <DetailRow
                label="Earning"
                value={`${selectedVendor.earning ?? 0} BDT`}
                className="text-yellow-400"
              />

              {/* ✅ Top Vendor Status */}
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Top Vendor</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedVendor.topVendor
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-gray-700/50 text-gray-400 border-gray-600'
                }`}>
                  {selectedVendor.topVendor ? '⭐ Yes' : '☆ No'}
                </span>
              </div>

              {/* ✅ Block Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedVendor.blockStatus
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {selectedVendor.blockStatus ? '🔴 Blocked' : '🟢 Active'}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex flex-col gap-3">

              {/* ✅ Top Vendor Toggle Button */}
              <button
                onClick={() => {
                  const vendorId = selectedVendor._id || selectedVendor.vendor_id;
                  handleToggleTopVendor(vendorId, selectedVendor.topVendor);
                }}
                className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 border ${
                  selectedVendor.topVendor
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                }`}
              >
                {selectedVendor.topVendor ? '⭐ Remove Top Vendor' : '☆ Mark as Top Vendor'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>

                {/* ✅ Block/Unblock Toggle Button */}
                <button
                  onClick={() => {
                    const vendorId = selectedVendor._id || selectedVendor.vendor_id;
                    handleToggleBlock(vendorId, selectedVendor.blockStatus);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    selectedVendor.blockStatus
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {selectedVendor.blockStatus ? '✅ Unblock Vendor' : '🚫 Block Vendor'}
                </button>
              </div>
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

export default VendorPage;