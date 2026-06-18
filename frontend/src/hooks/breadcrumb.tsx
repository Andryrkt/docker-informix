import {
  fetchBreadcrumbs,
  fetchBreadcrumbsMock,
} from "@/conf/api/breadcrumbApi";
import { useQuery } from "@tanstack/react-query";

export function useBreadcrumbs(route: string) {
  return useQuery({
    queryKey: ["breadcrumbs", route],
    // queryFn: () => fetchBreadcrumbs(route),
    queryFn: () => fetchBreadcrumbsMock(route),
    staleTime: 1000 * 60 * 10, // 10 min (breadcrumbs rarely change)
  });
}
