import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * GET /api/users
 * Lista usuários com filtros opcionais (nome, departamento, cargo).
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { nome, departamento, cargo } = req.query;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          nome
            ? {
                nome: {
                  contains: String(nome),
                  mode: 'insensitive',
                },
              }
            : {},
          departamento
            ? {
                departamento: {
                  contains: String(departamento),
                  mode: 'insensitive',
                },
              }
            : {},
          cargo
            ? {
                cargo: {
                  contains: String(cargo),
                  mode: 'insensitive',
                },
              }
            : {},
        ],
      },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        departamento: true,
        cargo: true,
        setor: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return res.json(users);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao listar usuários');
    return res.status(500).json({ error: 'Erro interno ao listar usuários' });
  }
};

/**
 * PUT /api/users/:id
 * Atualiza os dados de um usuário específico.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nome, email, departamento, cargo, setor, ativo } = req.body;

    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nome,
        email,
        departamento,
        cargo,
        setor,
        ativo,
      },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        departamento: true,
        cargo: true,
        setor: true,
        ativo: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao atualizar usuário');
    return res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
  }
};

/**
 * DELETE /api/users/:id
 * Remove um usuário permanentemente.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    logger.info({ id }, 'Tentativa de deletar usuário');


    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não permite deletar o próprio usuário Logado (opcional mas recomendado)
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta.' });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    logger.error({ err: error }, 'Erro ao deletar usuário');
    return res.status(500).json({ error: 'Erro interno ao deletar usuário' });
  }
};

