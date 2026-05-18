import { apiSlice } from "../../api/apiSlice";



const couponSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ GET All Coupons
    getCoupons: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/coupons/list`,
        method: "GET",
        params: { searchTerm, page, limit },
      }),
      providesTags: ["Coupons"],
      transformResponse: (response) => {
        const responseData = response?.data?.data || [];
        const meta = response?.data?.meta || {};
        return { data: responseData, meta };
      },
    }),

    // ✅ GET Single Coupon
    getCoupon: builder.query({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "GET",
      }),
    }),

    // ✅ ADD Coupon
    addCoupon: builder.mutation({
      query: (body) => ({
        url: `/admin/coupons/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupons"],
    }),

    // ✅ UPDATE Coupon
    updateCoupon: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/coupons/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Coupons"],
    }),

    // ✅ DELETE Coupon
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),

  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponSlice;


