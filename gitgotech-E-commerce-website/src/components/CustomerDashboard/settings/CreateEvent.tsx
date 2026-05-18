"use client"
import { useRouter } from 'next/navigation';
import { useState, FormEvent, ChangeEvent } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useCreateEventMutation } from '@/redux/features/event/eventSlice';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    address: '',
    purchaseOption: 'creator',
    description: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Combine date and time into ISO format
    const eventDate = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    try {
      const eventData = {
        title: formData.title,
        eventDate,
        address: formData.address,
        purchaseOption: formData.purchaseOption,
        description: formData.description,
        customer: localStorage.getItem('userId') || '' // Get from auth context
      };
      console.log(eventData)
      await createEvent(eventData).unwrap();
      toast.success('Event created successfully!');
      router.push('/profile/event'); // Redirect to events list
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create event');
      console.log(err.data)
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen mt-12 md:mt-20 bg-gradient-to-r from-black via-[#0f0924] to-black to-black p-6">
      {/* Header */}
      <div className="container mx-auto flex items-center gap-4">
             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black' />
          </div>
        </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">Create Event</h1>
        </div>

      {/* Form */}
      <form onSubmit={handleSubmit}
       className="max-w-lg bg-gradient-to-b from-[#0a2930] to-[#1d0d24] bg-opacity-50 border rounded-lg border-purple-400 mx-auto p-5 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Type Here"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Event Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Type Here"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Purchase Options */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Who will purchase?</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="purchaseOption"
                value="creator"
                checked={formData.purchaseOption === 'creator'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
              />
              <span className="text-white">I will purchase for everyone</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="purchaseOption"
                value="invited"
                checked={formData.purchaseOption === 'invited'}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
              />
              <span className="text-white">Everyone will purchase for themselves</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Type Here"
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
