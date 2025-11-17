// import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
// import { toast } from "sonner";
// import { store } from "@/app/store";
// import { logout } from "@/features/auth/authSlice";
// import { showErrorModal } from "@/features/ui/errorModalSlice";

// declare module "axios" {
//   export interface InternalAxiosRequestConfig {
//     noAuth?: boolean;
//   }
// }
// /* ------------------------------------------------------------------ */
// /* 1. Tạo instance (Không đổi)                                        */
// /* ------------------------------------------------------------------ */
// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
//   timeout: 20_000,
// });

// /* ------------------------------------------------------------------ */
// /* 2. Request interceptor (Không đổi)                                 */
// /* ------------------------------------------------------------------ */
// api.interceptors.request.use((config) => {
//   if (config.noAuth) {
//     return config;
//   }

//   const token = localStorage.getItem("accessToken");
//   if (token) {
//     config.headers["Authorization"] = `Bearer ${token}`;
//   }
//   return config;
// });

// /* ------------------------------------------------------------------ */
// /* 3. Response interceptor (Cập nhật logic 401)                       */
// /* ------------------------------------------------------------------ */

// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (value: any) => void;
//   reject: (reason: any) => void;
// }> = [];

// const processQueue = (
//   error: AxiosError | null,
//   token: string | null = null
// ) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response.data,
//   async (error: AxiosError<any>) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (!error.response) {
//       toast.error("Lỗi mạng hoặc máy chủ không phản hồi.");
//       return Promise.reject(error);
//     }

//     const { status, data } = error.response;
//     const message = data?.message || "Đã có lỗi xảy ra!";

//     /* ------------------------------------------------------------------ */
//     /* Xử lý lỗi 401 (Unauthorized) - Cần Refresh Token                   */
//     /* ------------------------------------------------------------------ */
//     if (status === 401) {
//       // Nếu đã thử refresh và vẫn lỗi -> Đăng xuất
//       if (originalRequest._retry) {
//         console.error("Refresh token thất bại hoặc đã hết hạn.");

//         // **Thay đổi 3: Logic logout mới**
//         store.dispatch(logout()); // Dọn dẹp state và localStorage
//         window.location.href = "/";

//         toast.error("Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.");
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers["Authorization"] = "Bearer " + token;
//             return api(originalRequest);
//           })
//           .catch((err) => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshResponse = await axios.post(
//           `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/refresh`,
//           null,
//           { withCredentials: true }
//         );

//         const { accessToken: newAccessToken } = refreshResponse.data.data;
//         localStorage.setItem("accessToken", newAccessToken);

//         api.defaults.headers.common["Authorization"] =
//           "Bearer " + newAccessToken;
//         originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

//         processQueue(null, newAccessToken);
//         return api(originalRequest);
//       } catch (refreshError: any) {
//         // Nếu refresh thất bại -> Đăng xuất
//         console.error("Lỗi khi refresh token:", refreshError);
//         processQueue(refreshError as AxiosError, null);

//         // **Thay đổi 4: Logic logout mới (cũng áp dụng ở đây)**
//         store.dispatch(logout()); // Dọn dẹp state và localStorage
//         window.location.href = "/"; // Điều hướng về trang chủ

//         toast.error("Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.");
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     /* ------------------------------------------------------------------ */
//     /* Xử lý các lỗi khác (403, 404, 500...)                             */
//     /* ------------------------------------------------------------------ */
//     if (status === 403) {
//       toast.error("Bạn không có quyền thực hiện hành động này.");
//     } else {
//       toast.error(message);
//     }

//     console.error("API error:", error);
//     return Promise.reject(error);
//   }
// );
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
// BỎ: import { toast } from "sonner";
import { store } from "@/app/store";
import { logout } from "@/features/auth/authSlice";
import { showErrorModal } from "@/features/ui/errorModalSlice"; // IMPORT SLICE MỚI

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    noAuth?: boolean;
  }
}

/* ------------------------------------------------------------------ */
/* 1. Tạo instance (Không đổi)                                        */
/* ------------------------------------------------------------------ */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 20_000,
});

/* ------------------------------------------------------------------ */
/* 2. Request interceptor (Không đổi)                                 */
/* ------------------------------------------------------------------ */
api.interceptors.request.use((config) => {
  if (config.noAuth) {
    return config;
  }
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* 3. Response interceptor (Cập nhật logic lỗi)                       */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  /* ================================================================== */
  /* 1. XỬ LÝ KHI REQUEST THÀNH CÔNG (HTTP 200)                         */
  /* ================================================================== */
  (response) => {
    const data = response.data;

    // Kiểm tra cấu trúc ServiceResult
    // Nếu success === false HOẶC code không phải 0 (SUCCESS) -> là lỗi nghiệp vụ
    if (
      data &&
      data.success === false &&
      data.code !== 0 // 0 là ErrorCode.SUCCESS
    ) {
      console.error("Lỗi nghiệp vụ (Business Error):", data);

      // Dispatch modal lỗi
      store.dispatch(
        showErrorModal({
          message: data.message || "Thao tác thất bại.",
          code: data.code || "N/A",
        })
      );

      // Quan trọng: Biến một response thành công thành một promise thất bại
      // để các hàm .catch() hoặc createAsyncThunk có thể bắt được.
      return Promise.reject(new Error(data.message));
    }

    // Nếu không phải lỗi -> trả về data (giữ nguyên logic cũ)
    return response.data;
  },

  /* ================================================================== */
  /* 2. XỬ LÝ KHI REQUEST THẤT BẠI (HTTP 4xx, 5xx, Network...)        */
  /* ================================================================== */
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Lỗi mạng (không có response)
    if (!error.response) {
      // THAY THẾ toast
      store.dispatch(
        showErrorModal({
          title: "Lỗi Mạng",
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.",
          code: "NET_ERR",
        })
      );
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || "Đã có lỗi xảy ra!";

    /* ------------------------------------------------------------------ */
    /* Xử lý lỗi 401 (Refresh Token) - Logic này đã tốt, giữ nguyên       */
    /* ------------------------------------------------------------------ */
    if (status === 401) {
      if (originalRequest._retry) {
        console.error("Refresh token thất bại hoặc đã hết hạn.");
        store.dispatch(logout());
        window.location.href = "/";
        // THAY THẾ toast
        store.dispatch(
          showErrorModal({
            title: "Phiên hết hạn",
            message: "Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.",
            code: 401,
          })
        );
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/refresh`,
          null,
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = refreshResponse.data.data;
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("Lỗi khi refresh token:", refreshError);
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logout());
        window.location.href = "/";
        // THAY THẾ toast
        store.dispatch(
          showErrorModal({
            title: "Phiên hết hạn",
            message: "Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.",
            code: 401,
          })
        );
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /* ------------------------------------------------------------------ */
    /* Xử lý các lỗi khác (403, 404, 500...)                            */
    /* ------------------------------------------------------------------ */
    if (status === 403) {
      // THAY THẾ toast
      store.dispatch(
        showErrorModal({
          title: "Từ chối truy cập",
          message: "Bạn không có quyền thực hiện hành động này.",
          code: 403,
        })
      );
    } else {
      // Các lỗi 500 hoặc lỗi khác có message
      // THAY THẾ toast
      store.dispatch(
        showErrorModal({
          message: message,
          code: status,
        })
      );
    }

    console.error("API error:", error);
    return Promise.reject(error);
  }
);