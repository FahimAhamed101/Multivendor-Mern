import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import baseUrl from '../../redux/api/baseUrl';
import { useGetRequestedDriversQuery, useGetRequestedVendorsQuery, useRequestedAcceptMutation, useRequestedDeclineMutation } from '../../redux/features/allUserSlice/allUserRoleSlice';

const RequestsPage = () => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { data: vendorsData, isLoading: vendorsLoading, refetch: refetchVendors } = useGetRequestedVendorsQuery({ page: 1, limit: 100 });
  const { data: driversData, isLoading: driversLoading, refetch: refetchDrivers } = useGetRequestedDriversQuery({ page: 1, limit: 100 });

  const [acceptRequest, { isLoading: isAccepting }] = useRequestedAcceptMutation();
  const [declineRequest, { isLoading: isDeclining }] = useRequestedDeclineMutation();

  const vendorRequests = vendorsData?.data || [];
  console.log(vendorRequests)
  const driverRequests = driversData?.data || [];

  const allRequests = useMemo(() => {
    const vendors = vendorRequests.map((r) => ({ ...r, role: 'vendor' }));
    const drivers = driverRequests.map((r) => ({ ...r, role: 'driver' }));
    return [...vendors, ...drivers];
  }, [vendorRequests, driverRequests]);

  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    if (filter === 'vendor') {
      filtered = filtered.filter((r) => r.role === 'vendor');
    } else if (filter === 'driver') {
      filtered = filtered.filter((r) => r.role === 'driver');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(term) ||
          r.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allRequests, filter, searchTerm]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAccept = async (id) => {
    console.log(id)
    const result = await Swal.fire({
      title: 'Approve Request?',
      text: 'This will approve the registration request.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await acceptRequest(id).unwrap();
        Swal.fire('Success', 'Request approved successfully!', 'success');
      } catch (error) {
        Swal.fire('Error', error?.data?.message || 'Failed to approve request!', 'error');
      }
    }
  };

  const handleDeclineClick = (request) => {
    setSelectedRequest(request);
    setShowDeclineModal(true);
    setDeclineReason('');
  };

  const handleSubmitDecline = async () => {
    if (!declineReason.trim()) {
      Swal.fire('Error', 'Please write a reason for declining.', 'error');
      return;
    }

    try {
      await declineRequest({ id: selectedRequest._id, reason: declineReason }).unwrap();
      Swal.fire('Declined', 'Request has been declined.', 'success');
      setShowDeclineModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Failed to decline request!', 'error');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/80?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${baseUrl}/${image}`;
  };

  const isLoading = vendorsLoading || driversLoading;

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading requests...</div>;
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Requests</h1>
        <p className="text-gray-400">Manage registration requests from drivers and vendors</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilter('driver'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'driver'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Driver
          </button>
          <button
            onClick={() => { setFilter('vendor'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'vendor'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Vendor
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((req, index) => (
                <tr key={req._id} className="border-b border-gray-800 hover:bg-[#15121a]">
                  <td className="p-4 text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="p-4 font-medium">{req.name}</td>
                  <td className="p-4 text-gray-400">{req.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.role === 'driver'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-emerald-900/50 text-emerald-300'
                      }`}
                    >
                      {req.role === 'driver' ? 'Driver' : 'Vendor'}
                    </span>
                  </td>
                  <td className="p-4">
                    {req.isRequest === 'approve' ? (
                      <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-xs font-medium">
                        Approved
                      </span>
                    ) : req.isRequest === 'deny' ? (
                      <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-xs font-medium">
                        Declined
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {req.isRequest === 'send' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(req)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAccept(req._id)}
                          disabled={isAccepting}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                        >
                          {isAccepting ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeclineClick(req)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No requests found
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
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRequest && !showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedRequest.role === 'driver' ? "Driver" : "Vendor"}'s Application
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Image */}
            {selectedRequest.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={getImageUrl(selectedRequest.image)}
                  alt={selectedRequest.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Name:</span>
                <span className="font-medium">{selectedRequest.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium">{selectedRequest.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium">{selectedRequest.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Address:</span>
                <span className="font-medium">{selectedRequest.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Role:</span>
                <span className="font-medium capitalize">{selectedRequest.role}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Verified:</span>
                <span className="font-medium">{selectedRequest.isVerified ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Request Date:</span>
                <span className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Driver Documents */}
            {selectedRequest.role === 'driver' && selectedRequest.documents && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequest.documents.isNationalIdUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">National ID (Front)</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isNationalIdUpload.front)}
                        alt="NID Front"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=NID+Front'; }}
                      />
                    </div>
                  )}
                  {selectedRequest.documents.isNationalIdUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">National ID (Back)</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isNationalIdUpload.back)}
                        alt="NID Back"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=NID+Back'; }}
                      />
                    </div>
                  )}
                  {selectedRequest.documents.isDrivingLicenseUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Driving License (Front)</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isDrivingLicenseUpload.front)}
                        alt="License Front"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=License+Front'; }}
                      />
                    </div>
                  )}
                  {selectedRequest.documents.isDrivingLicenseUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Driving License (Back)</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isDrivingLicenseUpload.back)}
                        alt="License Back"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=License+Back'; }}
                      />
                    </div>
                  )}
                  {selectedRequest.documents.isInsuranceUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Insurance</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isInsuranceUpload.file)}
                        alt="Insurance"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Insurance'; }}
                      />
                    </div>
                  )}
                  {selectedRequest.documents.isSelfieUpload && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Selfie</p>
                      <img
                        src={getImageUrl(selectedRequest.documents.isSelfieUpload)}
                        alt="Selfie"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Selfie'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedRequest.isRequest === 'send' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { closeModal(); handleAccept(selectedRequest._id); }}
                  disabled={isAccepting}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {isAccepting ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => { closeModal(); handleDeclineClick(selectedRequest); }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Decline Request</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-purple-400 mb-4">
              Give a reason why you want to decline this {selectedRequest?.role}.
            </p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Write your reason here..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              onClick={handleSubmitDecline}
              disabled={isDeclining}
              className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isDeclining ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
