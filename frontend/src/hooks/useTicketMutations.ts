import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { ticketsService } from "../services/tickets"
import type { HistoryItem, CommentT, TaskT } from "../types"

export const useTicketMutations = () => {
  const queryClient = useQueryClient()

  const invalidateTickets = () => {
    queryClient.invalidateQueries({
      queryKey: ["tickets"],
    })
  }

  // CREATE
  const createTicket = useMutation({
    mutationFn: ticketsService.newTicket,
    onSuccess: invalidateTickets,
  })

  // UPDATE STATUS (with Optimistic Update)
  const updateStatus = useMutation({
    mutationFn: ({
      cardId,
      targetColumnId,
      history,
    }: {
      cardId: string
      targetColumnId: string
      history: HistoryItem
    }) =>
      ticketsService.updateStatusTicket(
        cardId,
        targetColumnId,
        history
      ),

    onMutate: async ({ cardId, targetColumnId, history }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["tickets"] })

      // Snapshot the previous value
      const previousTickets = queryClient.getQueryData<TaskT[]>(["tickets"])

      // Optimistically update to the new value
      if (previousTickets) {
        queryClient.setQueryData<TaskT[]>(["tickets"], (old) => {
          if (!old) return []
          return old.map((t) => {
            if (t.id === cardId) {
              return {
                ...t,
                status: targetColumnId,
                history: [...(t.history || []), history],
              }
            }
            return t
          })
        })
      }

      // Return a context object with the snapshotted value
      return { previousTickets }
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets)
      }
    },

    // Always refetch after error or success:
    onSettled: () => {
      invalidateTickets()
    },
  })

  // COMMENT
  const addComment = useMutation({
    mutationFn: ({
      ticketId,
      comment,
    }: {
      ticketId: string
      comment: CommentT
    }) =>
      ticketsService.addComment(
        ticketId,
        comment
      ),
    onSuccess: invalidateTickets,
  })

  // ARCHIVE
  const archiveTicket = useMutation({
    mutationFn: ({
      id,
      history,
    }: {
      id: string
      history: HistoryItem
    }) =>
      ticketsService.updateArchiveTicket(
        id,
        history
      ),
    onSuccess: invalidateTickets,
  })

  // DELETE
  const deleteTicket = useMutation({
    mutationFn: (id: string) => ticketsService.deleteTicket(id),
    onSuccess: invalidateTickets,
  })

  return {
    createTicket,
    updateStatus,
    addComment,
    archiveTicket,
    deleteTicket,
  }
}