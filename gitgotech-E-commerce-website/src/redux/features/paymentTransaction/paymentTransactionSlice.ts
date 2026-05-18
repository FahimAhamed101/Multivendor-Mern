import { apiSlice } from "@/redux/api/apiSlice";

const paymentTransactionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET Wallet Transactions
    getWalletTransactions: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/auth/wallet`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Wallet"],
    }),

    // ✅ POST Add Money
    addMoney: builder.mutation({
      query: (body) => ({
        url: `/payment/add-money`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // ✅ POST Store Card Info
    storeCardInfo: builder.mutation({
      query: (body) => ({
        url: `/payment-card/store-card-info`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CardInfo"],
    }),

    // ✅ GET All Card Info
    getAllCardInfo: builder.query({
      query: () => ({
        url: `/payment-card/get-all-card-info`,
        method: "GET",
      }),
     providesTags: [{ type: "CardInfo" }],
    }),

    // ✅ DELETE Card Info
    deleteCardInfo: builder.mutation({
      query: (cardId) => ({
        url: `/payment-card/delete-card-info`,
        method: "DELETE",
        params: { cardId },
      }),
      invalidatesTags: [{ type: "CardInfo" }],
    }),

    // ✅ GET Withdraw List
    getWithdrawList: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/withdraw`,
        method: "GET",
        params: { 
          page,
          limit,
        },
      }),
      providesTags: ["Withdraw"],
    }),

    // ✅ POST Withdraw Request
    withdrawRequest: builder.mutation({
      query: (body) => ({
        url: `/withdraw/request`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "Withdraw"],
    }),
  }),
});

export const {
  useGetWalletTransactionsQuery,
  useAddMoneyMutation,
  useDeleteCardInfoMutation,
  useGetAllCardInfoQuery,
  useStoreCardInfoMutation,
  useGetWithdrawListQuery,
  useWithdrawRequestMutation,
} = paymentTransactionSlice;
