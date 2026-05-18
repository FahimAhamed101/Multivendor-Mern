import { apiSlice } from "../../api/apiSlice";

 

 

const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({ 
    userLogin: builder.mutation({
      query: (data) => ({
        url: `/auth/login`,
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/forget-password`,
        method: "POST",
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: ({ data, token }) => ({
        url: `/auth/verify-otp`,
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ data, token }) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

      changePassword: builder.mutation({
      query: (data ) => ({
        url: `/auth/change-password`,
        method: "POST",
        body: data,
       
      }),
    }),



  }),
});

export const {
 
    useUserLoginMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyOtpMutation,
    useChangePasswordMutation,
} = authSlice;
