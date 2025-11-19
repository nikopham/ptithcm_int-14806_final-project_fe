// src/types/movie.ts

import type { ServiceResult } from "./common";

// Các type con cho MovieDetailDto
export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Genre {
  id: number; // id trong DB (null nếu là genre mới)
  tmdb_id: number;
  name: string;
}
export interface Country {
  id: number;
  iso_code: string;
  name: string;
}

// 1. Type cho KẾT QUẢ TÌM KIẾM (danh sách)
export interface MovieItemDto {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
}
export interface TmdbSearchItem {
  id: number;
  title: string; // (Sẽ là 'name' của TV hoặc 'title' của Movie)
  poster_path: string | null;
  release_date: string; // (Sẽ là 'first_air_date' của TV)
  media_type: "movie" | "tv"; // <-- Quan trọng
}
// 2. Type cho PHẢN HỒI API TÌM KIẾM (có phân trang)
export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchItem[];
  total_pages: number;
}

// 3. Type cho CHI TIẾT PHIM (auto-fill)
// (Khớp với MovieDetailDto.java đã "làm phẳng")
export interface MovieDetailDto {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[]; // Dùng DTO gốc
  production_countries: { iso_code: string; name: string }[]; // Dùng DTO gốc
  director: CrewMember | null;
  cast: CastMember[];
  trailer_key: string | null;
  imdb_id: string | null;
  media_type: "movie"; // Tự gán
}

export interface TvDetailDto {
  id: number;
  name: string; // -> title
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string; // -> release_date
  episode_run_time: number[]; // -> duration_min
  status: string;
  created_by: CrewMember[]; // -> director
  genres: Genre[];
  production_countries: Country[];
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }[];
  cast: CastMember[];
  trailer_key: string | null;
  imdb_id: string | null;
  duration: number; // (Trường này đã được chuẩn hóa ở backend)
}

export interface EpisodeDto {
  tmdb_id: number;
  name: string; // -> title
  overview: string; // -> synopsis
  air_date: string;
  episode_number: number;
  still_path: string | null;
  runtime: number; // -> duration_min
}

/**
 * 2. Type cho kết quả API Get Season Details
 */
export interface TvSeasonDetailDto {
  season_number: number;
  episodes: EpisodeDto[];
}

export interface MovieFormData {
  genres: Genre[];
  countries: Country[];
}


export interface CountryDto {
  iso_code: string;
  name: string;
}

export interface GenreDto {
  tmdb_id: number;
  name: string;
}

export interface PersonDto {
  id: number; // (tmdb_id)
  name: string;
  img: string; // (profile_path)
}

export interface SeasonDto {
  id: number; // (tmdb_id của Season)
  name: string;
  season_number: number;
}
export interface MovieRequestDto {
  tmdbId: number | null;
  imdbId: string | null;
  title: string;
  description: string;
  release: string; // (Năm, ví dụ: "2010")
  duration: number | null;
  poster: string; // (URL)
  backdrop: string; // (URL)
  trailerUrl: string | null; // (Key của Youtube)
  isSeries: boolean;
  age: string; // (Enum 'P', 'K', ...)
  status: string; // (Enum 'DRAFT', 'PUBLISHED', ...)

  countries: CountryDto[];
  genres: GenreDto[];
  director: PersonDto | null;
  actors: PersonDto[];

  seasons: SeasonDto[] | null; // (Chỉ dùng cho TV Series)
}
export type MovieStatus = "PUBLISHED" | "DRAFT" | "HIDDEN";
export interface MovieListItem {
  id: string; // UUID
  title: string;
  poster: string;
  release: string;
  duration: number;
  age: string; // (P, K, T13...)
  status: MovieStatus;
  view: number;
  series: boolean;
}
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
// --- (THÊM MỚI) DTOs cho API Update Season (PUT /api/seasons/{id}) ---

export interface UpdateEpisodeDto {
  id: string; // UUID của Episode trong DB
  title: string;
  durationMin: number | null;
  synopsis: string;
  stillPath: string | null;
  airDate: string | null; // (Gửi dạng "YYYY-MM-DD")
}

export interface UpdateSeasonDto {
  id: string; // UUID của Season trong DB
  title: string;
  episodes: UpdateEpisodeDto[];
}
export type GetMovieByIdResult = ServiceResult<MovieDetailDto | TvDetailDto>;

// (MỚI) Type cho UpdateSeason
export interface SeasonWithEpisodes {
  id: string; // UUID
  title: string;
  season_number: number;
  tmdbId: number;
  episodes: EpisodeDto[];
}
export type UpdateSeasonResult = ServiceResult<SeasonWithEpisodes>;
// 4. Định nghĩa các kiểu ServiceResult cụ thể
export type SearchMovieResult = ServiceResult<TmdbSearchResponse>;
export type MovieDetailsResult = ServiceResult<MovieDetailDto>;
export type TvDetailsResult = ServiceResult<TvDetailDto>;
export type GenreListResult = ServiceResult<Genre[]>;
export type CountryListResult = ServiceResult<Country[]>;
export type TvSeasonDetailsResult = ServiceResult<TvSeasonDetailDto>;
export type AddMovieResult = ServiceResult<null>;
export type MovieListResult = ServiceResult<PagedResponse<MovieListItem>>;
