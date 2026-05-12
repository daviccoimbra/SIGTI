import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { descricao } = req.body;
    const category = await prisma.category.create({
      data: { descricao },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
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
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};
