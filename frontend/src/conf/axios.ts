import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Détection automatique du FormData pour multipart
    if (
      config.data &&
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      handleLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      handleLogout();
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      axiosInstance
        .post("/auth/refresh", { refresh_token: refreshToken })
        .then((res: AxiosResponse) => {
          const { token, refresh_token } = res.data;

          localStorage.setItem("access_token", token);
          if (refresh_token) {
            localStorage.setItem("refresh_token", refresh_token);
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;

          processQueue(null);
          resolve(axiosInstance(originalRequest));
        })
        .catch((err) => {
          processQueue(err);
          handleLogout();
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  },
);

export default axiosInstance;
