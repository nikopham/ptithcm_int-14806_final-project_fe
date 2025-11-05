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

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      const { customers, pagination } = action.payload;
      state.list = customers;
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
    clearCustomers: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
});

export const { setCustomers, setLoading, setError, clearCustomers } =
  customerSlice.actions;

export default customerSlice.reducer;
