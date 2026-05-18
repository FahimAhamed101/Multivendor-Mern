"use client";
import { useChangePasswordMutation } from "@/redux/features/auth/authSlice";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [changePassword] = useChangePasswordMutation();

  const handleUpdate = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);
    console.log("Confirm Password:", confirmPassword);
    const data = {
      oldPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };
    try {
      const res = await changePassword(data).unwrap();
      console.log(res);
      if (res?.status === 200) {
        toast.success(res?.message);
      }
      router.push("/settings");
    } catch (error: any) {
      console.log(error?.data?.message);
      setError(error.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#120a2a] to-black flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="container mx-auto flex items-center gap-4 py-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
              <FaArrowLeft className="text-black" />
            </div>
          </button>
          <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
            Change Password
          </h1>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-8 bg-gradient-to-br from-[#1b1233] to-[#0e0a1f] shadow-xl border border-purple-500/40">
          {/* Inputs */}
          <div className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              setValue={setCurrentPassword}
              show={show}
              setShow={setShow}
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              setValue={setNewPassword}
              show={show}
              setShow={setShow}
            />
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              show={show}
              setShow={setShow}
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-400 mt-4">{error}</p>}

          {/* Button */}
          <button
            onClick={handleUpdate}
            className="mt-4 w-full py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  setValue,
  show,
  setShow,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-300">{label}</label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
          size={18}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="********"
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
