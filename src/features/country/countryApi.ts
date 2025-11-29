import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { ServiceResult } from "@/types/common";
import type { Country } from "@/types/country";

export const countryApi = createApi({
  reducerPath: "countryApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getAllCountries: builder.query<Country[], void>({
      query: () => ({ url: "/api/v1/countries/get-all", method: "GET" }),
      transformResponse: (res: ServiceResult) => res.data,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllCountriesQuery } = countryApi;
