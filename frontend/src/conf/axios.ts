import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const CSRF_URL =
  import.meta.env.VITE_API_CSRF_URL ||
  `http://localhost:8000/sanctum/csrf-cookie`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 🔐 Appelle CSRF-cookie si nécessaire
    // if (config.method !== "get") {
    //   await axios.get(CSRF_URL, {
    //     withCredentials: true,
    //     withXSRFToken: true,
    //     timeout: 80000,
    //   });
    // }

    // 📦 Détection automatique du FormData pour multipart
    if (
      config.data &&
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ⚠️ Intercepteur de réponse
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const disposition = response.headers["content-disposition"];

    // Auto trigger download if responseType is blob and Content-Disposition header exists
    if (
      response.config.responseType === "blob" &&
      response.config.url?.includes("/export") &&
      disposition &&
      disposition.includes("attachment")
    ) {
      // const filename = getFilenameFromHeader(disposition);
      // const blob = new Blob([response.data], {
      //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", filename || "download.xlsx");
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    }

    return response;
  },
  (error: AxiosError) => Promise.reject(error),
);

export default axiosInstance;
