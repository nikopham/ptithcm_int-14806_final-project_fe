// src/features/genre/genreThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { GetGenresParams, GenreListItem, TmdbGenre } from "@/types/genre";
import type { PagedResponse } from "@/types/movie"; // Tái sử dụng
import { genreApi } from "./genreApi";

/**
 * Thunk lấy danh sách Genre
 */
export const fetchGenresAsync = createAsyncThunk<
  PagedResponse<GenreListItem>, // Kiểu trả về thành công
  GetGenresParams, // Tham số đầu vào
  { rejectValue: string }
>("genre/fetchList", async (params, { rejectWithValue }) => {
  try {
    const response = await genreApi.getGenres(params);
    return response.data; // Trả về PagedResponse
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch genres";
    return rejectWithValue(message);
  }
});

export const searchTmdbGenresAsync = createAsyncThunk<
  TmdbGenre[], // Trả về mảng genre
  string, // Input là query string
  { rejectValue: string }
>("genre/searchTmdb", async (query, { rejectWithValue }) => {
  try {
    const response = await genreApi.searchTmdbGenres(query);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Search failed");
  }
});

export const createGenreAsync = createAsyncThunk(
  "genre/create",
  async (
    data: { name: string; tmdbId: number | null },
    { rejectWithValue }
  ) => {
    try {
      const response = await genreApi.createGenre(data);
      if (!response.success) throw new Error(response.message);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create genre");
    }
  }
);

export const updateGenreAsync = createAsyncThunk(
  "genre/update",
  async (
    { id, data }: { id: number; data: { name: string; tmdbId: number | null } },
    { rejectWithValue }
  ) => {
    try {
      const response = await genreApi.updateGenre(id, data);
      if (!response.success) throw new Error(response.message);
      return response.data; // Trả về Genre đã update
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update genre");
    }
  }
);