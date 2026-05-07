import api from "./api"
import type {
    CommentT,
    HistoryItem,
    TaskT,
} from "../types"

type Payload = {
    titulo: string
    descricao: string
    prioridade: string
    protocolo: string
    solicitante: string
    departamento: string
}

export const ticketsService = {
    newTicket: async (payload: Payload) => {
        const { data } = await api.post(
            "/tickets",
            payload
        )

        return data
    },

    deleteTicket: async (id: string) => {
        const { data } = await api.delete(
            `/tickets/${id}`
        )

        return data
    },

    getTickets: async (
        archived?: boolean
    ): Promise<TaskT[]> => {
        const { data } = await api.get(
            `/tickets${archived
                ? "?archived=true"
                : ""
            }`
        )

        return data
    },

    updateStatusTicket: async (
        cardId: string,
        targetColumnId: string,
        newHistoryItem: HistoryItem
    ) => {
        const { data } = await api.patch(
            `/tickets/${cardId}/status`,
            {
                status: targetColumnId,
                history: newHistoryItem,
            }
        )

        return data
    },

    updateArchiveTicket: async (
        id: string,
        newHistoryItem: HistoryItem
    ) => {
        const { data } = await api.patch(
            `/tickets/${id}/archive`,
            {
                history: newHistoryItem,
            }
        )

        return data
    },

    addComment: async (
        ticketId: string,
        comment: CommentT
    ) => {
        const { data } = await api.patch(
            `/tickets/${ticketId}/comment`,
            comment
        )

        return data
    },
}