// src/features/auth/authThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authApi } from "./authApi";
import type { AuthResponse, LoginRequest } from "@/types/auth";
import { Role } from "@/router/role"; // Import như giá trị, không phải type
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
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      // 1. Gọi API login (Backend sẽ set cookie)
      const result = await authApi.login(credentials);

      // 2. Kiểm tra response
      if (!result.success || !result.data) {
        console.error("Login API failed:", result);
        throw new Error(result.message || "Login failed");
      }

      // 3. Token đã được set trong cookie, không cần lấy từ response
      // 4. Sau khi login thành công, gọi verifyAsync để lấy đầy đủ thông tin user (roles, id)
      // Đợi một chút để đảm bảo cookie đã được set
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      try {
        const verifyResult = await dispatch(verifyAsync()).unwrap();
        // 5. Trả về thông tin từ verify (bao gồm roles, id, username, avatarUrl)
        return verifyResult;
      } catch (verifyError: any) {
        console.error("Verify failed after login:", verifyError);
        // Nếu verify fail, vẫn throw error nhưng với message rõ ràng hơn
        throw new Error(verifyError?.message || "Failed to get user information after login");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message =
        error?.response?.data?.message || 
        error?.message || 
        "Login Failed";
      return rejectWithValue(message);
    }
  }
);

export const verifyAsync = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authApi.verify();
      
      console.log("Verify API response:", result);

      // result là ServiceResult<UserProfile>
      // result.data là UserProfile có: id, username, email, avatarUrl, roles (string[])
      const { id, roles, username, avatarUrl } = result?.data || {};
      
      if (!id || !roles || !Array.isArray(roles)) {
        console.error("Invalid user data:", { id, roles, username, avatarUrl });
        throw new Error("Invalid user data: missing id, roles, or username");
      }
      

      // Convert roles từ string[] (ví dụ: ["viewer", "super_admin"]) 
      // sang Role[] enum (ví dụ: [Role.VIEWER, Role.SUPER_ADMIN])
      const roleEnums: Role[] = roles.map((roleStr: string) => {
        // Map từ backend role string sang Role enum
        console.log(roleStr);
        
        switch (roleStr) {
          case "viewer":
            return Role.VIEWER;
          case "super_admin":
            return Role.SUPER_ADMIN;
          case "movie_admin":
            return Role.MOVIE_ADMIN;
          case "comment_admin":
            return Role.COMMENT_ADMIN;
          default:
            // Nếu role không khớp, giữ nguyên string (sẽ được xử lý như string)
            console.warn("Unknown role:", roleStr);
            return roleStr as any;
        }
      });

      return { id, roles: roleEnums, username, avatarUrl };
    } catch (error: any) {
      console.error("Verify error:", error);
      const message =
        error?.response?.data?.message || 
        error?.message || 
        "Something wrong occurred";
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

export const loginByGoogleAsync = createAsyncThunk(
  "auth/loginByGoogle",
  async (code: string, { rejectWithValue }) => {
    try {
      // 1. Gọi API
      const result = await authApi.loginByGoogle(code);

      // 2. Bóc tách dữ liệu (Giống hệt login thường)
      // Lưu ý: Cần lấy thêm 'id' vì slice của bạn có dùng state.id
      // result?.data ở đây tương ứng với LoginResult trong Java
      const { accessToken, refreshToken, authResponse } =
        result?.data?.data || result?.data;
      // Note: Tùy vào cấu trúc ServiceResult trả về từ Backend,
      // nếu Backend trả về ServiceResult.data là LoginResult,
      // thì cấu trúc destructuring có thể là:
      const {
        accessToken: token,
        username,
        avatarUrl,
        roles,
        id, // <--- Backend cần trả về cái này trong authResponse
      } = authResponse || result?.data;

    

      // 4. Trả về Payload cho Slice (Bổ sung id để Slice không bị lỗi undefined)
      return { roles, username, avatarUrl, id };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Google Login Failed";
      return rejectWithValue(message);
    }
  }
);