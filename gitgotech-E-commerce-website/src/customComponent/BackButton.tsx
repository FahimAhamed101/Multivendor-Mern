"use client"
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export default function BackButton({ title, onBack, className = '' }: PageHeaderProps) {
  const router = useRouter()
  return (
    <div className="container mx-auto flex gap-2 ">
             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black'/>
          </div>
        </button>
        <h1 className={`font-semibold text-gray-300 text-2xl font-cormorant ${className}`}>
  {title}
</h1>
        </div>
    
  );
}