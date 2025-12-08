import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { AuthResponse } from "@/types/auth";
import type { ServiceResult } from "@/types/common";
import { createApi } from "@reduxjs/toolkit/query/react";

export const OAuthApi = createApi({
  reducerPath: "OAuthApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    loginByGoogle: builder.mutation<
      ServiceResult<AuthResponse>,
      { code: string }
    >({
      query: (body) => ({
        url: "/api/auth/google",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginByGoogleMutation } = OAuthApi;
