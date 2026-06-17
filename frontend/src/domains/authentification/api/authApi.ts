import axiosInstance from "@/conf/axios";
import { toast } from "sonner";
import type { LoginCredentials } from "../schema/loginSchema";

// export const getProfile = async () => {
//   const res = await axiosInstance.get("/user");
//   return res.data;
// };

export const login = async (credentials: LoginCredentials) => {
  await axiosInstance.post("/login", credentials);
};

export const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    // toast.error(formatErrorMessage(error));
  }
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
