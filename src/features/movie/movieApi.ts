import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Movie,
  MovieDetail,
  MovieDetailResponse,
  MovieSearchParams,
  VideoStatusResponse,
  WatchProgressRequest,
} from "@/types/movie";
import type { PageResponse, ServiceResult } from "@/types/common";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { MovieShort } from "@/types/home";
import type { Review } from "@/types/review";

export const movieApi = createApi({
  reducerPath: "movieApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Movies"],

  endpoints: (builder) => ({
    searchMovies: builder.query<PageResponse<Movie>, MovieSearchParams>({
      query: (params) => ({
        url: "/api/v1/movies/search",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),

      transformResponse: (response: ServiceResult<PageResponse<Movie>>) => {
        return response.data;
      },
      providesTags: ["Movies"],
    }),

    searchMoviesLiked: builder.query<PageResponse<Movie>, MovieSearchParams>({
      query: (params) => ({
        url: "/api/v1/movies/search-liked",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),

      transformResponse: (response: ServiceResult<PageResponse<Movie>>) => {
        return response.data;
      },
      providesTags: ["Movies"],
    }),

    searchWatchedMovies: builder.query<PageResponse<Movie>, MovieSearchParams>({
      query: (params) => ({
        url: "/api/v1/movies/watched",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),

      transformResponse: (response: ServiceResult<PageResponse<Movie>>) => {
        return response.data;
      },
      providesTags: ["Movies"],
    }),

    createMovie: builder.mutation<Movie, FormData>({
      query: (formData) => ({
        url: "/api/v1/movies/add",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      transformResponse: (response: ServiceResult) => {
        return response.data;
      },
      invalidatesTags: ["Movies"],
    }),
    getTop10Movie: builder.query<MovieShort[], { isSeries?: boolean } | void>({
      query: (params) => ({
        url: "/api/v1/movies/top-10",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (res: ServiceResult<MovieShort[]>) => res.data,
      keepUnusedDataFor: 300,
    }),
    getMovieInfo: builder.query<MovieDetail, string>({
      query: (id) => ({
        url: `/api/v1/movies/${id}/info`,
        method: "GET",
      }),
      transformResponse: (res: ServiceResult<MovieDetail>) => res.data,
    }),

    updateMovie: builder.mutation<MovieDetail, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/v1/movies/update/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "multipart/form-data" },
      }),

      invalidatesTags: (result, error, { id }) => [
        "Movies",
        { type: "Movies", id },
      ],
    }),
    deleteMovie: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/movies/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Movies"],
    }),

    getMovieReviews: builder.query<
      PageResponse<Review>,
      { movieId: string; page: number; size: number }
    >({
      query: ({ movieId, page, size }) => ({
        url: `/api/v1/movies/detail/${movieId}/reviews`,
        method: "GET",
        params: {
          page: page > 0 ? page - 1 : 0,
          size,
          sort: "createdAt,desc",
        },
      }),
      transformResponse: (res: ServiceResult<PageResponse<Review>>) => res.data,
      keepUnusedDataFor: 60,
    }),

    getMovieDetail: builder.query<MovieDetailResponse, string>({
      query: (id) => ({
        url: `/api/v1/movies/detail/${id}`,
        method: "GET",
      }),
      transformResponse: (res: ServiceResult<MovieDetailResponse>) =>
        res.data as MovieDetailResponse,
      providesTags: (_result, _error, id) => [{ type: "Movies", id }],
    }),

    toggleLikeMovie: builder.mutation<string, string>({
      query: (movieId) => ({
        url: `/api/v1/movies/like/${movieId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, movieId) => [
        { type: "Movies", id: movieId },
      ],
    }),

    saveProgress: builder.mutation<void, WatchProgressRequest>({
      query: (body) => ({
        url: '/api/v1/movies/progress',
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const {
  useSearchMoviesQuery,
  useCreateMovieMutation,
  useGetTop10MovieQuery,
  useGetMovieInfoQuery,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useGetMovieReviewsQuery,
  useGetMovieDetailQuery,
  useToggleLikeMovieMutation,
  useSearchMoviesLikedQuery,
  useSearchWatchedMoviesQuery,
  useSaveProgressMutation
} = movieApi;
