import { useState, useMemo } from 'react';
import {
  useGetSupportTeamQuery,
  useToggleBlockSupportTeamMutation,
  useAddSupportTeamMutation,
} from '../../redux/features/supportTeam/supportTeamSlice';

const SupportTeamPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });
  const itemsPerPage = 10;

  const { data: teamData, isLoading, refetch } = useGetSupportTeamQuery({
    searchTerm: searchText,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [addSupportTeam, { isLoading: isAddingMember }] = useAddSupportTeamMutation();

  const teamMembers = teamData?.data?.data || [];
  const meta = teamData?.data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const [toggleBlockSupportTeam] = useToggleBlockSupportTeamMutation();

  // ✅ Track block status locally for instant UI update
  const [localBlockStatus, setLocalBlockStatus] = useState({});

  const displayedMembers = useMemo(() => {
    if (teamData?.data?.meta) return teamMembers;
    if (!searchText.trim()) return teamMembers;
    const term = searchText.toLowerCase();
    return teamMembers.filter(member =>
      member.name?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.username?.toLowerCase().includes(term)
    );
  }, [searchText, teamMembers, teamData]);

  // ✅ Block/Unblock toggle
  const resetAddForm = () => {
    setAddForm({ name: '', email: '', password: '' });
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    const name = addForm.name.trim();
    const email = addForm.email.trim();
    const password = addForm.password;
    if (!name || !email || !password) {
      alert('Please fill in name, email, and password.');
      return;
    }
    try {
      await addSupportTeam({ name, email, password }).unwrap();
      setShowAddModal(false);
      resetAddForm();
      setCurrentPage(1);
      refetch();
    } catch (error) {
      const msg = error?.data?.message || error?.message || 'Failed to add support team member';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleToggleBlock = async (memberId, currentBlockStatus) => {
    try {
      await toggleBlockSupportTeam({
        id: memberId,
        body: { block: !currentBlockStatus }
      }).unwrap();

      setLocalBlockStatus(prev => ({
        ...prev,
        [memberId]: !currentBlockStatus
      }));

      setSelectedMember(prev =>
        prev ? { ...prev, blockStatus: !currentBlockStatus } : null
      );

      refetch();
    } catch (error) {
      console.error('Block toggle failed:', error);
      alert('Failed to update support team member status');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading support team...</div>;
  }

  return (
    <div className="mx-auto text-white">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 py-2 px-2 rounded">
        <h1 className="text-2xl font-bold">Support Team</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetAddForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-sm font-semibold shadow-lg shadow-purple-500/20 transition-colors whitespace-nowrap"
          >
            Add team member
          </button>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="w-72 min-w-[200px] bg-purple-900/50 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800 mt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Member ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Block</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedMembers.length > 0 ? (
              displayedMembers.map((member, index) => {
                const memberId = member._id;
                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

                // ✅ Use local override if toggled, else use API value
                const isBlocked = localBlockStatus.hasOwnProperty(memberId)
                  ? localBlockStatus[memberId]
                  : member.blockStatus;

                return (
                  <tr key={memberId} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">{serialNumber}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{memberId?.slice(-8)}</td>
                    <td className="p-4 font-medium">{member.name}</td>
                    <td className="p-4 text-gray-400">{member.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs capitalize">
                        {member.role || 'support'}
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

                    {/* ✅ Block/Unblock Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBlock(memberId, isBlocked)}
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
                        onClick={() => setSelectedMember({ ...member, blockStatus: isBlocked })}
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
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No support team members found
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

      {/* Add team member modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add support team member</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label htmlFor="add-member-name" className="block text-sm text-gray-400 mb-1">
                  Name
                </label>
                <input
                  id="add-member-name"
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-purple-900/30 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Jaber Support"
                  autoComplete="name"
                  disabled={isAddingMember}
                />
              </div>
              <div>
                <label htmlFor="add-member-email" className="block text-sm text-gray-400 mb-1">
                  Email
                </label>
                <input
                  id="add-member-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-purple-900/30 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="jaberriyansupport@gmail.com"
                  autoComplete="email"
                  disabled={isAddingMember}
                />
              </div>
              <div>
                <label htmlFor="add-member-password" className="block text-sm text-gray-400 mb-1">
                  Password
                </label>
                <input
                  id="add-member-password"
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-purple-900/30 border border-purple-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isAddingMember}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={isAddingMember}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingMember ? 'Adding…' : 'Add member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Support Team Member</h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center ring-4 ring-purple-600/40">
                <span className="text-3xl font-bold text-white">
                  {selectedMember.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
            </div>

            {/* Member Info */}
            <div className="space-y-1 text-sm">
              <DetailRow
                label="Member ID"
                value={selectedMember._id}
                mono
              />
              <DetailRow label="Name" value={selectedMember.name} />
              <DetailRow label="Username" value={selectedMember.username || 'N/A'} />
              <DetailRow label="Email" value={selectedMember.email} />
              <DetailRow
                label="Role"
                value={selectedMember.role || 'support'}
                className="capitalize"
              />
              <DetailRow
                label="Join Date"
                value={formatDate(selectedMember.createdAt)}
              />

              {/* ✅ Block Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedMember.blockStatus
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {selectedMember.blockStatus ? '🔴 Blocked' : '🟢 Active'}
                </span>
              </div>

              {/* ✅ Verification Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Verification</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedMember.isVerified
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {selectedMember.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>

                {/* ✅ Block/Unblock Toggle Button */}
                <button
                  onClick={() => {
                    const memberId = selectedMember._id;
                    handleToggleBlock(memberId, selectedMember.blockStatus);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    selectedMember.blockStatus
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {selectedMember.blockStatus ? '✅ Unblock Member' : '🚫 Block Member'}
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

export default SupportTeamPage;
