import {
  setMovies,
  setLoading,
  setError,
  setMoviesSearchResult,
  clearImportFormDetails,
  setImportFormDetails,
  clearMoviesSearchResult,
  setNewFeedMovies,
  setCategoriesMovie,
  setTopActors,
  setGenres,
  setCountry,
  setCurrentMovieDetail,
  setRecommendList,
  toggleMovieLikeStatus,
  toggleMovieFilterLikeStatus,
} from "@/features/movie/movieSlice";
import axios from "./axiosInstance";
import qs from "qs";

export const searchMoviesList = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });

    const res = await axios.get(`/movies?${query}`);

    const { movies, pagination } = res.data.data;

    dispatch(setMovies({ movies, pagination }));
    return { movies, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách phim, thử lại sau";
    dispatch(setError(msg));
    console.error("Search movies error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getPublicMovieDetails = async (dispatch, movieId) => {
  try {
    dispatch(setLoading(true));
    dispatch(setCurrentMovieDetail(null)); // Xóa phim cũ

    const res = await axios.get(`/movies/movie-info/${movieId}`);

    dispatch(setCurrentMovieDetail(res.data.data)); // Lưu phim mới
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Không thể tải chi tiết phim";
    dispatch(setError(msg));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const filterMoviesList = async (dispatch, params, accountId) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });

    const res = await axios.get(`/movies/filter`, {
      params: { accountId, ...params },
    });

    const { movies, pagination } = res.data.data;

    dispatch(setMovies({ movies, pagination }));
    return { movies, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách phim, thử lại sau";
    dispatch(setError(msg));
    console.error("Search movies error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchMovieByKeyword = async (dispatch, keyword) => {
  try {
    dispatch(setLoading(true));

    if (!keyword) {
      const msg = "Thiếu từ khóa tìm kiếm";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.get(`/movies/tmdb-search?query=${keyword}`);

    const movies = res?.data?.data;

    dispatch(setMoviesSearchResult(movies));

    return res?.data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tìm thông tin phim, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Search movie error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getTmdbDetailsForForm = async (dispatch, tmdbId, type) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearImportFormDetails()); // Xóa form cũ

    if (!tmdbId || !type) {
      const msg = "Thiếu TMDb ID hoặc loại phim";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.get(`/movies/tmdb-details`, {
      params: { tmdbId, type },
    });

    const details = res?.data?.data;

    dispatch(setImportFormDetails(details)); // Dispatch chi tiết vào store

    return res?.data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể lấy chi tiết phim, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Get details error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createMovieFromForm = async (dispatch, formData) => {
  try {
    dispatch(setLoading(true));

    if (!formData) {
      const msg = "Thiếu dữ liệu form";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.post(`/movies/create-from-form`, formData);

    dispatch(clearImportFormDetails());
    dispatch(clearMoviesSearchResult());

    return res?.data; // Trả về response thành công
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tạo phim, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Create movie error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getMovieDetailsForEdit = async (dispatch, movieId) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearImportFormDetails());

    const res = await axios.get(`movies/detail/${movieId}`);

    const details = res?.data?.data;
    dispatch(setImportFormDetails(details));
    return res?.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Không thể tải chi tiết phim";
    dispatch(setError(msg));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

// HÀM MỚI 2: Cập nhật phim
export const updateMovieForm = async (dispatch, movieId, formData) => {
  try {
    dispatch(setLoading(true));

    // Gọi API CẬP NHẬT
    const res = await axios.put(`movies/detail/${movieId}`, formData);

    // Cập nhật thành công, xóa form
    dispatch(clearImportFormDetails());
    return res?.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Không thể cập nhật phim";
    dispatch(setError(msg));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getNewFeedMovie = async (dispatch, accountId) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/new-feed`, {
      params: { accountId },
    });

    const listMovie = res.data.data;

    dispatch(setNewFeedMovies(listMovie));
    return listMovie;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách phim, thử lại sau";
    dispatch(setError(msg));
    console.error("Search movies error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getMovieByCategories = async (dispatch, accountId) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/movie-categories`, {
      params: { accountId },
    });

    const listMovie = res.data.data;

    dispatch(setCategoriesMovie(listMovie));
    return listMovie;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách phim, thử lại sau";
    dispatch(setError(msg));
    console.error("Search movies error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getTopActors = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/top-actors`);

    const listActor = res.data.data;

    dispatch(setTopActors(listActor));
    return listActor;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách diễn viên, thử lại sau";
    dispatch(setError(msg));
    console.error("Search actor error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getGenres = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/genres`);

    const listGenres = res.data.data;

    dispatch(setGenres(listGenres));
    return listGenres;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách thể loại, thử lại sau";
    dispatch(setError(msg));
    console.error("Search genre error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCountry = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/countries`);

    const listCountries = res.data.data;

    dispatch(setCountry(listCountries));
    return listCountries;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách quốc gia, thử lại sau";
    dispatch(setError(msg));
    console.error("Search country error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getRecommendMovies = async (dispatch, movieId, accountId) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get(`/movies/recommendations/similar/${movieId}`, {
      params: { accountId },
    });

    const listMovie = res.data.data;

    dispatch(setRecommendList(listMovie));
    return listMovie;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tải danh sách phim, thử lại sau";
    dispatch(setError(msg));
    console.error("Search movies error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const toggleLikeMovie = async (dispatch, movieId, isLiked) => {
  try {
    console.log(isLiked);
    
    const res = await axios.post(`/movies/like/${movieId}`);
    dispatch(toggleMovieLikeStatus({ movieId, isLiked: isLiked }));
    dispatch(toggleMovieFilterLikeStatus({ movieId, isLiked: isLiked }));
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể cập nhật trạng thái yêu thích.";
    // Dùng setError cho thông báo lỗi
    dispatch(setError(msg));
    throw err;
  }
};
