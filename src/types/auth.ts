import type { Role } from "@/router/role";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  username: string;
  avatarUrl: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  repassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  repassword: string;
}

export interface UserProfileResponse {
  username: string;
  avatarUrl: string;
  roles: Role[];
}


