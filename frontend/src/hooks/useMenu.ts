// src/router/hooks/useMenu.ts
import { useAuth } from "@/context/authContext";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import type { NavigationData } from "@/domains/authentification/schema/navigationSchema";
import { useState, useEffect } from "react";

interface UseMenuReturn {
  modules: NavigationData["modules"] | null; // the array of modules
  isLoading: boolean;
  error: string | null;
}

export function useMenu(): UseMenuReturn {
  const [modules, setModules] = useState<NavigationData["modules"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeCompany } = useAuth(); // must return the current company ID

  useEffect(() => {
    if (!activeCompany) {
      setIsLoading(false);
      setModules(null);
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
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Erreur de chargement du menu.");
          setModules(null);
        }
      } finally {
        if (!cancelled) {
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
