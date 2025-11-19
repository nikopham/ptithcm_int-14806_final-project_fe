// src/features/movie/movieThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  TmdbSearchResponse,
  MovieDetailDto,
  TvDetailDto,
  MovieFormData,
  MovieRequestDto,
  PagedResponse,
  MovieListItem,
  UpdateSeasonDto, // <-- MỚI
  SeasonWithEpisodes,
} from "@/types/movie";
import { movieApi, type GetMoviesParams } from "./movieApi";

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

export const addMovieAsync = createAsyncThunk<
  null,
  FormData, // <-- THAY ĐỔI: Nhận FormData
  { rejectValue: string }
>("movie/addMovie", async (payload, { rejectWithValue }) => {
  try {
    // Truyền thẳng FormData xuống service
    const response = await movieApi.addMovie(payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to save content";
    return rejectWithValue(message);
  }
});

export const fetchMoviesAsync = createAsyncThunk<
  PagedResponse<MovieListItem>, // Kiểu trả về khi thành công
  GetMoviesParams, // Tham số đầu vào
  { rejectValue: string }
>("movie/fetchList", async (params, { rejectWithValue }) => {
  try {
    const response = await movieApi.getMovies(params);
    return response.data; // Trả về PagedResponseDto
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch movies";
    return rejectWithValue(message);
  }
});

/**
 * (MỚI) Thunk này lấy Movie/TV TỪ DB (cho trang Edit)
 */
export const fetchMovieByIdAsync = createAsyncThunk<
  MovieDetailDto | TvDetailDto, // Trả về DTO giống TMDb
  string, // Tham số (uuid)
  { rejectValue: string }
>("movie/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await movieApi.getMovieById(id);
    // Backend trả về 'data' đã có 'isSeries'
    const data = response.data as any;
    // Gắn media_type để Slice biết
    return { ...data, media_type: data.isSeries ? "tv" : "movie" };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch item");
  }
});

/**
 * (MỚI) Thunk này CẬP NHẬT (PUT) Movie/TV
 */
export const updateMovieAsync = createAsyncThunk<
  null, // Kiểu trả về
  { id: string; payload: FormData }, // Tham số
  { rejectValue: string }
>("movie/updateMovie", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await movieApi.updateMovie(id, payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update content");
  }
});

/**
 * (MỚI) Thunk này CẬP NHẬT (PUT) Season/Episodes
 */
export const updateSeasonAsync = createAsyncThunk<
  SeasonWithEpisodes, // Kiểu trả về
  { id: string; payload: UpdateSeasonDto }, // Tham số
  { rejectValue: string }
>("movie/updateSeason", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await movieApi.updateSeason(id, payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update season");
  }
});