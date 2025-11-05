import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], 
  loading: false,
  error: null,
};

const provinceSlice = createSlice({
  name: "province",
  initialState,
  reducers: {
    setProvinces: (state, action) => {
      state.list = action.payload; 
      state.error = null;
    },
    resetProvinces: (state) => {
      state.list = [];
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProvinces, resetProvinces, setLoading, setError } =
  provinceSlice.actions;

export default provinceSlice.reducer;
