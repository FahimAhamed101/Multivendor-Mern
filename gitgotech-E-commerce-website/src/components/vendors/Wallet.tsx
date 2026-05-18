"use client";

import {
  useAddMoneyMutation,
  useGetWalletTransactionsQuery,
} from "@/redux/features/paymentTransaction/paymentTransactionSlice";
import { useGetMyProfileQuery } from "@/redux/features/settings/settingsSlice";
import { DollarSign, Wallet as WalletIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

interface Transaction {
  _id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  createdAt: string;
  status: string;
  newBalance: number;
  oldBalance: number;
  referenceId: string;
}

export default function Wallett() {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: walletData, isLoading } = useGetWalletTransactionsQuery({});
  const [addMoney] = useAddMoneyMutation();
 const {data:profileData} = useGetMyProfileQuery({});
 const userRole = profileData?.data?.role;
  const balance = walletData?.data?.balance || 0;
  const transactions: Transaction[] = walletData?.data?.transactions || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return "₵" + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !paymentAmount ||
      isNaN(parseFloat(paymentAmount)) ||
      parseFloat(paymentAmount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!paymentPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await addMoney({
        amount: parseFloat(paymentAmount),
        phone: paymentPhone,
      }).unwrap();

      console.log("Add Money Response:", res);

      if (res?.success) {
        toast.success("Payment added successfully!");
        setIsPaymentModalOpen(false);
        setPaymentAmount("");
        setPaymentPhone("");
      }
    } catch (error: any) {
      console.error("Add Money Error:", error);
      toast.error(error?.data?.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount("");
    setPaymentPhone("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r md:mt-20 mt-12 from-black via-[#0f0924] to-black text-white p-4 md:p-8">
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
          My Wallet
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Card - Redesigned */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 p-6 md:p-8 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="w-6 h-6 text-white" />
                <span className="text-white/80 text-sm md:text-base font-medium tracking-wide">
                  BALANCE
                </span>
              </div>

              <div className="text-white text-3xl md:text-5xl font-bold mb-6">
                {formatCurrency(balance)}
              </div>

              {/* Coin Icon */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                    <DollarSign
                      className="w-10 h-10 md:w-14 md:h-14 text-yellow-800"
                      strokeWidth={3}
                    />
                  </div>
                  {/* Coin Stack Effect */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 -z-10"></div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 -z-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">

   {userRole === "customer" && (
    <button
       onClick={() => setIsPaymentModalOpen(true)}
      className="flex-1 flex items-center cursor-pointer justify-center border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#6100FF] text-[#6100FF] gap-2 px-4 py-3 bg-[#2F2643] rounded-xl transition hover:bg-[#3a2f52]"
    >
      <img src="/images/add-money.png" alt="" />
      <span>Add Money</span>
    </button>
  )}

  <button
    onClick={() => router.push("/v-profile/wallet/payment-method")}
    className="flex-1 flex items-center cursor-pointer justify-center border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#6100FF] text-[#6100FF] gap-2 px-4 py-3 bg-[#2F2643] rounded-xl transition hover:bg-[#3a2f52]"
  >
    <img src="/images/method.png" alt="" />
    <span>Payment Method</span>
  </button>

          <button
            onClick={() => router.push("/v-profile/wallet/withdraw-request")}
            className="flex-1 flex items-center cursor-pointer justify-center border-2 border-[#42276e] gap-2 px-4 py-3 bg-[#6100FF] hover:bg-purple-700 rounded-xl transition"
          >
            <img src="/images/withdraw.png" alt="" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Recent History */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#6100FF] rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            Recent History
          </h3>

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">
                      {tx.description ||
                        `${tx.type === "CREDIT" ? "Order payment" : "Withdraw"}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.createdAt)}
                    </p>
                   <p className={`text-xs font-medium ${
  tx.status === "success"
    ? "text-green-400"
    : tx.status === "pending"
    ? "text-yellow-400"
    : "text-gray-500"
  }`}>
  Status: <span className="capitalize">{tx.status}</span>
  </p>
                  </div>

                  <div
                    className={`text-sm font-bold ${
                      tx.type === "CREDIT" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) }
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border-2 border-purple-500/50 rounded-2xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#8a8a9d] hover:text-white transition-colors text-xl font-bold"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Add Money
              </h2>
              <p className="text-purple-400 text-sm">
                Enter amount and phone number to add money to your wallet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full bg-[#1e1e32]/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Processing..." : "Add Money"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
