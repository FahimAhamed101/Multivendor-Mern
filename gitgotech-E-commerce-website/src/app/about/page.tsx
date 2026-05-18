'use client';

import { useGetAboutQuery } from '@/redux/features/settings/settingsSlice';
import FooterPageBack from '@/components/landingPage/FooterPageBack';

export default function AboutPage() {
  const { data: aboutData, isLoading } = useGetAboutQuery({});
  const aboutInfo = aboutData?.data;

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="container md:mt-24 mt-12 mx-auto flex flex-wrap items-center gap-4">
          <FooterPageBack showHomeLink />
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">About us</h1>
        </div>

        <div className="bg-gradient-to-br from-gray-800/40 to-purple-900/20 mt-8 border-2 border-blue-500/50 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">Loading about us...</span>
            </div>
          ) : (
            <div className="space-y-6 text-sm text-gray-400 leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-gray-300 whitespace-pre-wrap">
                {aboutInfo?.description || 'No about us content available.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}
