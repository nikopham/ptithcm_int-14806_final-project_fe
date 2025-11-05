import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.initialized = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true; 
      state.loading = false;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
      state.initialized = true; 
    },
  },
});

export const { setCredentials, logout, setLoading, setError } =
  authSlice.actions;
export default authSlice.reducer;
