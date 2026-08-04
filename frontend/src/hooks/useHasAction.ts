import { useCurrentRouteHandle } from "./useCurrentRouteHandle";

export function useHasAction(action: string): boolean {
  const handle = useCurrentRouteHandle();
  return handle?.actions?.includes(action) ?? false;
}
