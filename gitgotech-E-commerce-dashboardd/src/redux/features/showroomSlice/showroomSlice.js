import { apiSlice } from "../../api/apiSlice";




const showroomSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Get All Showrooms
    getShowrooms: builder.query({
      query: () => ({
        url: `/admin/showrooms`,
        method: "GET",
      }),
      providesTags: ["Showrooms"],
    }),

    // ✅ Get Single Showroom
    getShowroom: builder.query({
      query: (id) => ({
        url: `/admin/showrooms/${id}`,
        method: "GET",
      }),
    }),

    // ✅ Approve Showroom
    approveShowroom: builder.mutation({
      query: (id) => ({
        url: `/admin/showrooms/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Showrooms"],
    }),

    // ✅ Decline Showroom
    declineShowroom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/showrooms/${id}/decline`,
        method: "PATCH",
        body:body, // { reason: string }
      }),
      invalidatesTags: ["Showrooms"],
    }),

  }),
});

export const {
  useGetShowroomsQuery,
  useGetShowroomQuery,
  useApproveShowroomMutation,
  useDeclineShowroomMutation,
} = showroomSlice;