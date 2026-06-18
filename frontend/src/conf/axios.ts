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

// 🧹 Nettoyage complet en cas de déconnexion
const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

// 🛰️ Intercepteur de Requête : Injection MANUELLE du token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("access_token");

    // Si on a un token, on l'injecte dans les headers
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

// ⚠️ Intercepteur de Réponse : Gestion du 401 et Refresh automatique
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si ce n'est pas une erreur 401, on passe notre chemin
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 🚨 Si la route de refresh elle-même échoue (ex: refresh_token expiré) -> Bye bye
    if (originalRequest.url?.includes("/auth/refresh")) {
      handleLogout();
      return Promise.reject(error);
    }

    // 🔄 Si un rafraîchissement est déjà en cours, on met la requête en attente
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

    // S'il n'y a même pas de refresh token en stock, inutile d'insister
    if (!refreshToken) {
      handleLogout();
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      axiosInstance
        // On envoie manuellement le refresh token (souvent dans le body ou un header spécifique selon l'API Symfony)
        .post("/auth/refresh", { refresh_token: refreshToken })
        .then((res: AxiosResponse) => {
          // 📦 Récupération des nouveaux tokens renvoyés par Symfony
          const { token, refresh_token } = res.data;

          // Mise à jour manuelle du stockage local
          localStorage.setItem("access_token", token);
          if (refresh_token) {
            localStorage.setItem("refresh_token", refresh_token);
          }

          // Mise à jour du header de la requête actuelle qui avait échoué
          originalRequest.headers.Authorization = `Bearer ${token}`;

          processQueue(null);
          resolve(axiosInstance(originalRequest)); // On rejoue la requête initiale
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
