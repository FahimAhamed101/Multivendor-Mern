


import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
    //   console.log("9 baseApi", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes:
   [
    "Promotion",
     "Product",
      "Users",
       "Coupon",
        "About",
          "AdminProducts",
          "Support"
      ],

  endpoints: () => ({}),
});
