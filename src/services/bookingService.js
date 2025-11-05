import axios from "./axiosInstance";
import {
  setBooking,
  setLoading,
  setError,
  setBookings,
} from "@/features/booking/bookingSlice";
import qs from "qs";

export const createBooking = async (dispatch, payload) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/bookings", payload);
    const booking = res.data.data.booking;
    const result = res?.data;
    if (!result?.success) {
      const msg = result?.message;
      dispatch(setError(msg));
      throw new Error(msg);
    }

    dispatch(setBooking(booking));
    return booking;
  } catch (err) {
    const msg = err.response?.data?.message || "Không thể tạo booking";
    dispatch(setError(msg));
    console.error("Create booking error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchBookings = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    const res = await axios.get(`/bookings/search?${query}`);

    const { bookings, pagination } = res.data.data;

    dispatch(setBookings({ bookings, pagination }));
    return { bookings, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm đơn đặt, thử lại sau";
    dispatch(setError(msg));
    console.error("Search booking error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchBookingsByCustomer = async (dispatch, accountId, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    const res = await axios.get(`/bookings/by-customer/${accountId}?${query}`);

    const { bookings, pagination } = res.data.data;

    dispatch(setBookings({ bookings, pagination }));
    return { bookings, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm đơn đặt, thử lại sau";
    dispatch(setError(msg));
    console.error("Search booking error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchReviewsByCustomer = async (dispatch, accountId, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    const res = await axios.get(
      `/reviews/search-customer/${accountId}?${query}`
    );

    const { reviews: bookings, pagination } = res.data.data;

    dispatch(setBookings({ bookings, pagination }));
    return { bookings, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm đánh giá, thử lại sau";
    dispatch(setError(msg));
    console.error("Search review error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const searchReviews = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    console.log(params);
    console.log(query);

    const res = await axios.get(`/reviews/search?${query}`);

    const { reviews: bookings, pagination } = res.data.data;

    dispatch(setBookings({ bookings, pagination }));
    return { bookings, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm đánh giá, thử lại sau";
    dispatch(setError(msg));
    console.error("Search review error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const checkInBooking = async (dispatch, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/bookings/check-in";
    const res = await axios.post(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg = err?.response?.data?.message || "Không thể check-in booking";
    dispatch(setError(msg));
    console.error("checkInBooking error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const changeStatusBooking = async (dispatch, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/bookings/status";
    const res = await axios.patch(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Không thể đổi trạng thái booking";
    dispatch(setError(msg));
    console.error("change status booking error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createBookingReview = async (dispatch, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/reviews/create";
    const res = await axios.post(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg = err?.response?.data?.message || "Không thể tạo đánh giá";
    dispatch(setError(msg));
    console.error("create review error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
