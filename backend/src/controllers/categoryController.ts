import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { descricao } = req.body;
    const category = await prisma.category.create({
      data: { descricao },
    });
    res.status(201).json(category);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao criar categoria');
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { descricao: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao buscar categorias');
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};
