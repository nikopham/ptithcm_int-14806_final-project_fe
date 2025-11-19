// src/services/movieApi.ts

import { api } from "@/lib/axios";
import type {
  SearchMovieResult,
  MovieDetailsResult,
  TvDetailsResult,
  GenreListResult,
  CountryListResult,
  TvSeasonDetailsResult,
  MovieRequestDto, // <-- 1. Import
  AddMovieResult,
  MovieListResult,
  MovieStatus,
  GetMovieByIdResult, // <-- MỚI
  UpdateSeasonDto, // <-- MỚI
  UpdateSeasonResult,
} from "@/types/movie";

// 1a. API Tìm kiếm MOVIE
const searchTmdbMovie = (
  query: string,
  page: number
): Promise<SearchMovieResult> => {
  return api.get("/api/movies/search/movie", {
    params: { query, page },
  });
};

// 1b. API Tìm kiếm TV
const searchTmdbTv = (
  query: string,
  page: number
): Promise<SearchMovieResult> => {
  return api.get("/api/movies/search/tv", {
    params: { query, page },
  });
};

// 2a. API Lấy chi tiết MOVIE
const getTmdbMovieDetails = (tmdbId: number): Promise<MovieDetailsResult> => {
  return api.get(`/api/movies/details/movie/${tmdbId}`);
};

// 2b. API Lấy chi tiết TV
const getTmdbTvDetails = (tmdbId: number): Promise<TvDetailsResult> => {
  return api.get(`/api/movies/details/tv/${tmdbId}`);
};

// 3. API lấy Genres
const getAllGenres = (): Promise<GenreListResult> => {
  return api.get("/api/movies/genres");
};

// 4. API lấy Countries
const getAllCountries = (): Promise<CountryListResult> => {
  return api.get("/api/movies/countries");
};

const getTmdbTvSeasonDetails = (
  tvId: number,
  seasonNumber: number
): Promise<TvSeasonDetailsResult> => {
  // Backend API đã được tạo ở bước trước
  return api.get(`/api/movies/details/tv/${tvId}/season/${seasonNumber}`);
};

const addMovie = (payload: MovieRequestDto): Promise<AddMovieResult> => {
  return api.post("/api/movies/add", payload);
};

export interface GetMoviesParams {
  query?: string;
  status?: MovieStatus | null; // (Backend nhận Enum hoặc null)
  isSeries?: boolean | null; // (Backend nhận boolean hoặc null)
  page: number;
  size: number;
}

const getMovies = (params: GetMoviesParams): Promise<MovieListResult> => {
  return api.get("/api/movies/list", {
    params: params, // Gửi các tham số
  });
};

/**
 * (MỚI) API GET để LẤY Movie/TV (từ DB) bằng UUID
 */
const getMovieById = (id: string): Promise<GetMovieByIdResult> => {
  return api.get(`/api/movies/detail/${id}`);
};

/**
 * (MỚI) API PUT để CẬP NHẬT Movie/TV (dùng FormData)
 */
const updateMovie = (
  id: string,
  payload: FormData
): Promise<AddMovieResult> => {
  return api.put(`/api/movies/update/${id}`, payload);
};

/**
 * (MỚI) API PUT để CẬP NHẬT Season/Episodes (dùng JSON)
 */
const updateSeason = (
  id: string,
  payload: UpdateSeasonDto
): Promise<UpdateSeasonResult> => {
  return api.put(`/api/seasons/update/${id}`, payload);
};


export const movieApi = {
  searchTmdbMovie,
  searchTmdbTv,
  getTmdbMovieDetails,
  getTmdbTvDetails,
  getAllGenres,
  getAllCountries,
  getTmdbTvSeasonDetails,
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  updateSeason,
};
