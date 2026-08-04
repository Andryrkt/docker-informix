// hooks/useNavigation.ts
import { useAuth, type Company } from "@/context/authContext";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import type { NavigationData } from "@/domains/authentification/schema/navigationSchema";
import { useQuery } from "@tanstack/react-query";

export const useMenuNavigation = () => {
  const { activeCompany } = useAuth();
  alert(JSON.stringify(activeCompany));

  const { data, isLoading, error, refetch } = useQuery<NavigationData>({
    queryKey: ["navigation-api", activeCompany.id],
    queryFn: () => fetchNavigation(activeCompany.id),
    staleTime: 0,
    gcTime: 0,
    // refetchOnMount: true,
    // refetchOnWindowFocus: true,
    // refetchOnReconnect: true,
    // retry: 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
