import { apiSlice } from "@/redux/api/apiSlice";

const messageSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getChatList: builder.query({
      query: () => "/chat/list",
      providesTags: ["Messages"],
    }),

    getChatMessages: builder.query({
      query: ( selectedChatId ) => `/chat/details/${selectedChatId}`,
      providesTags: (result, error, { chatId }) => [{ type: "Messages", id: chatId }],
    }),

    sendMessage: builder.mutation({
      query: ({ receiverId, formData }) => ({
        url: `/chat/send/${receiverId}`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Messages"],
    }),

  }),
});

export const {
  useGetChatListQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
} = messageSlice;