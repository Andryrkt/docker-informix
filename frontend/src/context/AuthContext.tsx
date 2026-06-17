import type { LoginCredentials } from "@/domains/authentification/schema/loginSchema";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as authApi from "@/domains/authentification/api/authApi";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const mockUser: User = {
          id: 1,
          displayName: "Lanto Rakoto",
          username: "lanto",
          email: "lanto.rakoto@example.com",
          roles: ["ROLE_USER"],
        };

        setUser(mockUser);
        // const profile = await authApi.getProfile();
        // setUser(profile);
      } catch (error) {
        console.error("Impossible de récupérer le profil :", error);
        // En cas d'échec critique, on nettoie par sécurité
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);

    localStorage.setItem("access_token", response.token);
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    // const profile = await authApi.getProfile();
    const mockUser: User = {
      id: 1,
      displayName: "Lanto Rakoto",
      username: "lanto",
      email: "lanto.rakoto@example.com",
      roles: ["ROLE_USER"],
    };

    setUser(mockUser);
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion côté API :", error);
    } finally {
      // Quoi qu'il arrive, on nettoie le côté client
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
