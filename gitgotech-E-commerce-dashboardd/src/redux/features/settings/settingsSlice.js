import { apiSlice } from "../../api/apiSlice";

 

const settingsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================= ABOUT US =================
    getAboutUs: builder.query({
      query: () => ({
        url: `/setting/about-us`,
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    updateAboutUs: builder.mutation({
      query: (body) => ({
        url: `/setting/about-us`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // ================= TERMS =================
    getTerms: builder.query({
      query: () => ({
        url: `/setting/terms-conditions`,
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    updateTerms: builder.mutation({
      query: (body) => ({
        url: `/setting/terms-conditions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // ================= PRIVACY =================
    getPrivacy: builder.query({
      query: () => ({
        url: `/setting/privacy-policy`,
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    updatePrivacy: builder.mutation({
      query: (body) => ({
        url: `/setting/privacy-policy`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    ////Profile Settings can be added here in the future
    getMyNotifications: builder.query({
      query: ({ page, limit }) => `/notification?page=${page}&limit=${limit}`,
      providesTags: ["Settings"],
    }),

    getMyProfile: builder.query({
      query: () => "/auth/my-profile",
      providesTags: ["Settings"],
    }),

    updateProfile: builder.mutation({
      query: (formData ) => ({
        url: "/auth/profile-update",
        method: "PATCH",
        body: formData,
       
      }),
      invalidatesTags: ["Settings"],
    }),

  }),
});

export const {
  useGetAboutUsQuery,
  useUpdateAboutUsMutation,
  useGetTermsQuery,
  useUpdateTermsMutation,
  useGetPrivacyQuery,
  useUpdatePrivacyMutation,

    useGetMyNotificationsQuery,

    useGetMyProfileQuery, 
    useUpdateProfileMutation,
} = settingsSlice;