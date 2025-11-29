import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import errorModalReducer from "@/features/ui/errorModalSlice";
import { movieApi } from "../features/movie/movieApi";
import { genreApi } from "../features/genre/genreApi";
import { countryApi } from "../features/country/countryApi";
import { personApi } from "../features/person/personApi";
import { seriesApi } from "../features/series/seriesApi";
import { reviewApi } from "@/features/review/reviewApi";
import { userApi } from "@/features/user/userApi";
import { uploadApi } from "@/features/movie/uploadApi";
import { commentApi } from "@/features/comment/commentApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    errorModal: errorModalReducer,
    [movieApi.reducerPath]: movieApi.reducer,
    [genreApi.reducerPath]: genreApi.reducer,
    [countryApi.reducerPath]: countryApi.reducer,
    [personApi.reducerPath]: personApi.reducer,
    [seriesApi.reducerPath]: seriesApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(movieApi.middleware)
      .concat(genreApi.middleware)
      .concat(countryApi.middleware)
      .concat(personApi.middleware)
      .concat(seriesApi.middleware)
      .concat(reviewApi.middleware)
      .concat(userApi.middleware)
      .concat(uploadApi.middleware)
      .concat(commentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
