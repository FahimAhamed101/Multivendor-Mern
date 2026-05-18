import { apiSlice } from "@/redux/api/apiSlice";

const careerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get careers list
    getCareers: builder.query({
      query: ({ page = 1, limit = 10, searchQ = "", country = "" }) => {
        let url = `/career/get?page=${page}&limit=${limit}`;
        if (searchQ) url += `&searchQ=${encodeURIComponent(searchQ)}`;
        if (country) url += `&country=${encodeURIComponent(country)}`;
        return url;
      },
      providesTags: ["Careers"],
    }),

    // Get career details
    getCareerDetails: builder.query({
      query: (id) => `/career/get/details/${id}`,
      providesTags: ["Careers"],
    }),

    // Apply for career
    applyCareer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/career/apply/${id}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Careers"],
    }),
  }),
});

export const {
  useGetCareersQuery,
  useGetCareerDetailsQuery,
  useApplyCareerMutation,
} = careerSlice;
