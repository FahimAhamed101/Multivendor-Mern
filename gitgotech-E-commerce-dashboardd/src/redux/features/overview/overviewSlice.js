import { apiSlice } from "../../api/apiSlice";

 

const adminDashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Dashboard Stats
    getAdminStats: builder.query({
      query: () => ({
        url: `/admin/home/stats`,
        method: "GET",
      }),
    }),

    // ✅ Yearly Revenue
    getYearlyRevenue: builder.query({
      query: ({ year }) => ({
        url: `/admin/home/yearly-revenue`,
        method: "GET",
        params: { year },
      }),
    }),

    // ✅ User vs Vendor Ratio
    getUserVendorRatio: builder.query({
      query: ({ month, year }) => ({
        url: `/admin/home/user-vendor-ratio?month=${month}&year=${year}`,
        method: "GET",
        
      }),
    }),

    // ✅ Recent Users
    getRecentUsers: builder.query({
      query: () => ({
        url: `/admin/home/recent-users`,
        method: "GET",
      }),
    }),

    // ✅ Recent Vendors
    getRecentVendors: builder.query({
      query: () => ({
        url: `/admin/home/recent-vendors`,
        method: "GET",
      
      }),
    }),

  }),
});

export const {
  useGetAdminStatsQuery,
  useGetYearlyRevenueQuery,
  useGetUserVendorRatioQuery,
  useGetRecentUsersQuery,
  useGetRecentVendorsQuery,
} = adminDashboardSlice;