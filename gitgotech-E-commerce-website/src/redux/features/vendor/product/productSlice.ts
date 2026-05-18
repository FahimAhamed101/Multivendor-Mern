import { apiSlice } from "@/redux/api/apiSlice";

const productSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET PRODUCTS
    getProducts: builder.query({
      query: ({ page = 1, limit = 10, showroomId }) => ({
        url: `/product`,
        params: { page, limit },
        headers: { showroom: showroomId },
      }),
      providesTags: [{ type: "Product" }],
    }),

    // GET PRODUCT DETAILS
    getProductDetails: builder.query({
      query: ({ id, showroomId }) => ({
        url: `/product/details/${id}`,
        headers: { showroom: showroomId },
      }),
      providesTags: [{ type: "Product" }],
    }),

    // ADD PRODUCT
    addProduct: builder.mutation({
      query: ({ data, showroomId }) => ({
        url: `/product/add`,
        method: "POST",
        body: data,
        headers: { showroom: showroomId },
      }),
      invalidatesTags: [{ type: "Product" }],
    }),

    // UPDATE PRODUCT
    updateProduct: builder.mutation({
      query: ({ id, data, showroomId }) => ({
        url: `/product/edit/${id}`,
        method: "PATCH",
        body: data,
        headers: { showroom: showroomId },
      }),
      invalidatesTags: [{ type: "Product" }],
    }),

    // DELETE PRODUCT
    deleteProduct: builder.mutation({
      query: ({ id, showroomId }) => ({
        url: `/product/delete/${id}`,
        method: "DELETE",
        headers: { showroom: showroomId },
      }),
      invalidatesTags: [{ type: "Product" }],
    }),

  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productSlice;