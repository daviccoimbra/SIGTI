import { createContext, useContext, useState, ReactNode } from "react";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextType = {
  login: () => void;
  loading: boolean;
  token: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(null);
  const [token, setToken] = useState(true);

  const login = () => {
    console.log("logando...");
  };

  return (
    <AuthContext.Provider value={{ login, loading, token }}>
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