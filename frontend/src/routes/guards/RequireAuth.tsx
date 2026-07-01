import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const hasToken = !!localStorage.getItem("access_token");

  // Show spinner while loading OR while profile hasn't arrived yet but token exists
  if (loading || (!user && hasToken)) return <LoaderSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
