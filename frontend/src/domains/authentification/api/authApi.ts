import axiosInstance from "@/conf/axios";
import { toast } from "sonner";
import type { LoginCredentials } from "../schema/loginSchema";

export interface LoginResponse {
  token: string; // Le jeton d'accès (Access Token)
  refresh_token?: string; // Le jeton de rafraîchissement
}

export const getProfile = async () => {
  const res = await axiosInstance.get("/me");
  return res.data;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/login", {
    username: credentials.username,
    password: credentials.password,
  });
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const forgotPassword = async (email: string) => {
  const { data } = await axiosInstance.post(
    "/auth/forgot-password",
    { email },
    {
      timeout: 100000,
    },
  );
  return data;
};

export const resetPassword = async (payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) => {
  const { data } = await axiosInstance.post("/auth/reset-password", payload, {
    timeout: 100000,
  });
  return data;
};
export const checkPassword = async (password: string) => {
  const { data } = await axiosInstance.post(
    "/auth/check-password",
    { password },
    { withCredentials: true },
  );
  return data.valid;
};
export const validateToken = async (payload: {
  email: string;
  token: string;
}) => {
  const { data } = await axiosInstance.post(
    "/auth/validate-reset-token",
    payload,
    {
      timeout: 100000,
    },
  );
  return data;
};
