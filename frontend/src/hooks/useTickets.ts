import { useQuery } from "@tanstack/react-query"

import { ticketsService } from "../services/tickets"

export const useTickets = (
  archived?: boolean
) => {
  return useQuery({
    queryKey: ["tickets", archived],

    queryFn: () =>
      ticketsService.getTickets(
        archived
      ),
  })
}