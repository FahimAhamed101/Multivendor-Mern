import { apiSlice } from "../../api/apiSlice";

const supportMessageSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get All Support Chats (with pagination)
    getSupportList: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/support/list`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Support"],
    }),

    // ✅ Get All Messages for a Specific Support Chat
    getSupportMessages: builder.query({
      query: (chatId) => ({
        url: `/support/messages/${chatId}`,
        method: "GET",
      }),
      providesTags: ["Support"],
    }),

    // ✅ Send Message to Specific Chat (with optional attachments)
    sendSupportMessage: builder.mutation({
      query: ({ chatId, formData }) => ({
        url: `/support/message/${chatId}`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const {
  useGetSupportListQuery,
  useSendSupportMessageMutation,
  useGetSupportMessagesQuery,
} = supportMessageSlice;