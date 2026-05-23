import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { nome, marcaModelo, unidade, setor } = req.body;
    const equipment = await prisma.equipment.create({
      data: { nome, marcaModelo, unidade, setor },
    });
    res.status(201).json(equipment);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao criar equipamento');
    res.status(500).json({ error: 'Erro ao criar equipamento' });
  }
};

export const getEquipments = async (req: Request, res: Response) => {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(equipments);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao buscar equipamentos');
    res.status(500).json({ error: 'Erro ao buscar equipamentos' });
  }
};
