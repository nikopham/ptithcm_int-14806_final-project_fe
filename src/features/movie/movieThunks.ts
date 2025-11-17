// src/features/movie/movieThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  TmdbSearchResponse,
  MovieDetailDto,
  TvDetailDto,
  MovieFormData,
} from "@/types/movie";
import { movieApi } from "./movieApi";

// 1. Thunk TÌM KIẾM (Chuẩn hóa)
export const searchMediaAsync = createAsyncThunk<
  TmdbSearchResponse,
  { query: string; page: number; type: "movie" | "tv" },
  { rejectValue: string }
>("movie/searchMedia", async ({ query, page, type }, { rejectWithValue }) => {
  try {
    const response =
      type === "movie"
        ? await movieApi.searchTmdbMovie(query, page)
        : await movieApi.searchTmdbTv(query, page);

    // Chuẩn hóa DTO (Backend trả về 'name' cho TV, 'title' cho Movie)
    const standardizedResults = response.data.results.map((item: any) => ({
      id: item.id,
      title: item.title || item.name, // <-- Chuẩn hóa
      poster_path: item.poster_path,
      release_date: item.release_date || item.first_air_date,
      media_type: type,
    }));

    return {
      ...response.data,
      results: standardizedResults,
    };
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Search failed";
    return rejectWithValue(message);
  }
});

// 2. Thunk LẤY CHI TIẾT (Hợp nhất)
export const fetchDetailsAsync = createAsyncThunk<
  MovieDetailDto | TvDetailDto,
  { tmdbId: number; type: "movie" | "tv" },
  { rejectValue: string }
>("movie/fetchDetails", async ({ tmdbId, type }, { rejectWithValue }) => {
  try {
    const response =
      type === "movie"
        ? await movieApi.getTmdbMovieDetails(tmdbId)
        : await movieApi.getTmdbTvDetails(tmdbId);

    return { ...response.data, media_type: type }; // Gắn media_type
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch details";
    return rejectWithValue(message);
  }
});

// 3. Thunk LẤY DỮ LIỆU FORM (Genres/Countries)
export const fetchMovieFormDataAsync = createAsyncThunk<
  MovieFormData,
  void,
  { rejectValue: string }
>("movie/fetchFormData", async (_, { rejectWithValue }) => {
  try {
    const [genresRes, countriesRes] = await Promise.all([
      movieApi.getAllGenres(),
      movieApi.getAllCountries(),
    ]);
    return {
      genres: genresRes.data,
      countries: countriesRes.data,
    };
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch form data";
    return rejectWithValue(message);
  }
});
