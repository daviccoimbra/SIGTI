import { useState, useEffect, useCallback, ReactNode } from "react";
import { authService, type UserData, type Setor, type LoginCredentials } from "../services/auth";
import { AuthContext } from "./authContextInstance";

type AuthProviderProps = {
  children: ReactNode;
};

const USER_KEY = "@sigti:user";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Recupera a sessão do localStorage ao montar
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
      } catch {
        // Dados corrompidos — limpa tudo
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login({
      username: credentials.username,
      password: credentials.password,
    });

    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (...setores: Setor[]) => {
      if (!user) return false;
      return setores.includes(user.setor);
    },
    [user]
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}