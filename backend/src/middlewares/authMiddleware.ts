import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  username: string;
  nome: string;
  setor: string;
}

// Extende a interface Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware que verifica se o token JWT é válido.
 * Caso válido, injeta os dados do usuário em `req.user`.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Tenta obter o token do cookie primeiro, depois do header Authorization como fallback
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido ou sessão expirada' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET não configurado no servidor' });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware de autorização por setor.
 * Recebe uma lista de setores permitidos e verifica se o usuário autenticado
 * pertence a algum deles.
 *
 * Uso: `router.get('/rota', authMiddleware, authorize('TI', 'ADMIN'), handler)`
 */
export const authorize = (...setoresPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!setoresPermitidos.includes(req.user.setor)) {
      return res.status(403).json({
        error: 'Acesso negado. Seu setor não tem permissão para esta ação.',
      });
    }

    return next();
  };
};
