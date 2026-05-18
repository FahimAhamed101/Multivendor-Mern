import { apiSlice } from "@/redux/api/apiSlice";

 

 

const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: `/auth/register`,
        method: "POST",
        body: data,
      }),
    }),

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

    resendOtp: builder.mutation({
      query: (email) => ({
        url: `/auth/resend-otp`,
        method: "POST",
        params: { email },
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
    useRegisterUserMutation,
    useUserLoginMutation,
    useForgotPasswordMutation,
    useResendOtpMutation,
    useResetPasswordMutation,
    useVerifyOtpMutation,
    useChangePasswordMutation
} = authSlice;
