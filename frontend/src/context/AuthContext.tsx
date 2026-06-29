import type { LoginCredentials } from "@/domains/authentification/schema/loginSchema";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as authApi from "@/domains/authentification/api/authApi";
import { useProfile } from "@/domains/authentification/hook/useProfile";

interface User {
  displayName: string;
  username?: string;
  email: string;
  id: number;
  agence?: string;
  service?: string;
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
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // const { data: user, isLoading, refetch } = useProfile();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const profile: User = {
    displayName: "Andrialazantsoa ",
    email: "hajaina@test.com",
    agence: "AG-014",
    service: "Informatique",
    id: 0,
    roles: [],
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(profile);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    // const response = await authApi.login(credentials);

    // localStorage.setItem("access_token", response.token);
    localStorage.setItem("access_token", "token exemple");
    // if (response.refresh_token) {
    //   localStorage.setItem("refresh_token", response.refresh_token);
    // }
    // await refetch();
    setUser(profile);
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      // 🧹 clear query cache
      // await refetch();
      setUser(null);
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
