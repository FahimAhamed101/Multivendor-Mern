import { apiSlice } from "@/redux/api/apiSlice";

interface GetAllCouponsParams {
  searchTerm?: string;
}

interface TakeCouponBody {
  couponId: string;
}

interface GetMyCouponsParams {
  isUsed?: boolean;
  limit?: number;
  page?: number;
  sort?: string;
}

interface ValidateCouponBody {
  couponName: string;
}

const couponRecordSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================= GET ALL COUPONS =================
    getAllCoupons: builder.query<any, GetAllCouponsParams>({
      query: ({ searchTerm = "" } = {}) => ({
        url: `/admin/coupons/list`,
        method: "GET",
        params: { searchTerm },
      }),
      providesTags: ["Coupons"],
    }),

    // ================= TAKE COUPON =================
    takeCoupon: builder.mutation<any, TakeCouponBody>({
      query: (body) => ({
        url: `/admin/coupons/record/take`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Coupons"],
    }),

    // ================= GET MY COUPONS =================
    getMyCoupons: builder.query<any, GetMyCouponsParams>({
      query: ({
        isUsed = false,
        limit = 10,
        page = 1,
        sort = "-createdAt",
      } = {}) => ({
        url: `/admin/coupons/record/my`,
        method: "GET",
        params: {
          isUsed,
          limit,
          page,
          sort,
        },
      }),
      providesTags: ["Coupons"],
    }),

    // ================= VALIDATE COUPON =================
    validateCoupon: builder.mutation<any, ValidateCouponBody>({
      query: (body) => ({
        url: `/admin/coupons/record/validate`,
        method: "POST",
        body: body,
      }),
    }),

  }),
});

export const {
  useGetAllCouponsQuery,
  useTakeCouponMutation,
  useGetMyCouponsQuery,
  useValidateCouponMutation,
} = couponRecordSlice;