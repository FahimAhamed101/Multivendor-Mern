import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddManagerMutation } from '../../redux/features/allUserSlice/allUserRoleSlice';
import toast, { Toaster } from 'react-hot-toast';

const AddManagerPage = () => {
  const navigate = useNavigate();
  const [addManager, { isLoading }] = useAddManagerMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    referralCode: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // ✅ Send only the required fields — no confirmPassword
      await addManager({
        name: formData.name.trim(),
        email: formData.email.trim(),
        referralCode: formData.referralCode.trim(),
        password: formData.password,
      }).unwrap();

      toast.success('Manager added successfully!');

      setSuccessMsg('Manager added successfully!');
      setFormData({ name: '', email: '', referralCode: '', password: '', confirmPassword: '' });

      // Redirect after short delay
      setTimeout(() => navigate('/dashboard/managers'), 1500);
    } catch (error) {
      console.error('Add manager failed:', error);
      setErrorMsg(error?.data?.message || 'Failed to add manager. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-sm text-white font-bold">+</span>
        </div>
        <h1 className="text-xl font-bold">Add Manager</h1>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm">
          ✅ {successMsg}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
          ❌ {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <div className="relative p-6 bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        {/* Glow Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Referral Code <span className="text-gray-600 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Enter Referral Code"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter Password"
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/managers')}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddManagerPage;