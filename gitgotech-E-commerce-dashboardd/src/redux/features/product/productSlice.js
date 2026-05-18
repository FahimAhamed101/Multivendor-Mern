import { apiSlice } from "../../api/apiSlice";

 

const adminProductSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Get All Products
    getAdminProducts: builder.query({
      query: ({ searchTerm = "", page = 1, limit = 10 } = {}) => ({
        url: `/admin/products`,
        method: "GET",
        params: { searchTerm, page, limit },
      }),
      providesTags: ["AdminProducts"],
    }),

    // ✅ Get Single Product
    getAdminProduct: builder.query({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "GET",
      }),
    }),

    // ✅ Toggle Private (Set / Remove)
    toggleProductPrivate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}/private`,
        method: "PATCH", // ⚠️ check backend (PATCH/PUT/POST)
        body: body, // { isPrivate: boolean, privateReason?: string }
      }),
      invalidatesTags: ["AdminProducts"],
    }),

  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useToggleProductPrivateMutation,
} = adminProductSlice;