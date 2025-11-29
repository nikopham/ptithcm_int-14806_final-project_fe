import { createApi } from "@reduxjs/toolkit/query/react";
import type { ServiceResult } from "@/types/common";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { VideoStatusResponse } from "@/types/movie";

export interface VideoUploadResponse {
  uploadUrl: string;
  videoKey: string;
}

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getCloudflareUploadUrl: builder.mutation<
      { uploadUrl: string; videoUID: string },
      void
    >({
      query: () => ({
        url: "/api/v1/upload/video-url",
        method: "POST",
      }),
      transformResponse: (res: ServiceResult<any>) => res.data,
    }),
    getVideoStatus: builder.query<VideoStatusResponse, string>({
      query: (videoUid) => ({
        url: `/api/v1/movies/video-status/${videoUid}`,
        method: "GET",
      }),
      transformResponse: (res: ServiceResult<VideoStatusResponse>) => res.data,
    }),
  }),
});

export const { useGetCloudflareUploadUrlMutation, useGetVideoStatusQuery } = uploadApi;