import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authService, type UserData, type Setor, type LoginCredentials } from "../services/auth";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextType = {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  /** Verifica se o usuário logado pertence a algum dos setores informados */
  hasPermission: (...setores: Setor[]) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "@sigti:token";
const USER_KEY = "@sigti:user";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Recupera a sessão do localStorage ao montar
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        // Dados corrompidos — limpa tudo
        localStorage.removeItem(TOKEN_KEY);
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

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (...setores: Setor[]) => {
      if (!user) return false;
      return setores.includes(user.setor);
    },
    [user]
  );

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }

  return context;
}