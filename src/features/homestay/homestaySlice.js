import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], 
  pagination: {
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const homestaySlice = createSlice({
  name: "homestay",
  initialState,
  reducers: {
    setHomestays: (state, action) => {
      const { homestays, pagination } = action.payload;
      state.list = homestays;
      state.pagination = pagination;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearHomestays: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
});

export const { setHomestays, setLoading, setError, clearHomestays } =
  homestaySlice.actions;

export default homestaySlice.reducer;
