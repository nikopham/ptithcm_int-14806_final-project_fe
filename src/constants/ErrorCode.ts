// src/constants/ErrorCode.ts

/**
 * Định nghĩa các mã lỗi trong hệ thống
 */
export const ErrorCode = {
  /* ===== thành công ===== */
  SUCCESS: 0,

  /* ===== lỗi xác thực ===== */
  UNAUTHORIZED: 1001,
  FORBIDDEN: 1003,
  TOKEN_EXPIRED: 1004,
  RESET_TOO_MANY: 3001,
  RESET_TOKEN_INVALID: 3002,

  /* ===== lỗi người dùng ===== */
  EMAIL_EXISTS: 2001,
  EMAIL_NOT_VERIFIED: 2002,
  BAD_CREDENTIALS: 2003,
  TOO_MANY_REQUESTS: 2004,
  MAIL_SEND_ERROR: 5002,

  /* ===== lỗi hệ thống ===== */
  INTERNAL_SERVER: 5000,
  DATABASE_ERROR: 5001,
} as const;
