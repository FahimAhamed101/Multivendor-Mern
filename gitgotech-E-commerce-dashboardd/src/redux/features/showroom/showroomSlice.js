import { apiSlice } from "../../api/apiSlice";

const showroomSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Get All Showroom Requests
    getShowrooms: builder.query({
      query: ({ page = 1, limit = 10, searchTerm = "" } = {}) => ({
        url: "/admin/showroom",
        method: "GET",
        params: { page, limit, searchTerm },
      }),
      providesTags: ["Showrooms"],
    }),

    // ✅ Get Single Showroom Details
    getShowroom: builder.query({
      query: (id) => ({
        url: `/admin/showroom/${id}`,
        method: "GET",
      }),
      providesTags: ["Showrooms"],
    }),

    // ✅ Approve Showroom
    approveShowroom: builder.mutation({
      query: (id) => ({
        url: `/admin/showroom/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Showrooms"],
    }),

    // ✅ Reject Showroom
    rejectShowroom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/showroom/reject/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Showrooms"],
    }),
  }),
});

export const {
  useGetShowroomsQuery,
  useGetShowroomQuery,
  useApproveShowroomMutation,
  useRejectShowroomMutation,
} = showroomSlice;
