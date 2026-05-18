"use client";
import { ArrowLeft, Lock, CreditCard, FileText, RotateCcw, Shield, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowsLeftRight } from "react-icons/fa6";

export default function SettingsPage() {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteAccount = () => {
      // Add your delete account logic here
      console.log("Account deleted");
      setShowDeleteModal(false);
      // Optionally redirect to login or home page
      // router.push("/auth/login");
    };

    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-[#120a2a] to-black flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
           <div className="container pb-4 mx-auto flex items-center gap-4">
             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black' />
          </div>
        </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">Settings</h1>
        </div>

          {/* Settings Card */}
          <div className="space-y-4">
            <SettingButton 
              onClick={() => router.push("/profile/change-password")}  
              icon={<Lock />} 
              label="Change Password" 
              primary 
            />

            <SettingButton 
              onClick={() => router.push("/terms-condition")} 
              icon={<FileText />} 
              label="Terms & Conditions" 
            />

            <SettingButton 
              onClick={() => router.push("/privacy-policy")} 
              icon={<Shield />} 
              label="Privacy Policy" 
            />

            <SettingButton 
              onClick={() => router.push("/return-policy")} 
              icon={<RotateCcw />} 
              label="Return Policy" 
            />

            <SettingButton
              icon={<Trash2 />}
              label="Delete Account"
              danger
              onClick={() => setShowDeleteModal(true)}
            />
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-200">
              {/* Close Button */}
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-3 font-cormorant">
                Delete Account?
              </h2>

              {/* Message */}
              <p className="text-gray-400 text-center mb-6 text-sm">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-white/10 border border-gray-700 text-gray-200 hover:bg-white/20 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}

function SettingButton({ icon, label, primary, danger, onClick }: { icon: ReactNode; label: string; primary?: boolean; danger?: boolean; onClick: () => void }) {
  const base = "flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium transition";

  const styles = danger
    ? "bg-red-900/50 text-red-400 hover:bg-red-900/70"
    : primary
    ? "bg-[#6100FF] text-white hover:bg-purple-700"
    : "bg-white/10 border border-gray-700 text-gray-200 hover:bg-white/10";

  return (
    <button className={`${base} ${styles}`} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}