import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { DashboardOverviewResponse, GenreStatResponse } from "@/types/dashboard";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Dashboard"],

  endpoints: (builder) => ({
    getOverview: builder.query<DashboardOverviewResponse, void>({
      query: () => ({
        url: "/api/v1/dashboard/overview",
        method: "GET",
      }),
      transformResponse: (res: DashboardOverviewResponse) => res,
      providesTags: ["Dashboard"],
    }),

    getViewsChart: builder.query<number[], number | void>({
      query: (year) => ({
        url: "/api/v1/dashboard/views-chart",
        method: "GET",
        params: year ? { year } : {},
      }),
      transformResponse: (res: number[]) => res || [],
      providesTags: ["Dashboard"],
    }),

    getTopGenres: builder.query<GenreStatResponse[], void>({
      query: () => ({
        url: "/api/v1/dashboard/top-genres",
        method: "GET",
      }),
      transformResponse: (res: GenreStatResponse[]) => res || [],
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetViewsChartQuery,
  useGetTopGenresQuery,
} = dashboardApi;

