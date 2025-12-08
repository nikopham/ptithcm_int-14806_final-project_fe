// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/router/role";

import { loginAsync, loginByGoogleAsync, verifyAsync } from "./authThunks";
import { toast } from "sonner";
interface AuthState {
  id: string | null;
  isAuth: boolean;
  roles: Role[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  username: string | null;
  avatarUrl: string | null;
  skipVerify: boolean; // Flag để ngăn gọi verify sau khi logout
}

const initialState: AuthState = {
  id: null,
  isAuth: false,
  roles: [],
  status: "idle",
  error: null,
  username: null,
  avatarUrl: null,
  skipVerify: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.id = null;
      state.isAuth = false;
      state.roles = [];
      // Set to failed so RootLayout won't trigger verify again
      state.status = "failed";
      state.error = null;
      state.username = null;
      state.avatarUrl = null;
      state.skipVerify = true; // Đánh dấu đã logout, không gọi verify nữa
      localStorage.removeItem("accessToken");
      // Hiển thị toast khi người dùng chủ động logout
      toast.success("Logout Successful");
    },
    logoutSilent: (state) => {
      state.id = null;
      state.isAuth = false;
      state.roles = [];
      // Set to failed so RootLayout won't trigger verify again
      state.status = "failed";
      state.error = null;
      state.username = null;
      state.avatarUrl = null;
      state.skipVerify = true; // Đánh dấu đã logout, không gọi verify nữa
      localStorage.removeItem("accessToken");
      // Không hiển thị toast (dùng cho logout tự động từ axios interceptor)
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
        state.id = action.payload.id;
        state.roles = action.payload.roles;
        state.username = action.payload.username;
        state.avatarUrl = action.payload.avatarUrl;
        state.skipVerify = false; // Reset flag khi login thành công
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
        state.id = action.payload.id;
        state.roles = action.payload.roles;
        state.username = action.payload.username;
        state.avatarUrl = action.payload.avatarUrl;
        state.skipVerify = false; // Reset flag khi verify thành công
      })
      .addCase(verifyAsync.rejected, (state) => {
        state.status = "failed";
        state.isAuth = false;
        // KHÔNG set skipVerify ở đây vì có thể là lỗi mạng tạm thời
        // skipVerify chỉ được set khi logout
      })

      .addCase(loginByGoogleAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginByGoogleAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.isAuth = true;

        state.id = action.payload.id;
        state.roles = action.payload.roles;
        state.username = action.payload.username;
        state.avatarUrl = action.payload.avatarUrl;
        state.skipVerify = false; // Reset flag khi login thành công

        toast.success("Welcome back!");
      })
      .addCase(loginByGoogleAsync.rejected, (state, action) => {
        state.status = "failed";
        state.isAuth = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, logoutSilent, setRoles, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
