import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const {
      protocolo,
      solicitante,
      requesterId,
      departamento,
      categoryId,
      equipmentId,
      titulo,
      descricao,
      classificacao,
      prioridade
    } = req.body;

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
        requesterId,
        departamento,
        categoryId,
        equipmentId,
        titulo,
        descricao,
        classificacao,
        prioridade,
        status: 'backlog',
        anexo: req.file
          ? req.file.path
            .replace(/\\/g, '/')
            .replace('archive/', '')
          : null,
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    logger.error({ err: error }, 'Erro ao criar chamado');
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
        category: true,
        equipment: true,
        requester: true,
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
    logger.error({ err: error }, 'Erro ao atualizar status');
    res.status(500).json({ error: 'Erro ao atualizar status e histórico' });
  }
};

export const archiveTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params
    const { history } = req.body;

    const currentTicket = await prisma.ticket.findUnique({
      where: {
        id: String(id),
      },
    })

    if (!currentTicket) {
      return res.status(404).json({
        error: "Chamado não encontrado",
      })
    }

    const ticket = await prisma.ticket.update({
      where: {
        id: String(id),
      },
      data: {
        isArchived: !currentTicket.isArchived,
        history: {
          create: history,
        },
      },
    })

    return res.status(200).json(ticket)
  } catch (error) {
    logger.error({ err: error }, 'Erro ao arquivar chamado')

    return res.status(500).json({
      error: "Erro ao arquivar chamado",
    })
  }
}
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

export const addComment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params
    const comment = req.body

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: String(id),
      },
    })

    if (!ticket) {
      return res.status(404).json({
        error: "Chamado não encontrado",
      })
    }

    if (ticket.isArchived) {
      return res.status(400).json({
        error:
          "Não é possível comentar em um chamado arquivado",
      })
    }

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: String(id),
      },
      data: {
        comments: {
          create: comment,
        },
      },
    })

    return res.status(200).json(updatedTicket)
  } catch (error) {
    logger.error({ err: error }, 'Erro ao adicionar comentário')

    return res.status(500).json({
      error: "Erro ao adicionar comentário",
    })
  }
}