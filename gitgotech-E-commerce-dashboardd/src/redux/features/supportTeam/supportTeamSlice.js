import { apiSlice } from "../../api/apiSlice";

const supportTeamSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    addSupportTeam: builder.mutation({
      query: (body) => ({
        url: "/admin/support-team/add",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["SupportTeam"],
    }),

    // ✅ Get All Support Team Members
    getSupportTeam: builder.query({
      query: ({ page = 1, limit = 10, searchTerm = "" } = {}) => ({
        url: "/admin/support-team",
        method: "GET",
        params: { searchTerm, page, limit },
      }),
      providesTags: ["SupportTeam"],
    }),

    // ✅ Get Single Support Team Member Details
    getSupportTeamMember: builder.query({
      query: (id) => ({
        url: `/admin/support-team/${id}`,
        method: "GET",
      }),
      providesTags: ["SupportTeam"],
    }),

    // ✅ Toggle Block/Unblock Support Team Member
    toggleBlockSupportTeam: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/support-team/${id}/toggle-block`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SupportTeam"],
    }),
  }),
});

export const {
  useAddSupportTeamMutation,
  useGetSupportTeamQuery,
  useGetSupportTeamMemberQuery,
  useToggleBlockSupportTeamMutation,
} = supportTeamSlice;
