import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Setor } from "../../services/auth";
import type { ReactNode } from "react";

type SectorGuardProps = {
  /** Setores que têm permissão para acessar esta rota */
  allowed: Setor[];
  children: ReactNode;
  /** Rota de redirecionamento caso sem permissão (padrão: /chamados) */
  redirectTo?: string;
};

/**
 * Componente de guarda de rota por setor.
 * Renderiza os children apenas se o setor do usuário estiver na lista `allowed`.
 * Caso contrário, redireciona para a rota especificada.
 */
export function SectorGuard({ allowed, children, redirectTo = "/chamados" }: SectorGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(...allowed)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
