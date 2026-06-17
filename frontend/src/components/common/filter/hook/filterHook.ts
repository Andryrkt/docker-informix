import { useQuery } from "@tanstack/react-query";

export function useFilterOptions(
  key?: string,
  queryFn?: () => Promise<any[]>,
  enabled = true,
) {
  return useQuery({
    queryKey: ["filter-options", key ?? "unknown"],

    // 🔥 IMPORTANT: protect against undefined
    queryFn: async () => {
      if (!queryFn) {
        throw new Error(`Missing queryFn for filter key: ${key}`);
      }
      return queryFn();
    },

    enabled: enabled && !!queryFn && !!key,

    staleTime: 1000 * 60 * 10,
  });
}
