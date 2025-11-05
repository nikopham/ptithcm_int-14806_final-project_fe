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

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      const { accounts, pagination } = action.payload;
      state.list = accounts;
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
    clearAccounts: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
});

export const { setAccounts, setLoading, setError, clearAccounts } =
  accountSlice.actions;

export default accountSlice.reducer;
