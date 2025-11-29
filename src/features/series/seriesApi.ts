import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { ServiceResult } from "@/types/common";
import type { Episode, EpisodeCreateRequest, EpisodeUpdateRequest, Season, SeasonCreateRequest, SeasonUpdateRequest } from "@/types/series";
import { createApi } from "@reduxjs/toolkit/query/react";


export const seriesApi = createApi({
  reducerPath: "seriesApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Seasons", "Episodes"],

  endpoints: (builder) => ({
    addSeason: builder.mutation<
      Season,
      { movieId: string; body: SeasonCreateRequest }
    >({
      query: ({ movieId, body }) => ({
        url: `/api/v1/movies/add/${movieId}/seasons`,
        method: "POST",
        data: body,
      }),
      transformResponse: (res: ServiceResult<Season>) => res.data,
      invalidatesTags: ["Seasons"],
    }),

    addEpisode: builder.mutation<
      Episode,
      { seasonId: string; body: EpisodeCreateRequest }
    >({
      query: ({ seasonId, body }) => ({
        url: `/api/v1/seasons/add/${seasonId}/episodes`,
        method: "POST",
        data: body,
      }),
      transformResponse: (res: ServiceResult<Episode>) => res.data,
      invalidatesTags: ["Episodes"],
    }),
    updateSeason: builder.mutation<
      void,
      { id: string; body: SeasonUpdateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/seasons/update/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Seasons"],
    }),

    // 3. Update Episode
    updateEpisode: builder.mutation<
      void,
      { id: string; body: EpisodeUpdateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/episodes/update/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Episodes"],
    }),
  }),
});

export const {
  useAddSeasonMutation,
  useAddEpisodeMutation,
  useUpdateSeasonMutation,
  useUpdateEpisodeMutation,
} = seriesApi;
