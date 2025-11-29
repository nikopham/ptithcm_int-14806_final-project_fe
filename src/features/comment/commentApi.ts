import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type {
  CommentSearchParams,
  CreateCommentRequest,
  EditCommentRequest,
} from "@/types/comment";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Comments"],

  endpoints: (builder) => ({
    getMovieComments: builder.query<PageResponse<Comment>, CommentSearchParams>(
      {
        query: ({ movieId, page, size = 20 }) => ({
          url: `/api/v1/movies/${movieId}/comments`,
          method: "GET",
          params: {
            page: page > 0 ? page - 1 : 0,
            size: size,
            sort: "createdAt,desc",
          },
        }),

        transformResponse: (response: ServiceResult<PageResponse<Comment>>) => {
          return response.data;
        },

        serializeQueryArgs: ({ endpointName, queryArgs }) => {
          return `${endpointName}(${queryArgs.movieId})`;
        },

        merge: (currentCache, newItems, { arg }) => {
          if (arg.page === 1) {
            currentCache.content = newItems.content;
          } else {
            const existingIds = new Set(currentCache.content.map((c) => c.id));
            const uniqueNewItems = newItems.content.filter(
              (c) => !existingIds.has(c.id)
            );

            currentCache.content.push(...uniqueNewItems);
          }

          currentCache.number = newItems.number;
          currentCache.last = newItems.last;
          currentCache.totalElements = newItems.totalElements;
          currentCache.totalPages = newItems.totalPages;
        },

        forceRefetch({ currentArg, previousArg }) {
          return currentArg?.page !== previousArg?.page;
        },

        providesTags: (result, error, { movieId }) => [
          { type: "Comments", id: movieId },
        ],
      }
    ),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: (body) => ({
        url: "/api/v1/comments",
        method: "POST",
        data: body,
      }),

      invalidatesTags: (result, error, { movieId }) => [
        { type: "Comments", id: movieId },
      ],
    }),

    editComment: builder.mutation<
      Comment,
      { id: string; body: EditCommentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/comments/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (result, error, arg) => ["Comments"],
    }),
  }),
});

export const {
  useGetMovieCommentsQuery,
  useCreateCommentMutation,
  useEditCommentMutation,
} = commentApi;
