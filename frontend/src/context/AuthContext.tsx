import type { LoginCredentials } from "@/domains/authentification/schema/loginSchema";
import { createContext, useContext, type ReactNode } from "react";

import * as authApi from "@/domains/authentification/api/authApi";
import { useProfile } from "@/domains/authentification/hook/useProfile";

interface User {
  displayName: string;
  username?: string;
  email: string;
  id: number;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  // forgotPassword: async () => {},
  // resetPassword: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: user, isLoading, refetch } = useProfile();

  // Login
  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);

    localStorage.setItem("access_token", response.token);
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    await refetch();
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // 🧹 clear query cache
      await refetch();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
