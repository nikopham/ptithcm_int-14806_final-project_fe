import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import errorModalReducer from "@/features/ui/errorModalSlice";
import movieReducer from "@/features/movie/movieSlice";
import genreReducer from "@/features/genre/genreSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    errorModal: errorModalReducer,
    movie: movieReducer,
    genre: genreReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
