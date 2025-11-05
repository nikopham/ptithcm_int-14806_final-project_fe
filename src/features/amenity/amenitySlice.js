import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const amenitySlice = createSlice({
  name: "amenity",
  initialState,
  reducers: {
    setAmenities: (state, action) => {
      state.list = action.payload;
      state.error = null;
    },
    resetAmenities: (state) => {
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

export const { setAmenities, resetAmenities, setLoading, setError } =
  amenitySlice.actions;

export default amenitySlice.reducer;
