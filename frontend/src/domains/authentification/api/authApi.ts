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
