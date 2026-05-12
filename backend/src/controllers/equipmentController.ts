import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { nome, marcaModelo, unidade, setor } = req.body;
    const equipment = await prisma.equipment.create({
      data: { nome, marcaModelo, unidade, setor },
    });
    res.status(201).json(equipment);
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
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
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar equipamentos' });
  }
};
