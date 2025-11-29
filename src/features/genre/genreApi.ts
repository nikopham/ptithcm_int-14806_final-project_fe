import { createApi } from "@reduxjs/toolkit/query/react";
import type { Genre, GenreSearchParams, GenreRequest } from "@/types/genre";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type { GenreWithMovies } from "@/types/home";

export const genreApi = createApi({
  reducerPath: "genreApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Genres"],
  endpoints: (builder) => ({
    searchGenres: builder.query<PageResponse<Genre>, GenreSearchParams>({
      query: (params) => ({
        url: "/api/v1/genres/search",
        method: "GET",
        params: {
          ...params,

          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),

      transformResponse: (response: ServiceResult<PageResponse<Genre>>) => {
        return response.data as PageResponse<Genre>;
      },
      keepUnusedDataFor: 60,
    }),
    getAllGenres: builder.query<Genre[], void>({
      query: () => ({ url: "/api/v1/genres/get-all", method: "GET" }),
      transformResponse: (res: ServiceResult) => res.data,
      keepUnusedDataFor: 300,
    }),
    createGenre: builder.mutation<Genre, GenreRequest>({
      query: (body) => ({
        url: "/api/v1/genres/add",
        method: "POST",
        data: body,
      }),
      transformResponse: (res: ServiceResult<Genre>) => res.data as Genre,
      invalidatesTags: ["Genres"],
    }),

    updateGenre: builder.mutation<Genre, { id: number; body: GenreRequest }>({
      query: ({ id, body }) => ({
        url: `/api/v1/genres/update/${id}`,
        method: "PUT",
        data: body,
      }),
      transformResponse: (res: ServiceResult<Genre>) => res.data as Genre,
      invalidatesTags: ["Genres"],
    }),
    getFeaturedGenres: builder.query<
      GenreWithMovies[],
      { isSeries?: boolean } | void
    >({
      query: (params) => ({
        url: "/api/v1/genres/featured",
        method: "GET",
        params: params || {}, // Truyền params { isSeries: true/false }
      }),
      transformResponse: (res: ServiceResult<GenreWithMovies[]>) => res.data,
      keepUnusedDataFor: 300,
    }),
    deleteGenre: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/genres/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Genres"],
    }),
  }),
});

export const {
  useSearchGenresQuery,
  useGetFeaturedGenresQuery,
  useGetAllGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = genreApi;
