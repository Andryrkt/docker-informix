// import LoaderSpinner from "@/components/common/LoaderSpinner";
// import { useAuth } from "@/context/AuthContext";
// import { Navigate } from "react-router";

export const AnonymousOnly = ({ children }: { children: React.ReactNode }) => {
  //   const { user, loading } = useAuth();

  //   if (loading) return <LoaderSpinner></LoaderSpinner>;
  //   if (user)
  //   return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
