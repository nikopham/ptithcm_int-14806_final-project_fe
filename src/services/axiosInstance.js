import axios from "axios";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});
let isRefreshing = false;
let pendingQueue = [];

const REFRESH_URL = "/auth/refresh-token";
const AUTH_WHITELIST = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-pw",
  REFRESH_URL,
];

// helper: resolve/reject toàn bộ queue
function flushQueue(error = null) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (error) reject(error);
    else resolve(instance(config));
  });
  pendingQueue = [];
}

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    const status = response?.status;

    if (!response) return Promise.reject(error);

    const url = config?.url || "";
    const isAuthPath = AUTH_WHITELIST.some((p) => url.includes(p));
    const user = store?.getState().auth.user;
    if (status === 401 && !isAuthPath && !config._retry && user) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;
      try {
        await instance.post(REFRESH_URL);
        flushQueue(null);
        return instance(config);
      } catch (refreshErr) {
        window.dispatchEvent(new Event("forceLogout"));
        // ---------------------------------

        flushQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export async function initCsrfToken() {
  const { data } = await instance.get("/csrf-token");
  localStorage.setItem("csrfToken", data.csrfToken);

  instance.defaults.headers["X-CSRF-Token"] = data.csrfToken;
}

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("csrfToken");
  if (token) config.headers["X-CSRF-Token"] = token;
  return config;
});

export default instance;
