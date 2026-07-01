import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { postNavigationLog } from "@/domains/audit/api/auditApi";

/**
 * Génère un identifiant de session stable pour la durée de l'onglet.
 * Stocké en sessionStorage pour être unique par onglet.
 */
function getSessionId(): string {
  const KEY = "audit_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Extrait un titre lisible depuis l'URL.
 * Ex: /atelier/demande-intervention/dit-list → "DIT List"
 */
function titleFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "Accueil";
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Hook à placer dans un composant qui vit à l'intérieur du RouterProvider.
 * Enregistre automatiquement chaque changement de route comme une visite.
 *
 * @param enabled - false désactive le tracking (ex: utilisateur non authentifié)
 *
 * @example
 * // Dans un composant enfant du router (ex: AppLayout)
 * usePageTracker({ enabled: !!user });
 */
export function usePageTracker(options?: { enabled?: boolean }): void {
  const enabled = options?.enabled ?? true;
  const location = useLocation();
  const prevPathRef = useRef<string>("");
  const sessionId   = useRef<string>(getSessionId());

  useEffect(() => {
    if (!enabled) return;

    const path = location.pathname + location.search;

    // Évite de logger deux fois la même URL (StrictMode double-render)
    if (path === prevPathRef.current) return;
    prevPathRef.current = path;

    postNavigationLog({
      pageUrl:      location.pathname,
      pageTitle:    titleFromPath(location.pathname),
      actionResult: "VISITED",
      sessionId:    sessionId.current,
      refererUrl:   prevPathRef.current || null,
      searchData:   location.search
        ? Object.fromEntries(new URLSearchParams(location.search))
        : null,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, enabled]);
}

/**
 * Logue explicitement une recherche effectuée par l'utilisateur.
 *
 * @example
 * const logSearch = useSearchLogger();
 * logSearch({ numero: "DIT-2025-001", statut: "EN_COURS" });
 */
export function useSearchLogger() {
  const location = useLocation();
  const sessionId = useRef<string>(getSessionId());

  return (searchData: Record<string, unknown>): void => {
    postNavigationLog({
      pageUrl:         location.pathname,
      pageTitle:       titleFromPath(location.pathname),
      actionAttempted: "SEARCH",
      actionResult:    "SEARCHED",
      searchData,
      sessionId:       sessionId.current,
    });
  };
}

/**
 * Logue une action tentée puis annulée (ex: clic supprimer → annulation dans la modale).
 *
 * @example
 * const logCancelled = useCancelledActionLogger();
 * logCancelled("DELETE", "DIT");
 */
export function useCancelledActionLogger() {
  const location = useLocation();
  const sessionId = useRef<string>(getSessionId());

  return (action: string, context?: string): void => {
    postNavigationLog({
      pageUrl:         location.pathname,
      actionAttempted: action,
      actionResult:    "CANCELLED",
      sessionId:       sessionId.current,
      searchData:      context ? { context } : null,
    });
  };
}

/**
 * Logue une redirection vers une page d'erreur (404, 403, 500, …).
 * Appelé depuis ErrorPage ou les intercepteurs axios.
 */
export function logErrorRedirect(errorCode: number, errorMessage?: string, pageUrl?: string): void {
  postNavigationLog({
    pageUrl:      pageUrl ?? window.location.pathname,
    actionResult: "ERROR_REDIRECT",
    errorCode,
    errorMessage: errorMessage ?? null,
    sessionId:    getSessionId(),
  });
}
