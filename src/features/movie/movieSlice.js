import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  newFeedList: [],
  categoriesMovie: [],
  recommendList: [],
  topActors: [],
  genres: [],
  country: [],
  searchResult: [],
  pagination: {
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  movieInfoDetail: null,
  importFormDetails: null,
  detail: null,
  loading: false,
  error: null,
};

const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovies: (state, action) => {
      const { movies, pagination } = action.payload;
      state.list = movies;
      state.pagination = pagination;
      state.error = null;
    },
    setNewFeedMovies: (state, action) => {
      const listMovie = action.payload;
      state.newFeedList = listMovie;
      state.error = null;
    },
    setCategoriesMovie: (state, action) => {
      const listMovie = action.payload;
      state.categoriesMovie = listMovie;
      state.error = null;
    },
    setTopActors: (state, action) => {
      const actors = action.payload;
      state.topActors = actors;
      state.error = null;
    },
    setGenres: (state, action) => {
      const genres = action.payload;
      state.genres = genres;
      state.error = null;
    },
    setCountry: (state, action) => {
      const country = action.payload;
      state.country = country;
      state.error = null;
    },
    setMoviesSearchResult: (state, action) => {
      const movies = action.payload;
      state.searchResult = movies;
    },
    setImportFormDetails: (state, action) => {
      const movies = action.payload;
      state.importFormDetails = movies;
    },
    setRecommendList: (state, action) => {
      const movies = action.payload;
      state.recommendList = movies;
    },
    setCurrentMovieDetail: (state, action) => {
      const movies = action.payload;
      state.movieInfoDetail = movies;
    },
    clearImportFormDetails: (state, action) => {
      state.importFormDetails = null;
    },
    clearMoviesSearchResult: (state, action) => {
      state.searchResult = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    toggleMovieLikeStatus: (state, action) => {
      const { movieId, isLiked } = action.payload;

      // 1. Tìm và cập nhật trạng thái trong newFeedList
      const movieIndex = state.newFeedList.findIndex(
        (movie) => movie.id === movieId
      );

      if (movieIndex !== -1) {
    
        state.newFeedList[movieIndex].isLiked = isLiked;
      }

       const movieIndex2 = state.recommendList.findIndex(
         (movie) => movie.id === movieId
       );
      
       if (movieIndex2 !== -1) {
         state.recommendList[movieIndex2].isLiked = isLiked;
       }

      state.categoriesMovie.forEach((category) => {
        const catMovieIndex = category.movies.findIndex(
          (movie) => movie.id == movieId
        );
        if (catMovieIndex !== -1) {
          category.movies[catMovieIndex].isLiked = isLiked;
        }
      });
    },
    toggleMovieFilterLikeStatus: (state, action) => {
      const { movieId, isLiked } = action.payload;

      const movieIndex = state.list.findIndex((movie) => movie.id === movieId);

      if (movieIndex !== -1) {
        state.list[movieIndex].isLiked = isLiked;
      }
    },
  },
});

export const {
  setMovies,
  setLoading,
  setError,
  setGenres,
  setCountry,
  setRecommendList,
  setCurrentMovieDetail,
  setNewFeedMovies,
  setCategoriesMovie,
  setMoviesSearchResult,
  clearMoviesSearchResult,
  setImportFormDetails,
  clearImportFormDetails,
  toggleMovieLikeStatus,
  toggleMovieFilterLikeStatus,
  setTopActors,
} = movieSlice.actions;

export default movieSlice.reducer;
