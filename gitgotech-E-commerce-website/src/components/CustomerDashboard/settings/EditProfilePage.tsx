'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useUpdateProfileMutation, useGetMyProfileQuery } from '@/redux/features/settings/settingsSlice';
import toast from 'react-hot-toast';
import url from '@/redux/api/baseUrl';

export default function EditProfilePage() {
    const router = useRouter();
    const { data: profileData } = useGetMyProfileQuery(undefined);
    const [updateProfile] = useUpdateProfileMutation();
    
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        preference: 'phone',
        address: '',
        image: null as File | null
    });

    // Load profile data when available
    useEffect(() => {
        if (profileData?.data) {
            const profile = profileData.data;
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
                preference: profile.preference || 'phone',
                address: profile.address || '',
                image: null
            });
        }
    }, [profileData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                image: e.target.files[0]
            });
        }
    };

    const handleSubmit = async () => {
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('bio', formData.bio);
            submitData.append('preference', formData.preference);
            submitData.append('address', formData.address);
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const res = await updateProfile(submitData).unwrap();
            
            if (res?.success) {
                toast.success('Profile updated successfully!');
                router.push('/profile');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error?.data?.message || 'Failed to update profile');
        }
    };

    return (

    <div className="min-h-screen mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black text-white flex items-center justify-center p-4">


      <div className="max-w-2xl w-full">

         <div className="container mx-auto flex items-center gap-4 mb-6">
             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black' />
          </div>
        </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">Edit Profile</h1>
        </div>
        {/* Header */}


        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
              <img
                src={profileData?.data?.image ? `${url}${profileData.data.image}` : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";
                }}
              />
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Username */}
          <p className="text-sm text-gray-400">{profileData?.data?.username || 'User'}</p>

        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-b from-[#0a2930] to-[#0c0111] bg-opacity-50 border-2 border-blue-50 rounded-3xl p-8 backdrop-blur-sm">
          <div className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm mb-3">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full bg-transparent border border-gray-600 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm mb-3">Bio</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-purple-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full bg-transparent border border-gray-600 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm mb-3">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="w-full bg-transparent border border-gray-600 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Communication Preference */}
            <div>
              <label className="block text-sm mb-3">Communication Preference</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="preference"
                    value="email"
                    checked={formData.preference === 'email'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="preference"
                    value="phone"
                    checked={formData.preference === 'phone'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  <span className="text-sm">Phone</span>
                </label>
              </div>
            </div>

            {/* Update Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 mt-4"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

    </div>

  );
}