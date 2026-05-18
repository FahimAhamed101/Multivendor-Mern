import { apiSlice } from "@/redux/api/apiSlice";
 

const nofiticationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Notifications
    getNotifications: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notification?page=${page}&limit=${limit}`,
        method: "GET",
      }),
       providesTags: [{type: "Notifications"}]
    }),

  readNotification: builder.mutation({
    query: (id) => ({
      url: `/notification/read/${id}`,
        method: "PATCH",
    }),
    invalidatesTags: [{type: "Notifications"}]
 
    }),



  }),
});

export const {
     useGetNotificationsQuery
        , useReadNotificationMutation

    } = nofiticationSlice;
