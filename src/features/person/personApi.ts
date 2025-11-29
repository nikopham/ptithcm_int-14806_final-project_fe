import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type { Person, PersonSearchParams } from "@/types/person";
import { createApi } from "@reduxjs/toolkit/query/react";

export const personApi = createApi({
  reducerPath: "personApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["People"],
  endpoints: (builder) => ({
    searchPeople: builder.query<PageResponse<Person>, PersonSearchParams>({
      query: (params) => ({
        url: "/api/v1/people/search",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),
      transformResponse: (res: ServiceResult<PageResponse<Person>>) =>
        res.data as PageResponse<Person>,

      keepUnusedDataFor: 60,
    }),

    createPerson: builder.mutation<Person, FormData>({
      query: (formData) => ({
        url: "/api/v1/people/add",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (res: ServiceResult<Person>) => res.data as Person,
      invalidatesTags: ["People"],
    }),

    updatePerson: builder.mutation<Person, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/v1/people/update/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (res: ServiceResult<Person>) => res.data as Person,
      invalidatesTags: ["People"],
    }),
    deletePerson: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/people/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["People"],
    }),
  }),
});

export const {
  useSearchPeopleQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
} = personApi;
