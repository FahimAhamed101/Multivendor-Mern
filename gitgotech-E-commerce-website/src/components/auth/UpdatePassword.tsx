"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResetPasswordMutation } from '@/redux/features/auth/authSlice';
import toast from 'react-hot-toast';

export default function CreatePasswordPage() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  const [resetPassword] = useResetPasswordMutation();
  
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setToken(params.get('token') || '');
  }, []);

  // Password validation rules
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) return false;
    if (!/[a-zA-Z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate password meets requirements
      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters and include letters & numbers');
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
 const data = {  
          password  
        }
      // Call reset password API
      const res = await resetPassword({ 
        data,
        token 
      }).unwrap();

      console.log(res);

      if (res?.success || res?.status === 200) {
        toast.success(res?.message || 'Password reset successfully!');
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        throw new Error(res?.message || 'Failed to reset password');
      }

    } catch (err: any) {
      const message = err instanceof Error 
        ? err.message 
        : err?.data?.message || 'Failed to reset password. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Main Card */}
        <div className=" bg-gradient-to-t from-[#241F30] to-[#161617] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#856096] rounded-2xl p-8 relative overflow-hidden">
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-[36px] font-cormorant font-bold text-white text-center mb-4">Create new Password</h1>

            <p className="text-gray-400 font-poppins text-center mb-6">
              Password must be Min 8 characters, include letters & numbers
            </p>

            {/* Password Fields */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 012 10.5C2 6.911 4.714 4 8.333 4h7.334c3.619 0 6.333 2.911 6.333 6.5C22 14.089 19.286 17 15.667 17h-7.334c-1.38 0-2.75-.29-3.995-.825m5.008 0c7.569 0 13.76 6.19 13.76 13.75 0 7.569-6.191 13.76-13.76 13.76S2.25 21.319 2.25 13.75 8.441 0 16.01 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7M9.666 17h4.668M12 12v1.5M12 12l-1.5 1.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 012 10.5C2 6.911 4.714 4 8.333 4h7.334c3.619 0 6.333 2.911 6.333 6.5C22 14.089 19.286 17 15.667 17h-7.334c-1.38 0-2.75-.29-3.995-.825m5.008 0c7.569 0 13.76 6.19 13.76 13.75 0 7.569-6.191 13.76-13.76 13.76S2.25 21.319 2.25 13.75 8.441 0 16.01 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7M9.666 17h4.668M12 12v1.5M12 12l-1.5 1.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className={`w-full py-3 px-4 cursor-pointer font-poppins rounded-lg font-semibold transition-all duration-200 ${
                  isLoading || success
                    ? 'bg-[#6100FF] cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-[#6100FF] to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V6a6 6 0 616 6h2a8 8 0 11-16 0z"></path>
                    </svg>
                    Resetting...
                  </div>
                ) : success ? (
                  'Password Reset! Redirecting...'
                ) : (
                  'Submit'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                Password reset successfully! Redirecting to login...
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-300 underline"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
