import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import jwt from 'jsonwebtoken'

import prisma from '../lib/prisma.js'

export interface JwtPayload {
  id: string
}

// Extende a interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        nome: string
        setor: string
        ativo: boolean
      }
    }
  }
}

/**
 * Middleware de autenticação
 * - Valida JWT
 * - Verifica se usuário ainda existe
 * - Verifica se usuário está ativo
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Cookie primeiro, Authorization como fallback
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(
        ' '
      )[1]

    if (!token) {
      return res
        .status(401)
        .json({
          error:
            'Token não fornecido ou sessão expirada',
        })
    }

    const secret =
      process.env.JWT_SECRET

    if (!secret) {
      return res
        .status(500)
        .json({
          error:
            'JWT_SECRET não configurado no servidor',
        })
    }

    // Decodifica token
    const decoded =
      jwt.verify(
        token,
        secret
      ) as JwtPayload

    // Busca usuário atualizado no banco
    const user =
      await prisma.user.findUnique(
        {
          where: {
            id: decoded.id,
          },

          select: {
            id: true,
            username: true,
            nome: true,
            setor: true,
            ativo: true,
          },
        }
      )

    // Usuário não existe mais
    if (!user) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return res.status(401).json({ error: 'Usuário não encontrado' });
    })
    }

    // Usuário desativado
    if (!user.ativo) {
      res.clearCookie(
        'token',
        {
          httpOnly: true,
          secure:
            process.env
              .NODE_ENV ===
            'production',
          sameSite: 'lax',
        }
      )

      return res
        .status(403)
        .json({
          error:
            'Usuário desativado',
        })
    }

    // Injeta usuário atualizado
    req.user = user

    return next()
  } catch {
    return res
      .status(401)
      .json({
        error:
          'Token inválido ou expirado',
      })
  }
}

/**
 * Middleware de autorização por setor
 */
export const authorize = (
  ...setoresPermitidos: string[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          error:
            'Usuário não autenticado',
        })
    }

    if (
      !setoresPermitidos.includes(
        req.user.setor
      )
    ) {
      return res
        .status(403)
        .json({
          error:
            'Acesso negado. Seu setor não tem permissão para esta ação.',
        })
    }

    return next()
  }
}