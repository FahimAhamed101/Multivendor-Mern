 import { apiSlice } from "../../api/apiSlice";

const adminWithdrawSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Get All Withdraw Requests
    getWithdraws: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/admin/payment/withdraw`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Withdraws"],
    }),

    // ✅ Get Single Withdraw
    getWithdraw: builder.query({
      query: (id) => ({
        url: `/admin/payment/withdraw/${id}`,
        method: "GET",
      }),
    }),

    // ✅ Approve Withdraw
    approveWithdraw: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/payment/withdraw/approve/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Withdraws"],
    }),

    // ✅ Reject Withdraw
    rejectWithdraw: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/payment/withdraw/reject/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Withdraws"],
    }),

  }),
});

export const {
  useGetWithdrawsQuery,
  useGetWithdrawQuery,
  useApproveWithdrawMutation,
  useRejectWithdrawMutation,
} = adminWithdrawSlice;