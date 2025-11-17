// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/router/role";

import { loginAsync, verifyAsync } from "./authThunks";
import { toast } from "sonner";
interface AuthState {
  isAuth: boolean;
  roles: Role[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  username: string | null;
  avatarUrl: string | null;
}

const initialState: AuthState = {
  isAuth: false,
  roles: [],
  status: "idle",
  error: null,
  username: null,
  avatarUrl: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuth = false;
      state.roles = [];
      state.status = "idle";
      state.error = null;
      state.username = null;
      state.avatarUrl = null;
      localStorage.removeItem("accessToken");
      toast.success("Logout Successful");
    },

    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.isAuth = true;
        state.roles = action.payload.roles;
        state.username = action.payload.username;
        state.avatarUrl = action.payload.avatarUrl;
        toast.success("Login Successful");
      })
      // Khi gọi API thất bại
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.isAuth = false;
        state.error = action.payload as string;
      })

      .addCase(verifyAsync.pending, (state) => {
        state.status = "loading"; // Trạng thái "đang tải ứng dụng"
      })
      .addCase(verifyAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuth = true; // <-- Quan trọng
        state.roles = action.payload.roles;
        state.username = action.payload.username;
        state.avatarUrl = action.payload.avatarUrl;
      })
      .addCase(verifyAsync.rejected, (state) => {
        state.status = "failed";
        state.isAuth = false;
      });
  },
});

export const { logout, setRoles, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
