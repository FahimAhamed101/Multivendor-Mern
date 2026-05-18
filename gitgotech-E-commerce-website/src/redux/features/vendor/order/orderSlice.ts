import { apiSlice } from "@/redux/api/apiSlice";

const emptyMeta = { total: 0, page: 1, limit: 10, totalPages: 0 };

/** Normalize vendor list APIs: supports top-level `result`, nested `data.result`, or legacy `data.data`. */
function normalizeVendorPagedListResponse(response: unknown): {
  data: any[];
  meta: Record<string, unknown>;
  showroom?: string;
} {
  const r = response as Record<string, any> | null | undefined;
  if (!r || typeof r !== "object") {
    return { data: [], meta: { ...emptyMeta } };
  }
  if (r.result?.data !== undefined) {
    return {
      data: r.result.data,
      meta: (r.result.meta as Record<string, unknown>) ?? {},
      showroom: r.showroom,
    };
  }
  const inner = r.data;
  if (inner?.result?.data !== undefined) {
    return {
      data: inner.result.data,
      meta: (inner.result.meta as Record<string, unknown>) ?? {},
      showroom: inner.showroom ?? r.showroom,
    };
  }
  if (inner?.data !== undefined) {
    return {
      data: inner.data,
      meta: (inner.meta as Record<string, unknown>) ?? {},
    };
  }
  return { data: [], meta: { ...emptyMeta } };
}

const orderSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Vendor Orders
    getVendorOrders: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchQ = "",
        filter = "",
        showroomId,
      }) => {
        // Build query params object, only include params with values
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (searchQ) params.append("searchTerm", searchQ);
        if (filter && filter !== "Filter" && filter !== "All Orders")
          params.append("orderStatus", filter);

        return {
          url: `/order/vendor/get?${params.toString()}`,
          method: "GET",
          headers: {
            showroom: showroomId,
          },
        };
      },
      transformResponse: (response: unknown) =>
        normalizeVendorPagedListResponse(response),
      providesTags: ["Orders"],
    }),

    // Get Order Details
    getOrderDetails: builder.query({
      query: ({ id, showroomId }) => ({
        url: `/order/vendor/details/${id}`,
        method: "GET",
        headers: {
          showroom: showroomId,
        },
      }),
      providesTags: ["Orders"],
    }),

    // Update Order Status
    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus, showroomId }) => ({
        url: `/order/vendor/action/${id}`,
        method: "PATCH",
        headers: {
          showroom: showroomId,
        },
        body: {
          orderStatus,
        },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Get Vendor Return Orders
    getVendorReturns: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchQ = "",
        filter = "",
        showroomId,
      }) => {
        // Build query params object, only include params with values
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (searchQ) params.append("searchTerm", searchQ);
        if (filter && filter !== "Filter" && filter !== "All Returns")
          params.append("filter", filter);

        return {
          url: `/order/vendor/return?${params.toString()}`,
          method: "GET",
          headers: {
            showroom: showroomId,
          },
        };
      },
      transformResponse: (response: unknown) => {
        const { data, meta } = normalizeVendorPagedListResponse(response);
        return { data, meta };
      },
      providesTags: ["Returns"],
    }),

    // Get Return Order Details
    getReturnDetails: builder.query({
      query: ({ id, showroomId }) => ({
        url: `/order/vendor/return-details/${id}`,
        method: "GET",
        headers: {
          showroom: showroomId,
        },
      }),
      providesTags: ["Returns"],
    }),

    // Return Order Action (accept/decline)
    returnOrderAction: builder.mutation({
      query: ({ id, action, showroomId }) => ({
        url: `/order/vendor/return-action?order=${id}&action=${action}`,
        method: "PATCH",
        headers: {
          showroom: showroomId,
        },
      }),
      invalidatesTags: ["Returns"],
    }),

    // ==================== CUSTOM ORDERS ====================

    // Get Custom Design Orders
    getCustomOrders: builder.query({
      query: ({
        page = 1,
        limit = 10,
        searchQ = "",
        filter = "",
        showroomId,
      }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (searchQ) params.append("searchTerm", searchQ);
        if (filter && filter !== "Filter" && filter !== "All Custom Orders")
          params.append("orderStatus", filter);

        return {
          url: `/order/vendor/custom?${params.toString()}`,
          method: "GET",
          headers: {
            showroom: showroomId,
          },
        };
      },
      transformResponse: (response: { data: { data: any[]; meta: any } }) => {
        return response.data;
      },
      providesTags: ["CustomOrders"],
    }),

    // Get Custom Order Details
    getCustomOrderDetails: builder.query({
      query: ({ id, showroomId }) => ({
        url: `/order/vendor/custom-details/${id}`,
        method: "GET",
        headers: {
          showroom: showroomId,
        },
      }),
      transformResponse: (response: { data: any }) => {
        return response.data || response;
      },
      providesTags: ["CustomOrders"],
    }),

    // Accept or Decline Custom Order (Design Request Action)
    acceptOrDeclineCustomOrder: builder.mutation({
      query: ({ id, action, price, priceUnit, reason, showroomId }) => {
        const body: any = {
          action, // "accepted" or "declined"
        };

        if (action === "accepted") {
          body.price = price;
          body.priceUnit = priceUnit;
        } else if (action === "declined") {
          body.reason = reason;
        }

        return {
          url: `/order/vendor/design-request/action/${id}`,
          method: "PATCH",
          headers: {
            showroom: showroomId,
          },
          body,
        };
      },
      invalidatesTags: ["CustomOrders"],
    }),

    // Change custom order status after customer accepted vendor price (body: { orderStatus } only)
    changeCustomOrderStatus: builder.mutation({
      query: ({ id, orderStatus, showroomId }) => ({
        url: `/order/vendor/custom/change-status/${id}`,
        method: "PATCH",
        headers: {
          showroom: showroomId,
        },
        body: { orderStatus },
      }),
      invalidatesTags: ["CustomOrders"],
    }),

  }),
});

export const {
  useGetVendorOrdersQuery,
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useGetVendorReturnsQuery,
  useGetReturnDetailsQuery,
  useReturnOrderActionMutation,
  // Custom Orders
  useGetCustomOrdersQuery,
  useGetCustomOrderDetailsQuery,
  useAcceptOrDeclineCustomOrderMutation,
  useChangeCustomOrderStatusMutation,
} = orderSlice;
