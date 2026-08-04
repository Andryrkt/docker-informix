// src/hooks/useCurrentRouteHandle.ts
import { useMatches } from "react-router";

export interface RouteHandle {
  title?: string;
  actions?: string[];
  scope?: {
    scopeAll: boolean;
    agencyScopes: number[];
  };
}

export function useCurrentRouteHandle(): RouteHandle | undefined {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  return current?.handle as RouteHandle | undefined;
}
