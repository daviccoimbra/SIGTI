import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const createRequester = async (req: Request, res: Response) => {
  try {
    const { nome, cargo, unidade, setor } = req.body;
    
    const requester = await prisma.requester.create({
      data: {
        nome,
        cargo,
        unidade,
        setor,
      },
    });
    
    res.status(201).json(requester);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao criar solicitante');
    res.status(500).json({ error: 'Erro ao criar solicitante' });
  }
};

export const getRequesters = async (req: Request, res: Response) => {
  try {
    const requesters = await prisma.requester.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(requesters);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao buscar solicitantes');
    res.status(500).json({ error: 'Erro ao buscar solicitantes' });
  }
};
