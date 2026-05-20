import {
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react"

import {
  MdSearch,
  MdRefresh,
  MdInbox,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md"

import {
  HiOutlineArchiveBox,
  HiOutlineTrash,
} from "react-icons/hi2"

import type {
  TaskT,
} from "../../types"

import TaskModal from "../../components/TaksModal"
import { Tooltip } from "../../components/Tooltip"

import { formatData } from "../../utils/formatData"

import { useTickets } from "../../hooks/useTickets"
import { useToast } from "../../hooks/useToast"
import { ticketsService } from "../../services/tickets"

const Archive = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskT | null>(null)
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const selectAllRef = useRef<HTMLInputElement>(null)
  const { showMessage } = useToast()

  const {
    data: archivedTickets = [],
    isLoading,
    isError,
    refetch,
  } = useTickets(true)

  const filteredTickets = useMemo(() => {
    const term = searchTerm.toLowerCase()

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

  useEffect(() => {
    if (selectAllRef.current) {
      const isIndeterminate = selectedTickets.length > 0 && selectedTickets.length < filteredTickets.length && filteredTickets.length > 0
      selectAllRef.current.indeterminate = isIndeterminate
    }
  }, [selectedTickets, filteredTickets])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id))
      setIsSelectAll(true)
    } else {
      setSelectedTickets([])
      setIsSelectAll(false)
    }
  }

  const handleTicketSelect = (ticketId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(prev => [...prev, ticketId])
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId))
      setIsSelectAll(false)
    }
  }

  const handleRestoreSelected = async () => {
    if (selectedTickets.length === 0) return

    setIsRestoring(true)
    try {
      for (const ticketId of selectedTickets) {
        await ticketsService.updateArchiveTicket(ticketId, {
          from: 'arquivado',
          to: 'backlog',
          user: 'Sistema',
          date: new Date().toISOString()
        })
      }

      setSelectedTickets([])
      setIsSelectAll(false)
      refetch()
      
      showMessage(`${selectedTickets.length} chamado(s) restaurado(s) com sucesso!`, 'success')
    } catch (error) {
      showMessage('Erro ao restaurar chamados. Tente novamente.', 'error')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTickets.length === 0) return

    if (!window.confirm(`Tem certeza que deseja excluir permanentemente ${selectedTickets.length} chamado(s)? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsDeleting(true)
    try {
      for (const ticketId of selectedTickets) {
        await ticketsService.deleteTicket(ticketId)
      }

      setSelectedTickets([])
      setIsSelectAll(false)
      refetch()

      showMessage(`${selectedTickets.length} chamado(s) excluído(s) com sucesso!`, 'success')
    } catch (error) {
      showMessage('Erro ao excluir chamados. Tente novamente.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const getPriorityStyle = (prioridade: string) => {
    if (prioridade === 'Alta' || prioridade === 'Crítica') {
      return 'bg-rose-50 text-rose-700 border-rose-200'
    }
    if (prioridade === 'Media' || prioridade === 'Média') {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3988] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HiOutlineArchiveBox className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-slate-800 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Arquivo
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Gerencie chamados arquivados
              </p>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
        </div>

        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-slate-400 group-focus-within:text-[#1e3988] transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                placeholder="Buscar por título, protocolo ou solicitante..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1e3988]/10 focus:border-[#1e3988] focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Stats & Bulk Actions */}
            <div className="flex items-center gap-5">
              <div className="text-sm">
                <span className="font-semibold text-slate-700">{filteredTickets.length}</span>
                <span className="text-slate-400"> de </span>
                <span className="font-semibold text-slate-700">{archivedTickets.length}</span>
                <span className="text-slate-500 ml-1">itens</span>
              </div>

              {selectedTickets.length > 0 && (
                <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 bg-[#1e3988]/5 px-3 py-1.5 rounded-lg border border-[#1e3988]/10">
                    {selectedTickets.length} selecionado{selectedTickets.length > 1 ? 's' : ''}
                  </span>
                  <Tooltip content="Restaurar chamados selecionados para o backlog">
                    <button
                      onClick={handleRestoreSelected}
                      disabled={isRestoring}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <MdRefresh className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                      Restaurar
                    </button>
                  </Tooltip>
                  <Tooltip content="Excluir permanentemente os chamados selecionados">
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <HiOutlineTrash className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                      Excluir
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Carregando registros...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-rose-600 font-medium">Erro ao carregar chamados</p>
                <p className="text-sm text-slate-500 mt-1">Tente novamente mais tarde</p>
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 shadow-inner">
                <MdInbox className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">Nenhum registro encontrado</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? 'Tente ajustar sua busca' : 'O arquivo está vazio'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-4 text-left w-12">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={isSelectAll && filteredTickets.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-[#1e3988] focus:ring-[#1e3988]/20"
                      />
                    </th>
                    {[
                      { label: 'Data', width: 'w-28' },
                      { label: 'Protocolo', width: 'w-24' },
                      { label: 'Título', width: '' },
                      { label: 'Solicitante', width: 'w-40' },
                      { label: 'Prioridade', width: 'w-28' },
                      { label: '', width: 'w-20' },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${col.width}`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-all duration-200 cursor-pointer group hover:shadow-sm"
                      onClick={() => setSelectedTask(ticket)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={(e) => handleTicketSelect(ticket.id, e)}
                          className="h-4 w-4 rounded border-slate-300 text-[#1e3988] focus:ring-[#1e3988]/20"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap font-medium">
                        {formatData(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap font-mono">
                        #{ticket.protocolo}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700 line-clamp-2 max-w-md font-medium">
                          {ticket.titulo}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {ticket.solicitante}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border ${getPriorityStyle(ticket.prioridade)}`}>
                          {ticket.prioridade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip content="Ver detalhes do chamado">
                          <button
                            onClick={() => setSelectedTask(ticket)}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                          >
                            Ver
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination & Footer Info */}
        {filteredTickets.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{startIndex + 1}</span>
              <span className="text-slate-400"> - </span>
              <span className="font-semibold text-slate-700">{Math.min(endIndex, filteredTickets.length)}</span>
              <span className="text-slate-400"> de </span>
              <span className="font-semibold text-slate-700">{filteredTickets.length}</span>
              <span className="text-slate-400 ml-1">registros</span>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MdNavigateBefore className="w-4 h-4" />
                  Anterior
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#1e3988] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                  <MdNavigateNext className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="hidden sm:block text-xs text-slate-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  )
}

export default Archive