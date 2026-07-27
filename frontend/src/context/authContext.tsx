import type { LoginCredentials } from "@/domains/authentification/schema/loginSchema";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { clear as clearPersistedQueryCache } from "idb-keyval";

import * as authApi from "@/domains/authentification/api/authApi";
import { useProfile } from "@/domains/authentification/hook/useProfile";

export interface Company {
  id: number;
  name: string;
  code: string;
}

interface User {
  displayName: string;
  username?: string;
  email: string;
  id: number;
  agence?: string;
  service?: string;
  roles: string[];
  companies: Company[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileError: boolean;
  activeCompany: Company | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  selectCompany: (company: Company) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profileError: false,
  activeCompany: null,
  login: async () => {},
  logout: async () => {},
  selectCompany: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: rawUser, isLoading, isError, refetch } = useProfile();

  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  // Ne jamais exposer un profil mis en cache (persisté en IndexedDB) :
  // - si la requête a échoué (token mort) ;
  // - ou s'il n'y a plus de token du tout (ex: juste après un logout, avant que
  //   le cache IndexedDB n'ait fini de se purger).
  // Sinon RequireAuth/AnonymousOnly croient l'utilisateur connecté avec un token
  // mort ou absent → boucle de rechargement login → accueil → login.
  const user = !hasToken || isError ? undefined : rawUser;

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    () => {
      const saved = localStorage.getItem("active_company_id");
      return saved ? parseInt(saved, 10) : null;
    },
  );

  const activeCompany = useMemo<Company | null>(() => {
    const companies: Company[] = user?.companies ?? [];
    if (!companies.length) return null;
    if (companies.length === 1) return companies[0];
    if (selectedCompanyId) {
      return companies.find((c: Company) => c.id === selectedCompanyId) ?? null;
    }
    return null;
  }, [user, selectedCompanyId]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem("access_token", response.token);
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    refetch();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("active_company_id");
      setSelectedCompanyId(null);
      clearPersistedQueryCache().catch(() => {});
      await refetch();
    }
  };

  const selectCompany = (company: Company) => {
    localStorage.setItem("active_company_id", String(company.id));
    setSelectedCompanyId(company.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading: isLoading,
        profileError: isError,
        activeCompany,
        selectCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
