import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { useIsRestoring } from "@tanstack/react-query";
import { Navigate } from "react-router";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileError } = useAuth();
  const isRestoring = useIsRestoring();
  const hasToken = !!localStorage.getItem("access_token");

  // isRestoring: PersistQueryClientProvider is reading IndexedDB — queries are paused,
  // so isLoading=false but user is not yet populated. Must wait before deciding.
  // profileError coupe l'attente : sans lui, un token expiré/invalide (401 permanent)
  // laisse (!user && hasToken) vrai pour toujours → spinner bloqué à chaque navigation.
  if (isRestoring || loading || (!user && hasToken && !profileError)) return <LoaderSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
