import React, { useState } from 'react';
import { MailOutlined } from '@ant-design/icons';
import bgimage from "./../../public/image/authbg.png"
import logo from "./../../public/image/logo.png"
import { useNavigate } from 'react-router-dom';
const SleeKnitForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
 const navigate = useNavigate()
 
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please input your email!');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email!');
      return;
    }

    setLoading(true);
    // Simulate password reset request
    setTimeout(() => {
      setLoading(false);
      alert('Password reset link sent to your email!');
      console.log('Email:', email);
      navigate("/verifyotp")
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

      {/* Forgot Password Form Container */}
      <div className="relative z-10 w-full max-w-[600px] px-6">
        {/* Logo */}
        <div className="text-center flex items-center justify-center mb-4">
                 <img src={logo} className='h-32 w-32' alt="" />
                   
                </div>

        {/* Form Card */}
        <div className="bg-[#0A0A09]/80 backdrop-blur-[1px]   rounded-2xl shadow-2xl border border-purple-400/40 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-400 text-sm">Write your email to access your account.</p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white font-medium mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailOutlined className="!text-purple-400 text-lg" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter Your Email"
                  className="w-full h-12 pl-12 pr-4 bg-[#242428] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-white"
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
                'Continue'
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center">
              <a href="#" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleeKnitForgotPassword;