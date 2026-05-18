
import { apiSlice } from "@/redux/api/apiSlice";

const supportMessageSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ Create Support Ticket
    initSupport: builder.mutation({
      query: (body) => ({
        url: `/support/init`,
        method: "POST",
         body: { message: body.message },
      }),
      invalidatesTags: ["Support"],
    }),

    // ✅ Get All Support Tickets
    getSupportList: builder.query({
      query: () => ({
        url: `/support/list`,
        method: "GET",
      }),
      providesTags: ["Support"],
    }),

    // ✅ Send Message to Specific Ticket
    sendSupportMessage: builder.mutation({
      query: ({ chatId, body }) => ({
        url: `/support/message/${chatId}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Support"],
    }),

    // ✅ (Optional but IMPORTANT) Get Messages of a Ticket
    getSupportMessages: builder.query({
      query: (id) => ({
        url: `/support/messages/${id}`,
        method: "GET",
      }),
      providesTags: ["Support"],
    }),

  }),
});

export const {
  useInitSupportMutation,
  useGetSupportListQuery,
  useSendSupportMessageMutation,
  useGetSupportMessagesQuery,
} = supportMessageSlice;