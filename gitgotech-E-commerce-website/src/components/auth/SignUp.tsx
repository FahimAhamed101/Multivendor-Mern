// "use client";

// import { useState } from 'react';
// import { User, Lock, Mail, Eye, EyeOff, UserCircle } from 'lucide-react';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function SignUpPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
//   const [agreeTerms, setAgreeTerms] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });

//   const handleSubmit = () => {
//     if (!agreeTerms) {
//       alert('Please agree to the terms and privacy policy');
//       return;
//     }
//     console.log('Sign Up:', { ...formData, userType });
//   };

//   return (
//     <div className="min-h-screen mt-20 bg-black flex items-center justify-center p-4 py-8">
//       {/* Animated gradient orbs */}
//       <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
//       <div className="absolute top-10 right-24 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

//       {/* Sign Up Card */}
//       <div className="relative w-full max-w-lg">
//         {/* Cyan border glow */}
//         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl blur-sm"></div>

//         <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-cyan-500/30 p-8 shadow-2xl">
//           {/* Logo and badges */}
//           <div className="flex items-start justify-between mb-6">
//             <div className="relative w-16 h-16">
//               <Image
//                 src="/images/logo.png"
//                 alt="TeeKnit Logo"
//                 fill
//                 className="object-contain"
//               />
//             </div>

//             <div className="flex gap-2">
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/50">
//                 G
//               </div>
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/50">
//                 M
//               </div>
//             </div>
//           </div>

//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-white mb-1">
//               Create an account
//             </h1>
//             <p className="text-gray-400 text-sm">Create your account and get started</p>
//           </div>

//           {/* User Type Selection */}
//           <div className="mb-6">
//             <label className="block text-white text-sm font-medium mb-3">I am a</label>
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => setUserType('customer')}
//                 className={`py-3 px-4 rounded-xl font-medium transition-all ${
//                   userType === 'customer'
//                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
//                     : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
//                 }`}
//               >
//                 Customer
//               </button>
//               <button
//                 onClick={() => setUserType('vendor')}
//                 className={`py-3 px-4 rounded-xl font-medium transition-all ${
//                   userType === 'vendor'
//                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
//                     : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
//                 }`}
//               >
//                 Vendor
//               </button>
//             </div>
//             {userType === 'vendor' && (
//               <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
//                 <p className="text-yellow-400 text-xs">
//                   Note: Vendor accounts require admin approval. You'll receive an email once your application is reviewed.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Form Fields */}
//           <div className="space-y-4">
//             {/* Name */}
//             <div>
//               <label className="block text-white text-sm font-medium mb-2">Name</label>
//               <div className="relative">
//                 <UserCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   placeholder="Enter Your Name"
//                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Username */}
//             <div>
//               <label className="block text-white text-sm font-medium mb-2">User name</label>
//               <div className="relative">
//                 <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                 <input
//                   type="text"
//                   value={formData.username}
//                   onChange={(e) => setFormData({...formData, username: e.target.value})}
//                   placeholder="Enter a Unique User Name"
//                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-white text-sm font-medium mb-2">Email Address</label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   placeholder="Enter Your Email"
//                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Create Password */}
//             <div>
//               <label className="block text-white text-sm font-medium mb-2">Create Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   placeholder="• • • • • • • • •"
//                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                 <input
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={formData.confirmPassword}
//                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//                   placeholder="• • • • • • • • •"
//                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
//                 >
//                   {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Terms Checkbox */}
//             <div className="flex items-start gap-3 pt-2">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={agreeTerms}
//                 onChange={(e) => setAgreeTerms(e.target.checked)}
//                 className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800/50 text-purple-600 focus:ring-purple-500 focus:ring-2"
//               />
//               <label htmlFor="terms" className="text-sm text-gray-400">
//                 I agree to TeeKnit's{' '}
//                 <Link href="/terms" className="text-purple-400 hover:text-purple-300">
//                   Terms of Use
//                 </Link>
//                 {' '}and{' '}
//                 <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
//                   Privacy Policy
//                 </Link>
//               </label>
//             </div>

