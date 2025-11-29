import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type { Review, ReviewRequest, ReviewSearchParams } from "@/types/review";
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
      transformResponse: (res: ServiceResult<PageResponse<Review>>) => res.data,
      providesTags: ["Reviews"],
    }),
    createReview: builder.mutation<Review, ReviewRequest>({
      query: (body) => ({
        url: "/api/v1/reviews/add",
        method: "POST",
        data: body,
      }),

      invalidatesTags: (result, error, { movieId }) => [
        "Reviews",
        { type: "Movies", id: movieId },
      ],
    }),

    updateReview: builder.mutation<Review, { id: string; body: ReviewRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/api/v1/reviews/update/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: (result, error, arg) => ["Reviews", "Movies"],
      }
    ),
  }),
});

export const { useSearchReviewsQuery, useCreateReviewMutation } = reviewApi;
