import api from "./api";
import type { TaskT, HistoryItem } from "../types";
import Archive from "../pages/archive";

type Payload = {
    titulo: string;
    descricao: string;
    prioridade: string;
    protocolo: string;
    solicitante: string;
    departamento: string;
}



export const useApiTickets = {
    newTicket: (payload: Payload) => api.post('/tickets', payload),
    
    deleteTicket: (id:string) => api.delete(`/tickets/${id}`),

    getTickets: async (): Promise<TaskT[]> => {
        const { data } = await api.get('/tickets');
        return data;
    },

    getTicketsArchived: async (): Promise<TaskT[]> => {
        const { data } = await api.get('/tickets?archived=true');
        return data;
    },

    updateStatusTicket: (
        cardId: string,
        targetColumnId: string,
        newHistoryItem: HistoryItem
    ) => {
        api.patch(`/tickets/${cardId}/status`, {
            status: targetColumnId,
            history: newHistoryItem
        })
    },

    updateArchiveTicket: (id:string) => api.patch(`/tickets/${id}/archive`)

}