// app/verify-email/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResendOtpMutation, useVerifyOtpMutation } from '@/redux/features/auth/authSlice';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [path, setPath] = useState("");
  const [token, setToken] = useState("")
  const [verifyEmail] = useVerifyOtpMutation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setPath(params.get('path') || '');
    setToken(params.get('token') || '');

  }, []);




  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    // Validate OTP
    if (otp.some((digit) => digit === "")) {
      throw new Error("Please enter all 6 digits of the OTP");
    }

    const otpCode = otp.join("");

    const data = {
      otp: otpCode,
      email: email,
    };

    const res = await verifyEmail({ data, token }).unwrap();
    console.log(res);

    if (res?.success || res?.status === 200) {
      toast.success(res?.message || 'Email verified successfully!');
      setSuccess(true);

      // Get new token from response if available
      const newToken = res?.token || res?.data?.token || token;

      // Conditional redirect based on path
      setTimeout(() => {
        if (path === '/auth/sign-up' || path.includes('sign-up')) {
          // After signup, redirect to login
          router.push('/auth/login');
        } else {
          // For forgot password or other flows, redirect to update password
          router.push(`/auth/update-password?email=${email}&token=${newToken}`);
        }
      }, 2000);
    }
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.message ||
      "Verification failed. Please try again.";

    setError(message);
    toast.error(message);
    console.log(err);
  } finally {
    setIsLoading(false);
  }
};

  const handleResendOtp = async () => {
    if (!email?.trim()) {
      toast.error("Missing email. Open this page from the link in your email.");
      return;
    }
    try {
      const res = await resendOtp(email.trim()).unwrap();
      toast.success(
        (res as { message?: string })?.message ??
          "A new verification code has been sent to your email."
      );
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { message?: string })?.message ??
        "Could not resend the code. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Main Card */}
        <div className=" bg-gradient-to-t from-[#241F30] to-[#161617] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#856096] rounded-2xl p-8 relative overflow-hidden">
          
          
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-[36px] font-cormorant font-bold text-white text-center mb-4">Verify your email</h1>
            
            <p className="text-gray-400 text-center mb-6">
              We've sent an email with an activation code to your
            </p>
            
            <p className="text-center mb-8">
              <span className="text-gray-300">Email </span>
              <span className="text-purple-400 font-medium">{email}</span>
            </p>
            
            {/* OTP Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-semibold border border-[#912DAD] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    pattern="[0-9]"
                    inputMode="numeric"
                  />
                ))}
              </div>
              
              <button
                type="submit"
                disabled={isLoading || success}
                className={`w-full py-3 px-4 cursor-pointer rounded-lg font-semibold transition-all duration-200 ${
                  isLoading || success
                    ? 'bg-[#6100FF] cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V6a6 6 0 616 6h2a8 8 0 11-16 0z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : success ? (
                  'Verified! Redirecting...'
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="mt-6 space-y-3 text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || success || !email}
                  className="font-poppins text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed underline-offset-2 hover:underline"
                >
                  {isResending ? "Sending…" : "Resend verification code"}
                </button>
                <p className="font-poppins text-xs text-gray-500 leading-relaxed">
                  <span className="text-[#EF0000]">Note</span>: If you do not
                  receive the email in your inbox, check your spam or junk
                  folder.
                </p>
              </div>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                Email verified successfully! Redirecting to update password...
              </div>
            )}
          </div>
        </div>
        
        {/* Optional: Resend link */}
    
      </div>
    </div>
  );
}