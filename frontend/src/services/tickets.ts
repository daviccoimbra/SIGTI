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
    categoryId?: string
    equipmentId?: string
    requesterId?: string
} | FormData

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


    downloadAttachment: async (
        file: string
    ) => {
        const response = await api.get(
            `/archive/${encodeURIComponent(
                file
            )}`,
            {
                responseType: "blob",
            }
        )

        const url =
            window.URL.createObjectURL(
                response.data
            )

        const a =
            document.createElement("a")

        a.href = url
        a.download = file

        document.body.appendChild(a)

        a.click()

        a.remove()

        window.URL.revokeObjectURL(url)
    },

    viewAttachment: async (
        file: string
    ) => {
        const response = await api.get(
            `/archive/${encodeURIComponent(
                file
            )}`,
            {
                responseType: "blob",
            }
        )

        const blob = new Blob([
            response.data,
        ])

        const url =
            window.URL.createObjectURL(
                blob
            )

        window.open(
            url,
            "_blank"
        )
    },

    getAttachmentUrl: async (
        file: string
    ) => {
        const response = await api.get(
            `/archive/${encodeURIComponent(
                file
            )}`,
            {
                responseType: "blob",
            }
        )

        return window.URL.createObjectURL(
            response.data
        )
    },
}