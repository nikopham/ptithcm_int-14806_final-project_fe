// src/services/genreApi.ts

import { api } from "@/lib/axios";
import type { ServiceResult } from "@/types/common";
import type {
  GenreListResult,
  GetGenresParams,
  TmdbGenre,
} from "@/types/genre";

/**
 * API Lấy danh sách Genre (có phân trang, tìm kiếm, đếm phim)
 * Endpoint: GET /api/genres/search
 */
const getGenres = (params: GetGenresParams): Promise<GenreListResult> => {
  return api.get("/api/genres/list", {
    params: params,
  });
};

const searchTmdbGenres = (
  query: string
): Promise<ServiceResult<TmdbGenre[]>> => {
  return api.get("/api/genres/tmdb/genres", {
    params: { query },
  });
};

const updateGenre = (
  id: number,
  data: { name: string; tmdbId: number | null }
): Promise<any> => {
  return api.put(`/api/genres/update/${id}`, data);
};

// (Ví dụ API create, bạn sẽ cần cái này để lưu)
const createGenre = (data: {
  name: string;
  tmdbId: number | null;
}): Promise<any> => {
  return api.post("/api/genres/add", data);
};

export const genreApi = {
  getGenres,
  searchTmdbGenres, // <-- Thêm
  createGenre,
  updateGenre,
};
