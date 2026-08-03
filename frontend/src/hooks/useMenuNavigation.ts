// hooks/useNavigation.ts
import { useAuth, type Company } from "@/context/authContext";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import type { NavigationData } from "@/domains/authentification/schema/navigationSchema";
import { useQuery } from "@tanstack/react-query";

export const useMenuNavigation = () => {
  // const { activeCompany } = useAuth();

  // Test
  const activeCompany: Company = {
    id: 4,
    name: "SOMECA",
    code: "SMC",
  };

  const { data, isLoading, error, refetch } = useQuery<NavigationData>({
    queryKey: ["navigation", activeCompany?.id],
    queryFn: () => {
      if (!activeCompany) {
        throw new Error("Aucune société active");
      }
      return fetchNavigation(activeCompany.id);
    },
    enabled: !!activeCompany,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
