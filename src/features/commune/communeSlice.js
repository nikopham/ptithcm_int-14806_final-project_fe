import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const communeSlice = createSlice({
  name: "commune",
  initialState,
  reducers: {
    setCommunes: (state, action) => {
      state.list = action.payload;
      state.error = null;
    },
    resetCommunes: (state) => {
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

export const { setCommunes, resetCommunes, setLoading, setError } =
  communeSlice.actions;

export default communeSlice.reducer;
