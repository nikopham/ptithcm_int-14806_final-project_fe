// src/features/movie/movieSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import {
  searchMediaAsync,
  fetchDetailsAsync,
  fetchMovieFormDataAsync,
  addMovieAsync,
  fetchMoviesAsync,
  fetchMovieByIdAsync, // <-- MỚI
  updateMovieAsync, // <-- MỚI
  updateSeasonAsync,
} from "./movieThunks";
import type {
  TmdbSearchItem,
  MovieDetailDto,
  TvDetailDto,
  Genre,
  Country,
  MovieListItem,
  SeasonWithEpisodes,
} from "@/types/movie";

interface MovieState {
  results: TmdbSearchItem[];
  currentPage: number;
  totalPages: number;
  searchStatus: "idle" | "loading" | "succeeded" | "failed";

  currentMovie: MovieDetailDto | null;
  currentTv: TvDetailDto | null;
  detailsStatus: "idle" | "loading" | "succeeded" | "failed";

  allGenres: Genre[];
  allCountries: Country[];
  formDataStatus: "idle" | "loading" | "succeeded" | "failed";

  addStatus: "idle" | "loading" | "succeeded" | "failed";

  list: MovieListItem[];
  listPage: number;
  listTotalPages: number;
  listStatus: "idle" | "loading" | "succeeded" | "failed";

  // (ĐỔI TÊN) 'addStatus' -> 'submitStatus' (dùng chung cho Add/Update)
  submitStatus: "idle" | "loading" | "succeeded" | "failed";

  error: string | null;
}

const initialState: MovieState = {
  results: [],
  currentPage: 0,
  totalPages: 1,
  searchStatus: "idle",
  currentMovie: null,
  currentTv: null,
  detailsStatus: "idle",
  allGenres: [],
  allCountries: [],
  formDataStatus: "idle",
  addStatus: "idle",
  submitStatus: "idle",
  list: [],
  listPage: 0,
  listTotalPages: 1,
  listStatus: "idle",

  error: null,
};

export const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.currentPage = 0;
      state.totalPages = 1;
      state.searchStatus = "idle";
    },
    clearMovieDetails: (state) => {
      state.currentMovie = null;
      state.currentTv = null;
      state.detailsStatus = "idle";
    },
    resetAddStatus: (state) => {
      state.addStatus = "idle";
      state.error = null;
    },
    clearMovieList: (state) => {
      state.list = [];
      state.listPage = 0;
      state.listTotalPages = 1;
      state.listStatus = "idle";
    },
    resetSubmitStatus: (state) => {
      state.submitStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ─── Search ─── */
      .addCase(searchMediaAsync.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchMediaAsync.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.total_pages;
        if (action.meta.arg.page === 1) {
          state.results = action.payload.results;
        } else {
          state.results.push(...action.payload.results);
        }
      })
      .addCase(searchMediaAsync.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.error = action.payload as string;
      })

      /* ─── Fetch Details ─── */
      .addCase(fetchDetailsAsync.pending, (state) => {
        state.detailsStatus = "loading";
        state.currentMovie = null;
        state.currentTv = null;
      })
      .addCase(fetchDetailsAsync.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        if (action.meta.arg.type === "movie") {
          state.currentMovie = action.payload as MovieDetailDto;
        } else {
          state.currentTv = action.payload as TvDetailDto;
        }
      })
      .addCase(fetchDetailsAsync.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload as string;
      })

      /* ─── Fetch Form Data ─── */
      .addCase(fetchMovieFormDataAsync.pending, (state) => {
        state.formDataStatus = "loading";
      })
      .addCase(fetchMovieFormDataAsync.fulfilled, (state, action) => {
        state.formDataStatus = "succeeded";
        state.allGenres = action.payload.genres;
        state.allCountries = action.payload.countries;
      })
      .addCase(fetchMovieFormDataAsync.rejected, (state, action) => {
        state.formDataStatus = "failed";
        state.error = action.payload as string;
      })

      /* ─── (MỚI) Xử lý Add Movie (Submit) ─── */
      .addCase(addMovieAsync.pending, (state) => {
        state.addStatus = "loading";
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(addMovieAsync.fulfilled, (state) => {
        state.addStatus = "succeeded";
        state.submitStatus = "succeeded";
      })
      .addCase(addMovieAsync.rejected, (state, action) => {
        state.addStatus = "failed";
        state.submitStatus = "failed";
        state.error = action.payload as string;
        // (Interceptor sẽ hiển thị modal lỗi)
      })

      .addCase(fetchMoviesAsync.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchMoviesAsync.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.listPage = action.payload.page;
        state.listTotalPages = action.payload.totalPages;
        state.list = action.payload.content;
      })
      .addCase(fetchMoviesAsync.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchMovieByIdAsync.pending, (state) => {
        state.detailsStatus = "loading";
        state.currentMovie = null;
        state.currentTv = null;
      })
      .addCase(fetchMovieByIdAsync.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        // (Giống hệt 'fetchDetailsAsync')
        if ((action.payload as any).media_type === "movie") {
          state.currentMovie = action.payload as MovieDetailDto;
        } else {
          state.currentTv = action.payload as TvDetailDto;
        }
      })
      .addCase(fetchMovieByIdAsync.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload as string;
      })

      /* ─── (MỚI) Xử lý Update Movie (Submit) ─── */
      .addCase(updateMovieAsync.pending, (state) => {
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(updateMovieAsync.fulfilled, (state) => {
        state.submitStatus = "succeeded";
      })
      .addCase(updateMovieAsync.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload as string;
      })

      /* ─── (MỚI) Xử lý Update Season ─── */
      .addCase(updateSeasonAsync.pending, (state) => {
        // (Bạn có thể thêm state loading riêng cho season)
      })
      .addCase(updateSeasonAsync.fulfilled, (state, action) => {
        const updatedSeason = action.payload as SeasonWithEpisodes;
        // Cập nhật 'currentTv' (nếu nó tồn tại)
        if (state.currentTv && state.currentTv.seasons) {
          // Tìm index của season cũ
          const index = state.currentTv.seasons.findIndex(
            (s) =>
              s.id === updatedSeason.id ||
              s.season_number === updatedSeason.season_number
          );
          if (index !== -1) {
            // Thay thế season cũ bằng season mới (đã cập nhật)
            state.currentTv.seasons[index] = updatedSeason;
          }
        }
      })
      .addCase(updateSeasonAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSearchResults,
  clearMovieDetails,
  resetAddStatus,
  clearMovieList,
  resetSubmitStatus,
} = movieSlice.actions;
export default movieSlice.reducer;
