// hooks/useNavigation.ts
import { useAuth, type Company } from "@/context/authContext";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import type { NavigationData } from "@/domains/authentification/schema/navigationSchema";
import { useQuery } from "@tanstack/react-query";

export const useMenuNavigation = () => {
  const { activeCompany } = useAuth();

  return useQuery<NavigationData>({
    queryKey: ["navigation-api", activeCompany?.id],
    queryFn: () => fetchNavigation(activeCompany!.id),
    enabled: !!activeCompany,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};
