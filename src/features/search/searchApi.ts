import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { ServiceResult } from "@/types/common";
import type { FastSearchResponse } from "@/types/search";
import { createApi } from "@reduxjs/toolkit/query/react";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    searchFast: builder.query<FastSearchResponse, string>({
      query: (query) => ({
        url: "/api/v1/search/fast",
        method: "GET",
        params: { query },
      }),
      transformResponse: (res: ServiceResult<FastSearchResponse>) => res.data,
      keepUnusedDataFor: 10,
    }),

    syncAllData: builder.mutation<string, void>({
      query: () => ({
        url: "/api/v1/search/sync-all",
        method: "POST",
      }),
      transformResponse: (res: any) => res.message || "Sync started",
    }),
  }),
});

export const { useSearchFastQuery, useSyncAllDataMutation } = searchApi;
