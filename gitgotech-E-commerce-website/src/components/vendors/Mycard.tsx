"use client";
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useGetAllCardInfoQuery, useDeleteCardInfoMutation } from '@/redux/features/paymentTransaction/paymentTransactionSlice';
import toast from 'react-hot-toast';

interface CardInfo {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  country: string;
  createdAt: string;
  isDeleted: boolean;
  moreInfo: string;
  updatedAt: string;
  userId: string;
}

export default function MyCardPage() {
  const router = useRouter();
  const { data: cardData, isLoading } = useGetAllCardInfoQuery({});
  const [deleteCardInfo, { isLoading: isDeleting }] = useDeleteCardInfoMutation();

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const cards: CardInfo[] = cardData?.data ?? [];
  const getLast4 = (accountNumber: string) => accountNumber.slice(-4);

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    try {
     const res = await deleteCardInfo(confirmId).unwrap();
     if (res?.success) {
      toast.success("Card deleted successfully!");
     }
    } catch (err) {
      console.error("Failed to delete card:", err);
      toast.error("Failed to delete card");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-4 md:p-8">

      {/* Confirm Delete Popup */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1B1B1F] border border-[#2e2e35] rounded-2xl p-6 w-[90%] max-w-sm space-y-4 shadow-xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Card?</h3>
              <p className="text-sm text-gray-400">
                Are you sure you want to remove this card? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#3a3a42] text-gray-300 hover:bg-[#2a2a30] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 transition text-white text-sm font-medium"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="container mx-auto mt-20 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className="text-black" />
          </div>
        </button>
        <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">My Card</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Card Button */}
        <button
          onClick={() => router.push("/v-profile/wallet/payment-method/add-card")}
          className="flex-1 w-full flex items-center cursor-pointer justify-center border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#5b2fa3] text-[#6100FF] gap-2 px-4 py-3 bg-[#2F2643] rounded-xl transition"
        >
          <img src="/images/card.png" alt="" />
          <span>Add Card</span>
        </button>

        {/* Your Cards Section */}
        <div className="space-y-3">
          <h2 className="text-[16px] font-medium font-poppins text-gray-300">Your Cards</h2>

          {isLoading && (
            <p className="text-gray-400 text-sm text-center py-4">Loading cards...</p>
          )}

          {!isLoading && cards.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No cards added yet.</p>
          )}

          {cards.map((card) => (
            <div
              key={card._id}
              className="flex items-center justify-between p-4 bg-[#1B1B1F] border border-[#242428] rounded-xl hover:border-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                <img src="/images/Visa.png" alt="" />
                <div>
                  <span className="text-white font-medium">
                    **** **** **** {getLast4(card.accountNumber)}
                  </span>
                  <div className="text-xs text-gray-400">{card.bankName}</div>
                  <div className="text-xs text-gray-500">{card.accountName}</div>
                </div>
              </div>
              <button
                onClick={() => setConfirmId(card._id)}
                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 rounded flex items-center justify-center transition"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}