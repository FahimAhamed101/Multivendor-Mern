import React, { useState } from 'react';
import bgimage from "./../../public/image/authbg.png"
import logo from "./../../public/image/logo.png"
import { useNavigate } from 'react-router-dom';
const SleeKnitVerifyOtp = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
 const navigate = useNavigate()
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('OTP verified successfully!');
      console.log('OTP:', otpValue);
      navigate("/updatepassword")
    }, 1000);
  };

  const handleResend = () => {
    alert('OTP resent to your email!');
    setOtp(['', '', '', '', '', '']);
    const firstInput = document.getElementById('otp-0');
    if (firstInput) firstInput.focus();
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

      {/* OTP Form Container */}
      <div className="relative z-10 w-full max-w-[600px] px-6">
        {/* Logo */}
        <div className="text-center flex items-center justify-center mb-4">
           <img src={logo} className='h-38 w-38' alt="" />
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0A09]/70 rounded-2xl shadow-2xl border border-purple-400/40 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Verify your email</h2>
            <p className="text-gray-400 text-sm">
              We've sent an email with an activation code to your
            </p>
            <p className="text-gray-400 text-sm">
              Email: <span className="text-purple-400">yourmail@gmail.com</span>
            </p>
          </div>

          <div className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 border border-[#912DAD] md:h-18 md:w-18 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              ))}
            </div>

            {/* Resend Code */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Didn't receive the code?</span>
              <button
                onClick={handleResend}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Resend
              </button>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
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
                'Verify OTP'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleeKnitVerifyOtp;