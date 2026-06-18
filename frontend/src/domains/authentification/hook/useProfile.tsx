import { useQuery } from "@tanstack/react-query";
import * as authApi from "@/domains/authentification/api/authApi";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
    enabled: !!localStorage.getItem("access_token"),
    staleTime: 1000 * 60 * 10, // 10 min
  });
};
