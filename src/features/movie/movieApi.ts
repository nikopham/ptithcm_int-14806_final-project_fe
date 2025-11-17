// src/services/movieApi.ts

import { api } from "@/lib/axios";
import type {
  SearchMovieResult,
  MovieDetailsResult,
  TvDetailsResult,
  GenreListResult,
  CountryListResult,
  TvSeasonDetailsResult,
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
export const movieApi = {
  searchTmdbMovie,
  searchTmdbTv,
  getTmdbMovieDetails,
  getTmdbTvDetails,
  getAllGenres,
  getAllCountries,
  getTmdbTvSeasonDetails,
};
