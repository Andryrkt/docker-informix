import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { clear as clearPersistedQueryCache } from "idb-keyval";

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
  // Purge le cache react-query persisté (IndexedDB) : sinon le profil d'un token
  // mort reste servi au prochain chargement et relance la boucle 401 → reload.
  clearPersistedQueryCache().catch(() => {});
  window.location.href = "/login";
};

/**
 * Log d'une erreur HTTP via fetch natif.
 * N'utilise PAS axiosInstance pour éviter une dépendance circulaire avec auditApi.ts.
 */
function sendAuditNavigationLog(errorCode: number, errorMessage?: string): void {
  const token = localStorage.getItem("access_token");
  const companyId = localStorage.getItem("active_company_id");
  if (!token) return; // Pas connecté → rien à logger

  const payload = {
    pageUrl:      window.location.pathname,
    actionResult: "ERROR_REDIRECT",
    errorCode,
    errorMessage: errorMessage ?? null,
    sessionId:    sessionStorage.getItem("audit_session_id") ?? null,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
  if (companyId) headers["X-Active-Company-ID"] = companyId;

  fetch(`${BASE_URL}/audit/navigation`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Fire-and-forget — on ignore silencieusement les erreurs de logging
  });
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const activeCompanyId = localStorage.getItem("active_company_id");
    if (activeCompanyId) {
      config.headers["X-Active-Company-ID"] = activeCompanyId;
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

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Log les erreurs HTTP significatives via fetch natif (évite une dépendance circulaire avec auditApi)
    if ([403, 404, 422, 500, 502, 503].includes(status)) {
      const isAuditCall = originalRequest.url?.includes("/audit/");
      if (!isAuditCall) {
        const errData = error.response.data as Record<string, unknown> | null;
        const errMsg = (errData?.message ?? errData?.error ?? errData?.detail ?? "") as string;
        sendAuditNavigationLog(status, errMsg || undefined);
      }
    }

    // Les appels audit sont fire-and-forget — ne jamais déclencher le refresh/logout pour eux
    if (originalRequest.url?.includes("/audit/")) {
      return Promise.reject(error);
    }

    if (status !== 401) {
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
