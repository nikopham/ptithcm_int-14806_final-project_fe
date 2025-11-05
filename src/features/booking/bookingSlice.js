import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  current: null,
  error: null,
  list: [],
  pagination: {
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookings: (state, action) => {
      const { bookings, pagination } = action.payload;
      state.list = bookings;
      state.pagination = pagination;
      state.error = null;
    },
    clearBookings: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setBooking(state, action) {
      state.current = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetBooking(state) {
      state.current = null;
      state.error = null;
    },
  },
});

export const {
  setBookings,
  clearBookings,
  setLoading,
  setBooking,
  setError,
  resetBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
