export interface UpdateProfileRequest {
  username: string;
  avatar?: File;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserRole {
  id: string;
  code: "ADMIN" | "USER" | "MODERATOR";
  displayName: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;

  role: UserRole;

  emailVerified: boolean;
  isActive: boolean;
  isImported: boolean;

  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  commentCount: number;
  createdMovieCount?: number;
  updatedMovieCount?: number;
  adminCommentCount?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
}

export interface UserSearchParams {
  query?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminSearchParams {
  query?: string;
  isActive?: boolean;
  roleCode?: "movie_admin" | "comment_admin";
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateAdminFormValues {
  username: string;
  email: string;
  password: string;
  roleCode?: "movie_admin" | "comment_admin";
  avatarFile?: File;
}

export interface AdminPasswordResetRequest {
  newPassword: string;
}

export interface UserProfileUpdateRequest {
  id: string;
  username?: string;
  email?: string;
  avatarFile?: File;
}

export interface UserPasswordChangeRequest {
  id: string;
  currentPw: string;
  newPw: string;
  reNewPw: string;
}
