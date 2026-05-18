import { apiSlice } from "../../api/apiSlice";

 

const allUsersSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================= USERS =================
    getUsers: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/users`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Users"],
    }),

    getSingleUser: builder.query({
      query: (id) => `/admin/users/${id}`,
    }),

    toggleBlockUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/toggle-block`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Users"],
    }),

    // ================= VENDORS =================
    getVendors: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/vendors`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Vendors"],
    }),

    getSingleVendor: builder.query({
      query: (id) => `/admin/rvendors/${id}`,
    }),

    toggleBlockVendor: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/vendors/${id}/toggle-block`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Vendors"],
    }),

    markAsTopVendor: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/vendors/${id}/toggle-top`, 
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Vendors"],
    }),

    // ================= DRIVERS =================
    getDrivers: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/drivers`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Drivers"],
    }),

    getSingleDriver: builder.query({
      query: (id) => `/admin/drivers/${id}`,
    }),

    toggleBlockDriver: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/drivers/${id}/toggle-block`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Drivers"],
    }),

    // ================= MANAGERS =================
    getManagers: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/managers`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Managers"],
    }),

    addManager: builder.mutation({
      query: (body) => ({
        url: `/admin/managers/add`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Managers"],
    }),

    getSingleManager: builder.query({
      query: (id) => `/admin/managers/${id}`,
    }),

    toggleBlockManager: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/managers/${id}/toggle-block`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Managers"],
    }),

    ///request vendor and driver

    getRequestedVendors: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/requests?role=vendor`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["RequestedVendors"],
      transformResponse: (response) => {
        const responseData = response?.data?.data || [];
        const meta = response?.data?.meta || {};
        return { data: responseData, meta };
      },
    }),

    getRequestedDrivers: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/requests?role=driver`,
        params: { searchTerm, page, limit },
      }),
      providesTags: ["RequestedDrivers"],
      transformResponse: (response) => {
        const responseData = response?.data?.data || [];
        const meta = response?.data?.meta || {};
        return { data: responseData, meta };
      },
    }),

    requestedAccept: builder.mutation({
      query: (id) => ({
        url: `/admin/requests/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["RequestedVendors", "RequestedDrivers"],
    }),

    requestedDecline: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/requests/${id}/decline`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["RequestedVendors", "RequestedDrivers"],
    }),



  }),
});

export const {
  // Users
  useGetUsersQuery,
  useGetSingleUserQuery,
  useToggleBlockUserMutation,

  // Vendors
  useGetVendorsQuery,
  useGetSingleVendorQuery,
  useToggleBlockVendorMutation,
  useMarkAsTopVendorMutation,

  // Drivers
  useGetDriversQuery,
  useGetSingleDriverQuery,
  useToggleBlockDriverMutation,

  // Managers
  useGetManagersQuery,
  useGetSingleManagerQuery,
  useToggleBlockManagerMutation,
  useAddManagerMutation,

  // Requests
  useGetRequestedVendorsQuery,
  useGetRequestedDriversQuery,
  useRequestedAcceptMutation,
  useRequestedDeclineMutation,


} = allUsersSlice;