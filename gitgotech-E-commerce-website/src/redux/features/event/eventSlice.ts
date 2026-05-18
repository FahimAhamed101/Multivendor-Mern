import { apiSlice } from "@/redux/api/apiSlice";

const eventSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Event
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/event/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    // Get Events
    getEvents: builder.query({
      query: ({ type = "created", page = 1, limit = 10 }) =>
        `/event/get?type=${type}&page=${page}&limit=${limit}`,
      providesTags: ["Events"],
    }),

    getEventsForProductAdd: builder.query({
      query: () => `/event/get?type=created`,
    }),

    getProductByEvent: builder.query({
      query: (id) => `/event/product/get/${id}`,
    }),

    getEventById: builder.query({
      query: (id) => `/event/get/${id}`,
    }),

    ///size data get event
    getProductEventWishesSize: builder.query({
      query: (data) => ({
        url: `/event/size/get-product-size`,
        method: "GET",
        params: data, // ✅ FIXED
      }),
    }),

    eventProductSizeAddEdit: builder.mutation({
      query: (data) => ({
        url: `/event/size/add`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    eventProductAdd: builder.mutation({
      query: (data) => ({
        url: `/event/product/add`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    // Update Event
    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/event/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    // Add Event Member (Send Invitation)
    addEventMember: builder.mutation({
      query: ({ eventId, memberDetails, file }) => {
        const formData = new FormData();
        // Add member details as JSON string in 'data' field
        formData.append(
          "data",
          JSON.stringify({
            event: eventId,
            memberDetails: memberDetails,
          }),
        );
        // Add card file (PDF or image)
        if (file) {
          formData.append("file", file);
        }
        return {
          url: "/event/member/add",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventsForProductAddQuery,
  useGetProductByEventQuery,
  useGetEventsQuery,
  useUpdateEventMutation,
  useEventProductAddMutation,
  useGetEventByIdQuery,

  ///size get event product
  useEventProductSizeAddEditMutation,
  useGetProductEventWishesSizeQuery,
  useAddEventMemberMutation,
} = eventSlice;
