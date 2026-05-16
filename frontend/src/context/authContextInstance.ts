import { createContext } from "react";
import { type UserData, type Setor, type LoginCredentials } from "../services/auth";

export type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  /** Verifica se o usuário logado pertence a algum dos setores informados */
  hasPermission: (...setores: Setor[]) => boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);
