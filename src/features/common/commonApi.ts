import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { ServiceResult } from "@/types/common";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";

export const commonApi = createApi({
  reducerPath: "commonApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Countries", "Genres", "Years"],
  endpoints: (builder) => ({
    getPublishedGenres: builder.query<Genre[], void>({
      query: () => ({ url: "/api/v1/genres/published", method: "GET" }),
      transformResponse: (res: ServiceResult<Genre[]>) => res.data,
      keepUnusedDataFor: 300,
    }),

    getPublishedCountries: builder.query<Country[], void>({
      query: () => ({ url: "/api/v1/countries/published", method: "GET" }),
      transformResponse: (res: ServiceResult<Country[]>) => res.data,
      keepUnusedDataFor: 300,
    }),

    getReleaseYears: builder.query<number[], void>({
      query: () => ({ url: "/api/v1/movies/years", method: "GET" }),
      transformResponse: (res: ServiceResult<number[]>) => res.data,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetPublishedGenresQuery,
  useGetPublishedCountriesQuery,
  useGetReleaseYearsQuery,
} = commonApi;
