import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router-dom";

export const AnonymousOnly = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoaderSpinner></LoaderSpinner>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
