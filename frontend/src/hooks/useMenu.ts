// src/router/hooks/useMenu.ts
import { useAuth } from "@/context/authContext";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import type { NavigationData } from "@/domains/authentification/schema/navigationSchema";
import { useState, useEffect } from "react";

const CACHE_KEY = "menu_modules";

interface UseMenuReturn {
  modules: NavigationData["modules"] | null;
  isLoading: boolean;
  error: string | null;
}

export function useMenu(): UseMenuReturn {
  // Initialiser avec les données du cache (si elles existent)
  const [modules, setModules] = useState<NavigationData["modules"] | null>(
    () => {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
      return null;
    },
  );

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Si un cache existe, on ne considère pas le chargement en cours
    return !sessionStorage.getItem(CACHE_KEY);
  });

  const [error, setError] = useState<string | null>(null);
  const { activeCompany } = useAuth();

  useEffect(() => {
    if (!activeCompany) {
      setIsLoading(false);
      setModules(null);
      sessionStorage.removeItem(CACHE_KEY);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data: NavigationData = await fetchNavigation(activeCompany.id);

        if (!cancelled) {
          setModules(data.modules);
          // Mettre en cache les modules
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.modules));
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Erreur de chargement du menu.");
          setModules(null);
          sessionStorage.removeItem(CACHE_KEY);
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeCompany]);

  return { modules, isLoading, error };
}
