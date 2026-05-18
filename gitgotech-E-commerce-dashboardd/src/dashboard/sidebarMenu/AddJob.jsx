import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BackButton from '../../BackButton';
import { useCreateJobMutation } from '../../redux/features/careerSlice/careerSlice';

const AddJobPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    address: '',
    salary: '',
    jobType: 'onsite',
    description: '',
    applicationDeadline: '',
  });

  const [createJob, { isLoading }] = useCreateJobMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.country || !formData.salary || !formData.jobType || !formData.description || !formData.applicationDeadline) {
      Swal.fire('Error', 'Please fill in all required fields!', 'error');
      return;
    }

    const body = {
      title: formData.title,
      country: formData.country,
      address: formData.address,
      salary: formData.salary,
      jobType: formData.jobType,
      description: formData.description,
      applicationDeadline: formData.applicationDeadline,
    };

    try {
      await createJob(body).unwrap();
      Swal.fire('Success', 'Job created successfully!', 'success');
      navigate('/dashboard/careers');
    } catch (error) {
      Swal.fire('Error', error?.data?.message || 'Failed to create job!', 'error');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-black min-h-screen text-white">
      {/* Header */}
      <BackButton title={"Add Job"} />

      {/* Form Card */}
      <div className="relative p-6 bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        {/* Glow Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Country *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. Bangladesh"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Mohakhali, Dhaka"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Salary *</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. $120,000 - $160,000"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Job Type *</label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="onsite">On-Site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write job description..."
              rows="4"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Application Deadline *</label>
            <input
              type="datetime-local"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Creating...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJobPage;
