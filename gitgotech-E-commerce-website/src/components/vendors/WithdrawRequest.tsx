"use client";

import {
  useGetAllCardInfoQuery,
  useGetWalletTransactionsQuery,
  useGetWithdrawListQuery,
  useWithdrawRequestMutation,
} from "@/redux/features/paymentTransaction/paymentTransactionSlice";
import {
  AlertCircle,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Plus,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

interface Card {
  _id: string;
  cardType: string;
  last4: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  country: string;
  cardHolderName?: string;
  moreInfo?: string;
}

interface WithdrawRequest {
  _id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  country: string;
  moreInfo: string;
  status: "pending" | "approved" | "rejected";
  platformFee: number;
  createdAt: string;
  updatedAt: string;
}

export default function WithdrawRequest() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: walletData } = useGetWalletTransactionsQuery({});
  const { data: cardsData } = useGetAllCardInfoQuery(undefined);
  const [withdrawRequest, { isLoading }] = useWithdrawRequestMutation();
  const { data: withdrawData, refetch: refetchWithdrawList } =
    useGetWithdrawListQuery({
      page: currentPage,
      limit: 10,
    });

  const balance = walletData?.data?.balance || 0;
  const cards: Card[] = cardsData?.data || [];
  const withdrawRequests: WithdrawRequest[] = withdrawData?.data?.data || [];
  const meta = withdrawData?.data?.meta;

  const selectedCard = cards.find((card) => card._id === selectedCardId);

  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0]._id);
    }
  }, [cards, selectedCardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedCardId || !selectedCard) {
      toast.error("Please select a card");
      return;
    }

    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const withdrawBody = {
        amount: parseFloat(amount),
        bankName: selectedCard.bankName,
        accountName: selectedCard.accountName,
        accountNumber: selectedCard.accountNumber,
        country: selectedCard.country,
        bankCode: selectedCard.bankCode,
        moreInfo: selectedCard.moreInfo || "Nothing to say",
      };

      console.log("Withdraw Request Body:", withdrawBody);

      await withdrawRequest(withdrawBody).unwrap();

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      refetchWithdrawList();
      setActiveTab("history");
    } catch (error: any) {
      console.error("Withdraw error:", error);
      toast.error(
        error?.data?.message || "Failed to submit withdrawal request",
      );
    }
  };

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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30";
      case "approved":
        return "bg-green-900/30 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-900/30 text-red-400 border-red-500/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (meta?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r md:mt-20 mt-12 from-black via-[#110a2b] to-black text-white p-4 md:p-8">
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
          Withdraw Request
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Available Balance</span>
            <span className="text-xl font-bold text-white">
              ₵
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("request")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "request"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "history"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            History
          </button>
        </div>

        {/* Request Tab */}
        {activeTab === "request" && (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Enter Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full bg-[#242428] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Card Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Card
              </label>
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No cards added yet. Please add a card first.
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card._id}
                      onClick={() => setSelectedCardId(card._id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCardId === card._id
                          ? "bg-[#09090B] border-purple-500/50 ring-1 ring-purple-500/40 rounded-2xl shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                          : "border-gray-700 bg-[#1B1B1F] hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/Visa.png"
                          alt={card.cardType}
                          className="h-8"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              **** **** **** {card.last4}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                              {card.cardType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {card.bankName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.cardHolderName || card.accountName}
                          </div>
                        </div>
                        {selectedCardId === card._id && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Card Button */}
            <button
              onClick={() => router.push("/v-profile/wallet/payment-method")}
              className="w-full flex items-center cursor-pointer justify-center gap-2 px-4 py-3 border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-purple-500/30 rounded-2xl bg-gray-800 hover:bg-gray-700 rounded-xl transition"
            >
              <Plus className="w-5 h-5 text-purple-400" />
              <span>Add Card</span>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !amount || !selectedCardId}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ArrowDownRight className="w-5 h-5" />
              <span>{isLoading ? "Processing..." : "Withdraw"}</span>
            </button>

            {/* Info Box */}
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 text-sm text-gray-300">
              Our payment cycle runs every Friday. If you need your payment
              earlier, our support team is here to help—just reach out!
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border shadow-[0_0_12px_rgba(34,211,238,0.35)] border-[#6100FF] rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              Withdraw History
            </h3>

            {withdrawRequests.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No withdrawal requests found
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-[#1B1B1F] border border-gray-700 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(request.status)}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        ₵
                        {request.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Bank:</span>
                        <p className="text-white">{request.bankName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Account:</span>
                        <p className="text-white">{request.accountName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Account No:</span>
                        <p className="text-white">{request.accountNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bank Code:</span>
                        <p className="text-white">{request.bankCode}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Platform Fee:</span>
                        <p className="text-yellow-400">₵{request.platformFee}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <p className="text-white">{request.country}</p>
                      </div>
                    </div>

                    {/* More Info */}
                    {request.moreInfo &&
                      request.moreInfo !== "Nothing to say" && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <span className="text-xs text-gray-500">Note:</span>
                          <p className="text-sm text-gray-400">
                            {request.moreInfo}
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  ←
                </button>
                {Array.from(
                  { length: Math.min(5, meta.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (meta.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= meta.totalPages - 2) {
                      pageNum = meta.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return pageNum;
                  },
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg transition-colors text-sm ${
                      page === currentPage
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(meta.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === meta.totalPages}
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
