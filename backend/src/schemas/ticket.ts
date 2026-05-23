import { z } from 'zod';

export const createTicketSchema = z.object({
  protocolo: z.string().min(1, 'Protocolo é obrigatório'),
  solicitante: z.string().min(1, 'Solicitante é obrigatório'),
  requesterId: z.string().optional(),
  departamento: z.string().min(1, 'Departamento é obrigatório'),
  categoryId: z.string().optional(),
  equipmentId: z.string().optional(),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  classificacao: z.string().optional(),
  prioridade: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.string().min(1, 'Status é obrigatório'),
  tecnico: z.string().optional(),
});
