import { apiSlice } from "@/redux/api/apiSlice";

const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    dashboardStatus: builder.query({
      query: (showroomId) => ({
        url: "/vendor/dashboard/stacks",
        method: "GET",
        headers: {
          showroom: showroomId,
        },
      }),
      providesTags: [{ type: "Dashboard" }],
    }),

  }),
});

export const {
  useDashboardStatusQuery,
} = dashboardSlice;