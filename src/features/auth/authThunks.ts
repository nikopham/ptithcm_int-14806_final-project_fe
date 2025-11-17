// src/features/auth/authThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authApi } from "./authApi";
import type { LoginRequest } from "@/types/auth";
import type { Role } from "@/router/role";
import { toast } from "sonner";
import { logout } from "./authSlice";

interface DecodedToken {
  sub: string;
  roles: Role[];
  iat: number;
  exp: number;
}

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const result = await authApi.login(credentials);

      const { accessToken, username, avatarUrl, roles } = result?.data;
      localStorage.setItem("accessToken", accessToken);

      return { roles, username, avatarUrl };
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || "Login Failed";
      return rejectWithValue(message);
    }
  }
);

export const verifyAsync = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authApi.verify();

      const { roles, username, avatarUrl } = result?.data;
      return { roles, username, avatarUrl };
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Something wrong occurred";
      return rejectWithValue(message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logoutApi",
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      dispatch(logout());
    }
  }
);
