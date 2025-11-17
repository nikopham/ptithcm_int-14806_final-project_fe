export const GlobalConstant = {
  // ROLE
  SUPER_ADMIN: "super_admin",
  COMMENT_ADMIN: "comment_admin",
  VIEWER: "viewer",
  MOVIE_ADMIN: "movie_admin",

  // ROLE SECURITY (Dùng cho check quyền)
  ROLE_SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  ROLE_COMMENT_ADMIN: "ROLE_COMMENT_ADMIN",
  ROLE_VIEWER: "ROLE_VIEWER",
  ROLE_MOVIE_ADMIN: "ROLE_MOVIE_ADMIN",

  /** Thời gian (giây) giữa các lần gửi lại */
  RESEND_INTERVAL_SEC: 60,
} as const;
