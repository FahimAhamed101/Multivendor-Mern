import { apiSlice } from "@/redux/api/apiSlice";

const deleveryRequest = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET - Get Delivery Requests
    getDeliveryRequests: builder.query({
      query: () => ({
        url: "/delivery-request/user",
        method: "GET",
      }),
      providesTags: ["DeliveryRequests"],
    }),

    // ✅ POST - Create Delivery Request
    createDeliveryRequest: builder.mutation({
      query: (body) => ({   

        url: "/delivery-request",
        method: "POST",
        body,
      }),

        invalidatesTags: ["DeliveryRequests"],
    }),



    }),});

export const {  
    useGetDeliveryRequestsQuery,
    useCreateDeliveryRequestMutation,
} = deleveryRequest;