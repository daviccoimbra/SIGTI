import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { ticketsService } from "../services/tickets"

export const useTicketMutations = () => {
  const queryClient =
    useQueryClient()

  const invalidateTickets = () => {
    queryClient.invalidateQueries({
      queryKey: ["tickets"],
    })
  }

  // CREATE
  const createTicket =
    useMutation({
      mutationFn:
        ticketsService.newTicket,

      onSuccess:
        invalidateTickets,
    })

  // UPDATE STATUS
  const updateStatus =
    useMutation({
      mutationFn: ({
        cardId,
        targetColumnId,
        history,
      }: {
        cardId: string
        targetColumnId: string
        history: any
      }) =>
        ticketsService.updateStatusTicket(
          cardId,
          targetColumnId,
          history
        ),

      onSuccess:
        invalidateTickets,
    })

  // COMMENT
  const addComment =
    useMutation({
      mutationFn: ({
        ticketId,
        comment,
      }: {
        ticketId: string
        comment: any
      }) =>
        ticketsService.addComment(
          ticketId,
          comment
        ),

      onSuccess:
        invalidateTickets,
    })

  // ARCHIVE
  const archiveTicket =
    useMutation({
      mutationFn: ({
        id,
        history,
      }: {
        id: string
        history: any
      }) =>
        ticketsService.updateArchiveTicket(
          id,
          history
        ),

      onSuccess:
        invalidateTickets,
    })

  // DELETE
  const deleteTicket =
    useMutation({
      mutationFn: (
        id: string
      ) =>
        ticketsService.deleteTicket(
          id
        ),

      onSuccess:
        invalidateTickets,
    })

  return {
    createTicket,
    updateStatus,
    addComment,
    archiveTicket,
    deleteTicket,
  }
}