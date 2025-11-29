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

const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/api/auth/login",
    credentials,
  );
  return response;
};

const verify = async (): Promise<UserProfileResponse> => {
  // Axios interceptor sẽ tự động đính kèm token
  const response = await api.get<UserProfileResponse>("/api/users/me");
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

export const authApi = {
  login,
  verify,
  logout,
  register,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
