import { Briefcase, ChevronLeft, ChevronRight, DollarSign, MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import baseUrl from '../../redux/api/baseUrl';
import { useDeleteJobMutation, useGetJobsQuery } from '../../redux/features/careerSlice/careerSlice';

const JobsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const jobsPerPage = 8;

  const { data: jobsData, isLoading, isError, refetch } = useGetJobsQuery({ searchTerm, page: currentPage, limit: jobsPerPage });
  const [deleteJob] = useDeleteJobMutation();

  const jobs = jobsData?.data || [];
  const meta = jobsData?.meta || {};
  const totalData = meta.total || 0;
  const totalPages = Math.ceil(totalData / jobsPerPage);

  const handleDelete = async (job) => {
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
        refetch();
      } catch (error) {
        Swal.fire('Error', error?.data?.message || 'Failed to delete job!', 'error');
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/40?text=U';
    if (image.startsWith('http')) return image;
    return `${baseUrl}/${image}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 6; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 5; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading jobs...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-10">Failed to load jobs.</div>;
  }

  return (
    <div className=" ">
      <div className=" ">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-cormorant font-bold text-white">All Jobs</h1>
          <button
            onClick={() => navigate("/dashboard/careers/create-job")}
            className="flex items-center cursor-pointer gap-2 bg-gradient-to-l from-[#B630F4] to-[#2ACCED] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full max-w-sm px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-xl"
              >
                {/* Job Title */}
                <h2 className="text-white font-cormorant text-[24px] font-semibold mb-4">
                  {job.title}
                </h2>

                {/* Job Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-6 h-6 text-white" />
                    <span className="text-sm">{job.address || job.country}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-6 h-6 text-white" />
                    <span className="text-sm">{job.salary}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-6 h-6 text-white" />
                    <span className="text-sm capitalize">{job.jobType}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/careers/job-details/${job._id}`)}
                    className="flex-1 bg-[#09090B] cursor-pointer hover:bg-white/5 text-white border border-gray-600 hover:border-gray-500 font-medium py-3 rounded-lg transition-all"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/careers/applied-people/${job._id}`)}
                    className="flex-1 bg-[#6100FF] cursor-pointer hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg"
                  >
                    Applied People
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(job)}
                  className="w-full mt-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">No jobs found</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === currentPage
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : page === '...'
                    ? 'bg-transparent text-gray-400 cursor-default'
                    : 'bg-transparent text-white border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
