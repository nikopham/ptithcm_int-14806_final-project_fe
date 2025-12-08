import { api } from "@/lib/axios";
import type {
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth";
import type { ServiceResult } from "@/types/common";
import type { UserProfile } from "@/types/user";

const login = async (credentials: LoginRequest): Promise<ServiceResult<AuthResponse>> => {
  const response = await api.post<ServiceResult<AuthResponse>>("/api/auth/login", credentials);
  return response;
};

const verify = async (): Promise<ServiceResult<UserProfile>> => {
  // Axios interceptor sẽ tự động đính kèm token từ cookie
  // /api/users/me trả về ServiceResult<UserProfile> với id, username, email, avatarUrl, roles
  const response = await api.get<ServiceResult<UserProfile>>("/api/users/me");
  return response;
};

const logout = async (): Promise<void> => {
  await api.post("/api/auth/logout", null, {
    withCredentials: true,
  });
};

const register = async (data: RegisterRequest): Promise<ServiceResult> => {
  return api.post<ServiceResult>("/api/auth/register", data);
};

const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ServiceResult> => {
  return api.post<ServiceResult>("/api/auth/forgot-password", data);
};

const verifyResetToken = async (token: string): Promise<ServiceResult> => {
  return api.get<ServiceResult>("/api/auth/reset/verify", {
    params: { token },
  });
};

const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ServiceResult> => {
  return api.post<ServiceResult>("/api/auth/reset", data);
};

const loginByGoogle = async (code: string): Promise<any> => {
  const response = await api.post<any>("/api/auth/google", { code });
  return response;
};
export const authApi = {
  login,
  verify,
  logout,
  register,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  loginByGoogle,
};
