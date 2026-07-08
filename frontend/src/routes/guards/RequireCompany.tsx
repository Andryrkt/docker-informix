import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useAuth } from "@/context/authContext";
import { Navigate } from "react-router";

export const RequireCompany = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, activeCompany } = useAuth();

  if (loading) return <LoaderSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const hasMultipleCompanies = (user.companies ?? []).length > 1;
  if (hasMultipleCompanies && !activeCompany) {
    return <Navigate to="/select-company" replace />;
  }

  return <>{children}</>;
};
