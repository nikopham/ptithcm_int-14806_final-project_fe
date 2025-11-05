import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {
    page: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  detail: null,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      const { employees, pagination } = action.payload;
      state.list = employees;
      state.pagination = pagination;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEmployeeDetail: (state, { payload }) => {
      state.detail = payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearEmployees: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    clearEmployeeDetail: (state) => {
      state.detail = null;
    },
  },
});

export const {
  setEmployees,
  setLoading,
  setError,
  clearEmployees,
  setEmployeeDetail,
  clearEmployeeDetail,
} = employeeSlice.actions;

export default employeeSlice.reducer;