//             {/* Sign Up Button */}
//             <button
//               onClick={handleSubmit}
//               className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30 mt-2"
//             >
//               Sign Up
//             </button>

//             {/* Sign In Link */}
            // <div className="text-center pt-2">
            //   <span className="text-gray-400 text-sm">Already have an account? </span>
            //   <Link
            //     href="/auth/login"
            //     className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            //   >
            //     Sign in
            //   </Link>
            // </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, FormEvent, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, UserCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRegisterUserMutation } from '@/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState(" ")
  const [pathName, setPathName] = useState("");
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: ''
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Terms validation
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms and privacy policy';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathName(window.location.pathname);
    }
  }, []);

  const [signUpUser] = useRegisterUserMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Sign Up:', { ...formData, userType });
      console.log(pathName)
    }

    try {
      const res = await signUpUser({ ...formData, role: userType }).unwrap();
      console.log(res)
      if (res?.status === 200 || res?.success) {
        const token = res?.token || res?.data?.token || '';
        toast.success(typeof res?.message === 'string' ? res?.message : 'Sign up successful! Please verify your email')
        localStorage.setItem("token", token)
        router.push(`/auth/verify-email?path=${pathName}&email=${formData.email}&token=${token}`)
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage = typeof error?.data?.data === 'string'
        ? error?.data?.data
        : typeof error?.data === 'string'
          ? error?.data
          : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    };
  };

  interface FormDataType {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }

  interface ErrorsType {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    terms: string;
  }

  const handleInputChange = (field: keyof FormDataType, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ErrorsType]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTermsChange = (checked: boolean): void => {
    setAgreeTerms(checked);
    if (errors.terms && checked) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-black flex items-center justify-center p-4 py-8">
      {/* Sign Up Card */}
      <div className="relative w-full max-w-lg">
        {/* Cyan border glow */}
        <div className="absolute inset-0  bg-[#151579] rounded-3xl blur-sm"></div>

        <div className="relative bg-gradient-to-t from-[#241F30] to-[#161617] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#856096] rounded-2xl p-8">
          {/* Logo placeholder */}
          <div className="flex items-start justify-between">
            <Image
              src="/images/logo.png"
              alt="TeeKnit Logo"
              width={100}
              height={100}
              className="object-contain h-36 w-36"
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[36px] font-cormorant font-bold text-white mb-1">
              Create an account
            </h1>
            <p className="text-gray-400 font-poppins text-sm">Create your account and get started</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserType('customer')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  userType === 'customer'
                    ? 'bg-[#1A1523] text-white  border border-[#B630F4]'
                    : 'bg-[#3c3c50] text-gray-400 border hover:border-gray-600'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setUserType('vendor')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  userType === 'vendor'
                    ? 'bg-[#1A1523] text-white  border border-[#B630F4]'
                    : 'bg-[#3c3c50] text-gray-400 border hover:border-gray-600'
                }`}
              >
                Vendor
              </button>
            </div>
            {userType === 'vendor' && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-xs">
                  Note: Vendor accounts require admin approval. You'll receive an email once your application is reviewed.
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Name</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter Your Name"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">User name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter a Unique User Name"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.username
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1 ml-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter Your Email"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter Your Phone Number"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>}
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="• • • • • • • • •"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="• • • • • • • • •"
                  className={`w-full bg-gray-800/50 border rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => handleTermsChange(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800/50 text-purple-600 focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                I agree to SleeKnit's{' '}
                <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
                  Terms of Use
                </span>
                {' '}and{' '}
                <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>
            {errors.terms && <p className="text-red-400 text-xs mt-1 ml-5">{errors.terms}</p>}

            {/* Sign Up Button */}
             <p className='text-red-500'>{error}</p>
            <button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700  text-white font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30 mt-2"
            >
              Sign Up
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <Link
                href="/auth/login"
                className="text-sm text-[#6100FF] hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}