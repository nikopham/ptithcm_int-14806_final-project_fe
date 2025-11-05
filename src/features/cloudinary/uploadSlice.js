import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signature: null,
  loading: false,
  error: null,
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setSignature: (state, action) => {
      state.signature = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSignature: (state) => {
      state.signature = null;
      state.error = null;
    },
  },
});

export const { setSignature, setLoading, setError, clearSignature } =
  uploadSlice.actions;

export default uploadSlice.reducer;
