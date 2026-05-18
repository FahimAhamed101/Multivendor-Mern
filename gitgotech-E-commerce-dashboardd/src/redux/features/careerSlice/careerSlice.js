import { apiSlice } from "../../api/apiSlice";



const careerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================= JOBS =================

    // ✅ Get All Jobs
    getJobs: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/career/jobs`,
        method: "GET",
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Jobs"],
      transformResponse: (response) => {
        const responseData = response?.data?.data || [];
        const meta = response?.data?.meta || {};
        return { data: responseData, meta };
      },
    }),

    // ✅ Create Job
    createJob: builder.mutation({
      query: (body) => ({
        url: `/admin/career`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Jobs"],
    }),

    // ✅ Update Job
    updateJob: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/career/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Jobs"],
    }),

    // ✅ Delete Job
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/admin/career/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Jobs"],
    }),

    // ================= APPLICATIONS =================

    // ✅ Get All Applications
    getApplications: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/admin/career/applications`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Applications"],
      transformResponse: (response) => {
        const responseData = response?.data?.data || [];
        const meta = response?.data?.meta || {};
        return { data: responseData, meta };
      },
    }),

    // ✅ Get Single Application
    getApplicationPersonByJob: builder.query({
      query: (id) => ({
        url: `/admin/career/applications/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data,
    }),

  }),
});

export const {
  useGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetApplicationsQuery,
   useGetApplicationPersonByJobQuery,
} = careerSlice;
