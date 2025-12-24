import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type { Review, ReviewRequest, ReviewSearchParams, ToggleHiddenResponse } from "@/types/review";
import { createApi } from "@reduxjs/toolkit/query/react";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Reviews"],

  endpoints: (builder) => ({
    searchReviews: builder.query<PageResponse<Review>, ReviewSearchParams>({
      query: (params) => ({
        url: "/api/v1/reviews/search",
        method: "GET",
        params: {
          ...params,

          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),
      transformResponse: (res: ServiceResult<PageResponse<Review>>) => res.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true, empty: true },
      providesTags: ["Reviews"],
    }),
    createReview: builder.mutation<Review, ReviewRequest>({
      query: (body) => ({
        url: "/api/v1/reviews/add",
        method: "POST",
        data: body,
      }),

      invalidatesTags: () => ["Reviews"],
    }),

    updateReview: builder.mutation<Review, { id: string; body: ReviewRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/api/v1/reviews/update/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: () => ["Reviews"],
      }
    ),

    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/reviews/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => ["Reviews"],
    }),

    toggleReviewHidden: builder.mutation<ToggleHiddenResponse, string>({
      query: (id) => ({
        url: `/api/v1/reviews/${id}/toggle-hidden`,
        method: "PATCH",
      }),
      transformResponse: (response: ServiceResult<ToggleHiddenResponse>) => {
        return response.data ?? { id: "", isHidden: false };
      },
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const { useSearchReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation, useToggleReviewHiddenMutation } = reviewApi;
