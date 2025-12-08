// import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
// // BỎ: import { toast } from "sonner";
// import { store } from "@/app/store";
// import { logout } from "@/features/auth/authSlice";
// import { showErrorModal } from "@/features/ui/errorModalSlice"; // IMPORT SLICE MỚI

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
//   withCredentials: true,
// });

// /* ------------------------------------------------------------------ */
// /* 2. Request interceptor (Không đổi)                                 */
// /* ------------------------------------------------------------------ */

// /* ------------------------------------------------------------------ */
// /* 3. Response interceptor (Cập nhật logic lỗi)                       */
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
//   /* ================================================================== */
//   /* 1. XỬ LÝ KHI REQUEST THÀNH CÔNG (HTTP 200)                         */
//   /* ================================================================== */
//   (response) => {
//     const data = response.data;

//     // Kiểm tra cấu trúc ServiceResult
//     // Nếu success === false HOẶC code không phải 0 (SUCCESS) -> là lỗi nghiệp vụ
//     if (
//       data &&
//       data.success === false &&
//       data.code !== 0 // 0 là ErrorCode.SUCCESS
//     ) {
//       console.error("Lỗi nghiệp vụ (Business Error):", data);

//       // Dispatch modal lỗi
//       store.dispatch(
//         showErrorModal({
//           message: data.message || "Thao tác thất bại.",
//           code: data.code || "N/A",
//         })
//       );

//       // Quan trọng: Biến một response thành công thành một promise thất bại
//       // để các hàm .catch() hoặc createAsyncThunk có thể bắt được.
//       return Promise.reject(new Error(data.message));
//     }

//     // Nếu không phải lỗi -> trả về data (giữ nguyên logic cũ)
//     return response.data;
//   },

//   /* ================================================================== */
//   /* 2. XỬ LÝ KHI REQUEST THẤT BẠI (HTTP 4xx, 5xx, Network...)        */
//   /* ================================================================== */
//   async (error: AxiosError<any>) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     // Lỗi mạng (không có response)
//     if (!error.response) {
//       // THAY THẾ toast
//       store.dispatch(
//         showErrorModal({
//           title: "Lỗi Mạng",
//           message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.",
//           code: "NET_ERR",
//         })
//       );
//       return Promise.reject(error);
//     }

//     const { status, data } = error.response;
//     const message = data?.message || "Đã có lỗi xảy ra!";

//     /* ------------------------------------------------------------------ */
//     /* Xử lý lỗi 401 (Refresh Token) - Logic này đã tốt, giữ nguyên       */
//     /* ------------------------------------------------------------------ */
//     if (status === 401) {
//       if (originalRequest._retry) {
//         console.error("Refresh token thất bại hoặc đã hết hạn.");
//         store.dispatch(logout());
//         window.location.href = "/";
//         // THAY THẾ toast
//         store.dispatch(
//           showErrorModal({
//             title: "Phiên hết hạn",
//             message: "Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.",
//             code: 401,
//           })
//         );
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

//         const resData = refreshResponse.data;
//         console.log(resData);

//         if (!resData.success || !resData.data) {
//           throw new Error(resData.message || "Refresh failed");
//         }

//         const { accessToken: newAccessToken } = resData.data;
//         localStorage.setItem("accessToken", newAccessToken);
//         api.defaults.headers.common["Authorization"] =
//           "Bearer " + newAccessToken;
//         originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
//         processQueue(null, newAccessToken);
//         return api(originalRequest);
//       } catch (refreshError: any) {
//         console.error("Lỗi khi refresh token:", refreshError);
//         processQueue(refreshError as AxiosError, null);
//         store.dispatch(logout());
//         window.location.href = "/";
//         // THAY THẾ toast
//         store.dispatch(
//           showErrorModal({
//             title: "Phiên hết hạn",
//             message: "Phiên đăng nhập hết hạn. Bạn đã được đăng xuất.",
//             code: 401,
//           })
//         );
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     /* ------------------------------------------------------------------ */
//     /* Xử lý các lỗi khác (403, 404, 500...)                            */
//     /* ------------------------------------------------------------------ */
//     if (status === 403) {
//       // THAY THẾ toast
//       store.dispatch(
//         showErrorModal({
//           title: "Từ chối truy cập",
//           message: "Bạn không có quyền thực hiện hành động này.",
//           code: 403,
//         })
//       );
//     } else {
//       // Các lỗi 500 hoặc lỗi khác có message
//       // THAY THẾ toast
//       store.dispatch(
//         showErrorModal({
//           message: message,
//           code: status,
//         })
//       );
//     }

//     console.error("API error:", error);
//     return Promise.reject(error);
//   }
// );
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/app/store";
import { logoutSilent } from "@/features/auth/authSlice";
import { showErrorModal } from "@/features/ui/errorModalSlice";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    noAuth?: boolean;
  }
}

