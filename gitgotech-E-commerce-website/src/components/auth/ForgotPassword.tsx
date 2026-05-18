"use client";

import { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForgotPasswordMutation } from '@/redux/features/auth/authSlice';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [forgotPassword] = useForgotPasswordMutation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Reset errors
    setErrors('');

    // Validate email
    if (!email.trim()) {
      setErrors('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrors('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
      console.log(res);

      if (res?.success || res?.status === 200) {
        toast.success(res?.message || 'Reset link sent to your email!');
        const token = res?.token || res?.data?.token || '';
        setIsSubmitted(true);
        
        // Redirect to verify-email with token for OTP verification
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${email}&token=${token}&path=/auth/forgot-password`);
        }, 1500);
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Failed to send reset email';
      setErrors(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
    setErrors('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 py-8">
      {/* Forgot Password Card */}
      <div className="relative w-full max-w-lg">
        <div className="relative bg-gradient-to-t from-[#241F30] to-[#161617] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#8645a5] rounded-2xl p-4">
          {/* Logo */}
          <div className="flex items-start justify-between">
            <Image
              src="/images/logo.png"
              alt="TeeKnit Logo"
              width={100}
              height={100}
              className="object-contain item h-36 w-36"
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-cormorant font-bold text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm">
              Forgot your password? <br /> Enter your email to receive a secure reset link.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email"
                    className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      errors
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                  />
                </div>
                {errors && (
                  <div className="flex items-center gap-2 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {errors}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#6100FF] cursor-pointer text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30 ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm">
                  We've sent a password reset link to <span className="text-purple-400">{email}</span>.
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Reset Another Email
                </button>

                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full bg-transparent border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Back to Login Link */}
          {!isSubmitted && (
            <div className="text-center pt-4">
              <span className="text-gray-400 text-sm">Remembered your password? </span>
              <span
                onClick={() => window.location.href = '/auth/login'}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
              >
                Sign in
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
