// src/types/genre.ts

import type { ServiceResult } from "./common";
import type { PagedResponse } from "./movie"; // Tái sử dụng type PagedResponse từ movie

// 1. Item trong danh sách (Khớp với GenreItemDto.java)
export interface GenreListItem {
  id: number;
  name: string;
  tmdbId: number | null;
  movieCount: number; // Số lượng phim
}

// 2. Tham số gửi lên API
export interface GetGenresParams {
  query?: string;
  page: number;
  size: number;
}

// (MỚI) Genre lấy từ API TMDB
export interface TmdbGenre {
  id: number;   // tmdb_id
  name: string;
}

// (MỚI) Payload để tạo mới Genre
export interface CreateGenreRequest {
  name: string;
  tmdbId: number | null; // Quan trọng
  // slug: string; (Nếu backend tự generate thì không cần gửi)
}

// 3. Kết quả trả về (ServiceResult bọc PagedResponse)
export type GenreListResult = ServiceResult<PagedResponse<GenreListItem>>;