/* ------------------------------------------------------------------ */
/* 1. Cấu hình Queue (Hàng đợi khi đang Refresh)                      */
/* ------------------------------------------------------------------ */
let isRefreshing = false;
// Queue giờ chỉ cần resolve void (không cần string token)
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // Báo hiệu retry, browser tự gửi cookie mới
    }
  });
  failedQueue = [];
};

/* ------------------------------------------------------------------ */
/* 2. Tạo instance                                                    */
/* ------------------------------------------------------------------ */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // [BẮT BUỘC] Để gửi/nhận Cookie
});

/* ------------------------------------------------------------------ */
/* 3. Request interceptor (ĐÃ XÓA)                                    */
/* ------------------------------------------------------------------ */
// Vì Token nằm trong HttpOnly Cookie, Browser tự động gửi đi.
// Không cần Interceptor để gán Authorization Header nữa.

/* ------------------------------------------------------------------ */
/* 4. Response interceptor                                            */
/* ------------------------------------------------------------------ */
api.interceptors.response.use(
  /* ================================================================== */
  /* A. XỬ LÝ KHI REQUEST THÀNH CÔNG (HTTP 200)                         */
  /* ================================================================== */
  (response) => {
    const data = response.data;

    // Logic kiểm tra lỗi nghiệp vụ (Business Error) giữ nguyên
    if (data && data.success === false && data.code !== 0) {
      console.error("Lỗi nghiệp vụ:", data);

      store.dispatch(
        showErrorModal({
          message: data.message || "Thao tác thất bại.",
          code: data.code || "N/A",
        })
      );
      return Promise.reject(new Error(data.message));
    }

    return response.data;
  },

  /* ================================================================== */
  /* B. XỬ LÝ KHI REQUEST THẤT BẠI (HTTP 4xx, 5xx...)                   */
  /* ================================================================== */
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. Lỗi mạng
    if (!error.response) {
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
    /* 2. Xử lý lỗi 401 (Refresh Token với Cookie)                        */
    /* ------------------------------------------------------------------ */
    if (status === 401 && !originalRequest.noAuth) {
      // Nếu đang có request khác đang refresh token, xếp vào hàng chờ
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Khi refresh thành công, gọi lại request ban đầu
            // Browser sẽ tự động lấy cookie mới nhất để gửi
            return api(originalRequest);
          })
          .catch((err) => {
            // Khi refresh thất bại, request này cũng bị reject
            return Promise.reject(err);
          });
      }

      // Nếu request này đã được retry một lần rồi mà vẫn 401
      // => Refresh token đã thất bại, không cần retry nữa
      if (originalRequest._retry) {
        // Request này đã được retry nhưng vẫn 401
        // Có thể do refresh token đã thất bại trước đó
        // Chỉ cần reject, không logout ở đây (logout đã được xử lý ở catch block của refresh)
        return Promise.reject(error);
      }

      // Bắt đầu quá trình Refresh Token
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API Refresh (Browser tự gửi cookie refreshToken đi)
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/refresh`,
          null,
          { withCredentials: true }
        );

        // Server trả về 200 OK kèm header Set-Cookie (accessToken mới)
        // Giải phóng hàng đợi - tất cả request trong hàng đợi sẽ được retry
        processQueue(null);

        // Gọi lại request ban đầu (Browser tự gửi cookie accessToken mới)
        return api(originalRequest);
      } catch (refreshError: any) {
        // Refresh token thất bại -> Logout và hủy tất cả request trong hàng đợi
        processQueue(refreshError);

        // Gọi API logout để xóa cookie trên server
        // Sử dụng axios trực tiếp để tránh vòng lặp interceptor
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/logout`,
            null,
            { withCredentials: true }
          );
        } catch (e) {
          // Ignore logout error
        }

        // Dispatch logoutSilent action để cập nhật state (không hiển thị toast)
        store.dispatch(logoutSilent());

        // Redirect về trang chủ bằng cách dispatch custom event
        // RootLayout sẽ lắng nghe event này và navigate bằng React Router
        window.dispatchEvent(new CustomEvent("auth:logout", { detail: { path: "/" } }));

        // Không hiển thị error dialog khi logout tự động (refresh token thất bại)
        // Chỉ redirect về trang chủ im lặng

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /* ------------------------------------------------------------------ */
    /* 3. Các lỗi khác (403, 500...)                                      */
    /* ------------------------------------------------------------------ */
    if (status === 403) {
      store.dispatch(
        showErrorModal({
          title: "Từ chối truy cập",
          message: "Bạn không có quyền thực hiện hành động này.",
          code: 403,
        })
      );
    } else {
      // Các lỗi khác
      store.dispatch(
        showErrorModal({
          message: message,
          code: status,
        })
      );
    }

    return Promise.reject(error);
  }
);