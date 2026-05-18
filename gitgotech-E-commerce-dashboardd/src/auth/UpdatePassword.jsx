import React, { useState } from 'react';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import bgimage from "./../../public/image/authbg.png"
import logo from "./../../public/image/logo.png"
import { useNavigate } from 'react-router-dom';

const SleeKnitCreatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
const navigate = useNavigate()
  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Please enter a password!';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters!';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password!';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Password created successfully!');
      console.log('New password set');
      navigate("/")
    }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgimage})`,
          
        }}
      />

      {/* Create Password Form Container */}
      <div className="relative z-10 w-full max-w-[600px] px-6">
        {/* Logo */}
        <div className="text-center flex items-center justify-center mb-4">
           <img src={logo} className='h-32 w-32' alt="" />
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0A09]/70  rounded-2xl shadow-2xl border border-purple-400/40 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Create new Password</h2>
            <p className="text-gray-400 text-sm">Set a secure password to access your account.</p>
          </div>

          <div className="space-y-6">
            {/* Create Password Field */}
            <div>
              <label className="block text-white font-medium mb-2">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="!text-purple-400 text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({...errors, password: ''});
                    }
                  }}
                  placeholder="• • • • • • • •"
                  className="w-full h-12 pl-12 pr-12 bg-[#242428] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOutlined className="!text-gray-400 text-lg hover:text-gray-300" />
                  ) : (
                    <EyeInvisibleOutlined className="!text-gray-400 text-lg hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-white font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="!text-purple-400 text-lg" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({...errors, confirmPassword: ''});
                    }
                  }}
                  placeholder="• • • • • • • •"
                  className="w-full h-12 pl-12 pr-12 bg-[#242428] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOutlined className="!text-gray-400 text-lg hover:text-gray-300" />
                  ) : (
                    <EyeInvisibleOutlined className="!text-gray-400 text-lg hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-white mt-4"
              style={{
                background: '#6100FF',
                border: 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleeKnitCreatePassword;