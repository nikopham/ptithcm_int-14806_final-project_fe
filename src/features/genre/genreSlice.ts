// src/features/genre/genreSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGenresAsync,
  searchTmdbGenresAsync,
  createGenreAsync,
  updateGenreAsync,
} from "./genreThunks";
import type { GenreListItem, TmdbGenre } from "@/types/genre";

interface GenreState {
  list: GenreListItem[];
  listPage: number;
  listTotalPages: number;
  listTotalElements: number; // (Thêm cái này nếu muốn hiển thị tổng số)

  tmdbResults: TmdbGenre[];
  tmdbStatus: "idle" | "loading" | "succeeded" | "failed";
  // (MỚI) State cho Create Genre (Form Submit)
  createStatus: "idle" | "loading" | "succeeded" | "failed";

  updateStatus: "idle" | "loading" | "succeeded" | "failed";

  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: GenreState = {
  list: [],
  listPage: 0,
  listTotalPages: 1,
  listTotalElements: 0,

  tmdbResults: [],
  tmdbStatus: "idle",

  createStatus: "idle",

  updateStatus: "idle",

  status: "idle",
  error: null,
};

export const genreSlice = createSlice({
  name: "genre",
  initialState,
  reducers: {
    // Action để reset list khi component unmount hoặc filter thay đổi
    clearGenreList: (state) => {
      state.list = [];
      state.listPage = 0;
      state.listTotalPages = 1;
      state.status = "idle";
    },

    clearTmdbResults: (state) => {
      state.tmdbResults = [];
      state.tmdbStatus = "idle";
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.error = null;
    },

    resetUpdateStatus: (state) => {
      state.updateStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGenresAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGenresAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.listPage = action.payload.page;
        state.listTotalPages = action.payload.totalPages;
        state.listTotalElements = action.payload.totalElements;

        // Logic: Luôn thay thế list (Phân trang truyền thống)
        state.list = action.payload.content;
      })
      .addCase(fetchGenresAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(searchTmdbGenresAsync.pending, (state) => {
        state.tmdbStatus = "loading";
      })
      .addCase(searchTmdbGenresAsync.fulfilled, (state, action) => {
        state.tmdbStatus = "succeeded";
        state.tmdbResults = action.payload;
      })
      .addCase(searchTmdbGenresAsync.rejected, (state) => {
        state.tmdbStatus = "failed";
        state.tmdbResults = [];
      })

      .addCase(createGenreAsync.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createGenreAsync.fulfilled, (state) => {
        state.createStatus = "succeeded";
        // Không cần push vào list, vì chúng ta sẽ re-fetch lại list
        // để đảm bảo tính nhất quán (sort, pagination)
      })
      .addCase(createGenreAsync.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload as string;
      })

      .addCase(updateGenreAsync.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updateGenreAsync.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        // Cập nhật item trong list hiện tại để khỏi fetch lại
        const index = state.list.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          // Backend trả về Genre entity, frontend dùng GenreListItem (có thể thiếu movieCount)
          // Chúng ta giữ nguyên movieCount cũ, chỉ update name/tmdb_id
          state.list[index] = {
            ...state.list[index],
            name: action.payload.name,
            // tmdbId: action.payload.tmdbId (nếu List item có trường này)
          };
        }
      })
      .addCase(updateGenreAsync.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearGenreList, clearTmdbResults, resetCreateStatus, resetUpdateStatus } = genreSlice.actions;
export default genreSlice.reducer;
