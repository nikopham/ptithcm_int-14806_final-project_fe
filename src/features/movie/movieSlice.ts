// src/features/movie/movieSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import {
  searchMediaAsync,
  fetchDetailsAsync,
  fetchMovieFormDataAsync,
} from "./movieThunks";
import type {
  TmdbSearchItem,
  MovieDetailDto,
  TvDetailDto,
  Genre,
  Country,
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
      });
  },
});

export const { clearSearchResults, clearMovieDetails } = movieSlice.actions;
export default movieSlice.reducer;
