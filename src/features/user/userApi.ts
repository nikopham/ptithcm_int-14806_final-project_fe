import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { PageResponse, ServiceResult } from "@/types/common";
import type {
  AdminPasswordResetRequest,
  AdminSearchParams,
  ChangePasswordRequest,
  User,
  UserPasswordChangeRequest,
  UserProfile,
  UserSearchParams,
} from "@/types/user";
import { createApi } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["UserProfile"],

  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/v1/users/update/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (res: ServiceResult<User>) => res.data,
      invalidatesTags: ["UserProfile"],
    }),

    changePassword: builder.mutation<
      void,
      { id: string; body: ChangePasswordRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/users/update/${id}/password`,
        method: "PUT",
        data: body,
      }),
    }),
    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: "/api/users/me",
        method: "GET",
      }),
      transformResponse: (response: ServiceResult<UserProfile>) =>
        response.data,

      keepUnusedDataFor: 0,
    }),
    searchViewers: builder.query<PageResponse<User>, UserSearchParams>({
      query: (params) => ({
        url: "/api/users/search-viewers",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),
      transformResponse: (res: ServiceResult<PageResponse<User>>) => res.data,
      providesTags: ["UserProfile"],
    }),
    updateUserStatus: builder.mutation<User, { id: string; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/api/users/update/${id}/status`,
        method: "PATCH",
        data: { active },
      }),
      transformResponse: (res: ServiceResult<User>) => res.data,
      invalidatesTags: ["UserProfile"],
    }),
    searchAdmins: builder.query<PageResponse<User>, AdminSearchParams>({
      query: (params) => ({
        url: "/api/users/search-admins",
        method: "GET",
        params: {
          ...params,
          page: params.page && params.page > 0 ? params.page - 1 : 0,
        },
      }),
      transformResponse: (res: ServiceResult<PageResponse<User>>) => res.data,
      providesTags: ["UserProfile"],
    }),

    createAdmin: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "/api/users/create-admin",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["UserProfile"],
    }),

    updateAdmin: builder.mutation<User, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/api/users/update-admin/${id}`,
        method: "PUT",
        data: body,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["UserProfile"],
    }),

    resetAdminPassword: builder.mutation<
      void,
      { id: string; body: AdminPasswordResetRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/users/update-admin/${id}/password`,
        method: "PUT",
        data: body,
      }),
    }),

    deleteAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/users/delete-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserProfile"],
    }),

    updateUserProfile: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "/api/users/update-profile",
        method: "PUT",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (res: ServiceResult<User>) => res.data,
      invalidatesTags: ["UserProfile"],
    }),

    changePasswordUserProfile: builder.mutation<
      void,
      UserPasswordChangeRequest
    >({
      query: (body) => ({
        url: "/api/users/update-profile-password",
        method: "PUT",
        data: body,
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useSearchViewersQuery,
  useUpdateUserStatusMutation,
  useSearchAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useResetAdminPasswordMutation,
  useDeleteAdminMutation,
  useUpdateUserProfileMutation,
  useChangePasswordUserProfileMutation,
} = userApi;
