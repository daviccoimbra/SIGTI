import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { protocolo, solicitante, departamento, titulo, descricao, prioridade } = req.body;
    
    // Check if protocol already exists
    const existing = await prisma.ticket.findUnique({
      where: { protocolo }
    });

    if (existing) {
      return res.status(400).json({ error: 'Já existe um chamado com este protocolo' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        protocolo,
        solicitante,
        departamento,
        titulo,
        descricao,
        prioridade,
        status: 'backlog',
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Erro detalhado ao criar chamado:', error);
    res.status(500).json({ error: 'Erro interno ao criar chamado. Verifique a conexão com o banco de dados.' });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const archived = req.query.archived === 'true';
    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: archived,
      },
      include: {
        comments: true,
        history: true,
      },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, history } = req.body;
    
    // Using transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: id as string },
        data: { status: status as string },
      });

      if (history) {
        await tx.history.create({
          data: {
            from: history.from,
            to: history.to,
            user: history.user,
            date: history.date,
            ticketId: ticket.id
          }
        });
      }

      return ticket;
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar status (transação):', error);
    res.status(500).json({ error: 'Erro ao atualizar status e histórico' });
  }
};

export const archiveTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data: { isArchived: true },
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao arquivar chamado' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({
      where: { id: id as string },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};
