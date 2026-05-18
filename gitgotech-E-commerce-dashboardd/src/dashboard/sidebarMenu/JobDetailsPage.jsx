import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BackHeader from '../../BackButton';
import { useGetJobsQuery, useUpdateJobMutation, useDeleteJobMutation } from '../../redux/features/careerSlice/careerSlice';
import Swal from 'sweetalert2';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: jobsData, isLoading, isError } = useGetJobsQuery({ page: 1, limit: 100 });
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

  const jobs = jobsData?.data || [];
  const job = jobs.find((j) => j._id === id);

  if (isLoading) {
    return <div className="p-6 text-white text-center">Loading job details...</div>;
  }

  if (isError || !job) {
    return <div className="p-6 text-red-500 text-center">Job not found.</div>;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Job?',
      text: `Are you sure you want to delete "${job.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteJob(job._id).unwrap();
        Swal.fire('Deleted!', 'Job has been deleted.', 'success');
        navigate('/dashboard/careers');
      } catch (error) {
        Swal.fire('Error', error?.data?.message || 'Failed to delete job!', 'error');
      }
    }
  };

  const handleEditSave = async () => {
    try {
      await updateJob({ id: job._id, body: editData }).unwrap();
      Swal.fire('Success', 'Job updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Failed to update job!', 'error');
    }
  };

  const startEdit = () => {
    setEditData({
      title: job.title,
      country: job.country,
      address: job.address,
      salary: job.salary,
      jobType: job.jobType,
      description: job.description,
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('.')[0] : '',
    });
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <BackHeader title={"Job Details"} />
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={startEdit}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Job Detail Card */}
      <div className="relative p-6 bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        {/* Glow Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

        <div className="space-y-6">
          {/* Job Title */}
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full text-2xl font-bold bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-bold">{job.title}</h2>
          )}

          {/* Location & Type */}
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.244-4.244a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none"
                />
              ) : (
                <span>{job.address || job.country}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 002-2H9M9 5H7M7 5a2 2 0 00-2 2v6m6-6a2 2 0 00-2 2v6m6-6a2 2 0 00-2 2v6m6-6V5a2 2 0 00-2-2h-2" />
              </svg>
              {isEditing ? (
                <select
                  value={editData.jobType}
                  onChange={(e) => setEditData({ ...editData, jobType: e.target.value })}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none"
                >
                  <option value="onsite">On-Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              ) : (
                <span className="capitalize">{job.jobType}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="4"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{job.description}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Salary</h3>
            {isEditing ? (
              <input
                type="text"
                value={editData.salary}
                onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-green-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-green-400 font-medium">{job.salary}</p>
            )}
          </div>

          {/* Application Deadline */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Application Deadline</h3>
            {isEditing ? (
              <input
                type="datetime-local"
                value={editData.applicationDeadline}
                onChange={(e) => setEditData({ ...editData, applicationDeadline: e.target.value })}
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-400">{formatDate(job.applicationDeadline)}</p>
            )}
          </div>

          {/* Created At */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Created At</h3>
            <p className="text-gray-400">{formatDate(job.createdAt)}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
              job.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {job.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
