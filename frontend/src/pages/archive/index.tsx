import {
  useMemo,
  useState,
} from "react"

import {
  MdSearch,
} from "react-icons/md"

import type {
  TaskT,
} from "../../types"

import TaskModal from "../../components/TaksModal"

import { formatData } from "../../utils/formatData"

import { useTickets } from "../../hooks/useTickets"

const Archive = () => {
  const [searchTerm, setSearchTerm] =
    useState("")

  const [selectedTask, setSelectedTask] =
    useState<TaskT | null>(null)

const {
  data: archivedTickets = [],
  isLoading,
  isError,
} = useTickets(true)

  const filteredTickets = useMemo(() => {
    const term =
      searchTerm.toLowerCase()

    return archivedTickets.filter(
      (ticket) =>
        ticket.titulo
          .toLowerCase()
          .includes(term) ||
        ticket.protocolo
          .toLowerCase()
          .includes(term) ||
        ticket.solicitante
          .toLowerCase()
          .includes(term)
    )
  }, [
    searchTerm,
    archivedTickets,
  ])

  return (
    <div className="min-h-screen w-full bg-gray-100 p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Chamados Arquivados
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Visualize e pesquise
            chamados arquivados
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6 w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <MdSearch size={20} />
          </span>

          <input
            type="text"
            value={searchTerm}
            placeholder="Pesquisar chamados..."
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-white
              py-3
              pr-4
              pl-10
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {[
                    "Data",
                    "Protocolo",
                    "Título",
                    "Solicitante",
                    "Prioridade",
                    "Ações",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase whitespace-nowrap sm:px-6"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Carregando chamados...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-red-500"
                    >
                      Erro ao carregar
                      chamados.
                    </td>
                  </tr>
                ) : filteredTickets.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Nenhum chamado
                      arquivado encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(
                    (ticket) => (
                      <tr
                        key={ticket.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-700 sm:px-6">
                          {formatData(
                            ticket.createdAt
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap text-gray-700 sm:px-6">
                          #
                          {
                            ticket.protocolo
                          }
                        </td>

                        <td className="min-w-[220px] px-4 py-4 text-sm text-gray-800 sm:px-6">
                          <div className="line-clamp-2">
                            {
                              ticket.titulo
                            }
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600 sm:px-6">
                          {
                            ticket.solicitante
                          }
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                          <span
                            className={`
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-bold
                              text-white
                              ${
                                ticket.prioridade ===
                                "Alta"
                                  ? "bg-red-500"
                                  : ticket.prioridade ===
                                    "Media"
                                  ? "bg-yellow-500"
                                  : ticket.prioridade ===
                                    "Crítica"
                                  ? "bg-red-700"
                                  : "bg-green-500"
                              }
                            `}
                          >
                            {
                              ticket.prioridade
                            }
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                          <button
                            onClick={() =>
                              setSelectedTask(
                                ticket
                              )
                            }
                            className="
                              text-sm
                              font-medium
                              text-blue-600
                              transition-colors
                              hover:text-blue-800
                            "
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />
    </div>
  )
}

export default Archive