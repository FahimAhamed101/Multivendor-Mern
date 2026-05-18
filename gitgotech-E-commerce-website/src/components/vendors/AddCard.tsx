"use client";

import { useStoreCardInfoMutation } from "@/redux/features/paymentTransaction/paymentTransactionSlice";
import { Check, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function AddCardPage() {
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [country, setCountry] = useState("");
  const [moreInfo, setMoreInfo] = useState("");

  const router = useRouter();
  const [addCard, { isLoading }] = useStoreCardInfoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!bankName || !accountName || !accountNumber || !bankCode || !country) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await addCard({
        bankName,
        accountName,
        accountNumber,
        bankCode,
        country,
        moreInfo: moreInfo || "Nothing to say",
      }).unwrap();

      console.log("Add Card Response:", res);

      if (res?.success) {
        toast.success("Card added successfully!");
        router.push("/v-profile/wallet/payment-method");
      }
    } catch (error: any) {
      console.error("Add Card Error:", error);
      toast.error(error?.data?.message || "Failed to add card");
    }
  };

  // Auto-format account number as user types (spaces every 4 digits)
  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 20) value = value.slice(0, 20);
    if (value.length > 0) {
      const matches = value.match(/.{1,4}/g);
      value = matches ? matches.join(" ") : value;
    }
    setAccountNumber(value);
  };

  // Auto-format bank code
  const handleBankCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    setBankCode(value);
  };

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="container mx-auto flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className="text-black" />
          </div>
        </button>
        <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
          Add Card
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Card Form Container */}
        <div className="bg-gradient-to-r from-[#161420] via-[#2f2b41] to-[#161420] border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#67469c] rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
                className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  placeholder="Enter account number"
                  className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
                  maxLength={27}
                />
                {/* Card Type Icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white font-bold">V</span>
                  </div>
                  <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                    <span className="text-xs text-white font-bold">M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Code / Routing Number
              </label>
              <input
                type="text"
                value={bankCode}
                onChange={handleBankCodeChange}
                placeholder="Enter bank code"
                className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
                maxLength={11}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
              >
                <option value="">Select Country</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="SA">Saudi Arabia</option>
              </select>
            </div>

            {/* More Info (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                More Info <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={moreInfo}
                onChange={(e) => setMoreInfo(e.target.value)}
                placeholder="Any additional information"
                rows={3}
                className="w-full bg-[#242428] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent resize-none"
              />
            </div>

            {/* Add Card Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6100FF] to-purple-700 cursor-pointer rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Check className="w-5 h-5" />
              <span>{isLoading ? "Adding Card..." : "Add Card"}</span>
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white mb-1">
                Secure Payment Information
              </p>
              <p className="text-xs text-gray-400">
                Your card information is encrypted and stored securely. We never
                share your card details with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
