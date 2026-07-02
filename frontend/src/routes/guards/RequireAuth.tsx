import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { useIsRestoring } from "@tanstack/react-query";
import { Navigate } from "react-router";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const isRestoring = useIsRestoring();
  const hasToken = !!localStorage.getItem("access_token");

  // isRestoring: PersistQueryClientProvider is reading IndexedDB — queries are paused,
  // so isLoading=false but user is not yet populated. Must wait before deciding.
  if (isRestoring || loading || (!user && hasToken)) return <LoaderSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
