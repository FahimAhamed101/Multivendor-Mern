import { apiSlice } from "../../api/apiSlice";



const categorySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ GET Categories
    getCategories: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/product/categorie/get`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Categories"],
    }),

    // ✅ ADD Category
    addCategory: builder.mutation({
      query: (formData) => ({
        url: `/admin/category/add`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Categories"],
    }),

    // ✅ UPDATE Category
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/category/update/${id}`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Categories"],
    }),

    // ✅ DELETE Category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/category/delete/${id}`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Categories"],
    }),

  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categorySlice;