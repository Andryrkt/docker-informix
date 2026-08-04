import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { useIsRestoring } from "@tanstack/react-query";
import { Navigate } from "react-router";
import Unauthorized401 from "@/error/Unauthorized401";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileError } = useAuth();

  const isRestoring = useIsRestoring();
  const hasToken = !!localStorage.getItem("access_token");

  // Waiting for auth restoration
  if (isRestoring || loading || (!user && hasToken && !profileError)) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <LoaderSpinner />
      </div>
    );
  }

  // Token exists but profile loading failed (401 from API)
  if (!user && hasToken && profileError) {
    return <Unauthorized401 />;
  }

  // No token / anonymous user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
