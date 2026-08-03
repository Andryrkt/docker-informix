import { useQuery } from "@tanstack/react-query";
import * as authApi from "@/domains/authentification/api/authApi";

export const useProfile = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
    enabled: !!token,
  });
};
