import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"

import {
  useMemo,
  useState,
} from "react"

import Card from "./Cards"
import TaskModal from "../../components/TaksModal"

import type {
  Columns,
  TaskT,
} from "../../types"

import { useTickets } from "../../hooks/useTickets"
import { useTicketMutations } from "../../hooks/useTicketMutations"
import { useAuth } from "../../hooks/useAuth"

import {
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineViewKanban,
  MdTune,
  MdSearch,
  MdSort,
} from "react-icons/md"
import {
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from "react-icons/hi2"

// ─── Column config ────────────────────────────────────────────────────────────
const COLUMN_CONFIG: Record<string, {
  label: string
  gradient: string
  border: string
  badge: string
  icon: React.ReactNode
  emptyIcon: React.ReactNode
  emptyMsg: string
}> = {
  backlog: {
    label: "Para Fazer",
    gradient: "from-blue-600 to-indigo-600",
    border: "border-blue-500",
    badge: "bg-blue-100 text-blue-700",
    icon: <HiOutlineExclamationTriangle size={16} />,
    emptyIcon: <HiOutlineExclamationTriangle size={32} className="text-blue-300" />,
    emptyMsg: "Nenhum chamado no backlog",
  },
  pending: {
    label: "Em Andamento",
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    icon: <HiOutlineClock size={16} />,
    emptyIcon: <HiOutlineClock size={32} className="text-amber-300" />,
    emptyMsg: "Nenhum chamado em andamento",
  },
  todo: {
    label: "Aguardando Cliente",
    gradient: "from-purple-600 to-violet-600",
    border: "border-purple-500",
    badge: "bg-purple-100 text-purple-700",
    icon: <HiOutlineCheckCircle size={16} />,
    emptyIcon: <HiOutlineCheckCircle size={32} className="text-purple-300" />,
    emptyMsg: "Nenhum chamado aguardando",
  },
}

const PRIORITY_OPTIONS = ["Todos", "Crítica", "Alta", "Média", "Baixa"]
const SORT_OPTIONS = [
  { value: "date-desc",      label: "Mais recentes" },
  { value: "date-asc",       label: "Mais antigos" },
  { value: "priority-desc",  label: "Maior prioridade" },
  { value: "priority-asc",   label: "Menor prioridade" },
]

const priorityScore: Record<string, number> = { Crítica: 4, Alta: 3, Média: 2, Media: 2, Baixa: 1 }

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="mb-3 w-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="h-4 w-3/4 rounded-full bg-gray-200" />
      <div className="h-5 w-12 rounded-full bg-gray-200" />
    </div>
    <div className="mb-3 h-3 w-1/2 rounded-full bg-gray-100" />
    <div className="mt-3 flex items-center justify-between">
      <div className="h-3 w-24 rounded-full bg-gray-100" />
      <div className="h-6 w-6 rounded-lg bg-gray-100" />
    </div>
  </div>
)

const ColumnSkeleton = ({ config }: { config: typeof COLUMN_CONFIG[string] }) => (
  <div className="flex min-w-[300px] flex-1 flex-col">
    <div className={`mb-3 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-full bg-white/30" />
        <div className="h-5 w-8 rounded-full bg-white/30" />
      </div>
    </div>
    <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
      {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
    </div>
  </div>
)

// ─── Main Board ───────────────────────────────────────────────────────────────
const Boards = () => {
  const { user } = useAuth()
  const CURRENT_USER = user?.username || "Desconhecido"

  const [selectedTask, setSelectedTask] = useState<TaskT | null>(null)
  const [filterPriority, setFilterPriority] = useState("Todos")
  const [sortBy, setSortBy]             = useState("date-desc")
  const [search, setSearch]             = useState("")

  const { data: tickets = [], isLoading } = useTickets(false)
  const { updateStatus } = useTicketMutations()

  // filter + sort
  const processedTickets = useMemo(() => {
    let filtered = [...tickets]

    if (filterPriority !== "Todos") {
      filtered = filtered.filter(t =>
        t.prioridade === filterPriority ||
        (filterPriority === "Média" && t.prioridade === "Media")
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.titulo.toLowerCase().includes(q) ||
        t.protocolo.toLowerCase().includes(q) ||
        t.solicitante.toLowerCase().includes(q)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === "priority-desc") return (priorityScore[b.prioridade] || 0) - (priorityScore[a.prioridade] || 0)
      if (sortBy === "priority-asc")  return (priorityScore[a.prioridade] || 0) - (priorityScore[b.prioridade] || 0)
      if (sortBy === "date-desc")     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "date-asc")      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return 0
    })

    return filtered
  }, [tickets, filterPriority, sortBy, search])

  // derived columns state
  const columns = useMemo(() => {
    const next: Columns = {
      backlog: { name: "Para Fazer", items: [] },
      pending: { name: "Em Andamento", items: [] },
      todo:    { name: "Aguardando Cliente", items: [] },
    }
    processedTickets.forEach(t => {
      const s = t.status as keyof Columns
      if (next[s]) next[s].items.push(t)
    })
    return next
  }, [processedTickets])

  // keep modal in sync
  const selectedTaskUpdated = useMemo(() => {
    if (!selectedTask) return null
    const all = Object.values(columns).flatMap(c => c.items)
    return all.find(t => t.id === selectedTask.id) || null
  }, [columns, selectedTask])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const sourceColumnId = (active.data.current as { columnId: keyof Columns })?.columnId
    const targetColumnId = over.id as keyof Columns

    if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) return

    const card = columns[sourceColumnId].items.find(i => i.id === active.id)
    if (!card) return

    const newHistoryItem = {
      from: columns[sourceColumnId].name,
      to:   columns[targetColumnId].name,
      user: CURRENT_USER,
      date: new Date().toISOString(),
    }

    // Now handled via optimistic update in useTicketMutations
    updateStatus.mutate({ cardId: card.id, targetColumnId, history: newHistoryItem })
  }

  const totalVisible = Object.values(columns).reduce((s, c) => s + c.items.length, 0)

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col bg-gray-50 min-h-full">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-8 pt-7 pb-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200">
                <MdOutlineViewKanban className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Kanban — Chamados
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Arraste os cards para mover entre colunas
                </p>
              </div>
            </div>

            {/* Total badge */}
            {!isLoading && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-blue-700">
                <span className="text-2xl font-bold">{totalVisible}</span>
                <span className="text-xs font-medium leading-tight">
                  chamados<br />
                  <span className="text-blue-400">exibidos</span>
                </span>
              </div>
            )}
          </div>

          {/* ── Filter bar ──────────────────────────────────────────────── */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar chamado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Priority pills */}
            <div className="flex items-center gap-1.5">
              <MdTune className="text-gray-400" size={18} />
              <span className="text-xs font-medium text-gray-500 mr-1">Prioridade:</span>
              {PRIORITY_OPTIONS.map(p => {
                const active = filterPriority === p
                const colorMap: Record<string, string> = {
                  Todos: active ? "bg-gray-700 text-white" : "text-gray-600 hover:bg-gray-100",
                  Crítica: active ? "bg-red-700 text-white shadow-red-300 shadow-md" : "text-red-700 hover:bg-red-50 border-red-300",
                  Alta:  active ? "bg-red-500 text-white shadow-red-200 shadow-md" : "text-red-600 hover:bg-red-50 border-red-200",
                  Média: active ? "bg-amber-500 text-white shadow-amber-200 shadow-md" : "text-amber-600 hover:bg-amber-50 border-amber-200",
                  Baixa: active ? "bg-green-500 text-white shadow-green-200 shadow-md" : "text-green-600 hover:bg-green-50 border-green-200",
                }
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${colorMap[p]} ${!active ? "border-gray-200" : "border-transparent"}`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5 ml-auto">
              <MdSort className="text-gray-400" size={16} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Kanban columns ────────────────────────────────────────────────── */}
        <div className="overflow-x-auto px-8 py-8">
          {isLoading ? (
            <div className="flex gap-5">
              {Object.keys(COLUMN_CONFIG).map(k => (
                <ColumnSkeleton key={k} config={COLUMN_CONFIG[k]} />
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-8 min-h-full">
              {Object.entries(columns).map(([columnId, column]) => (
                <Column
                  key={columnId}
                  id={columnId}
                  column={column}
                  onOpen={setSelectedTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={!!selectedTaskUpdated}
        task={selectedTaskUpdated}
        onClose={() => setSelectedTask(null)}
      />
    </DndContext>
  )
}

export default Boards

// ─── Column ───────────────────────────────────────────────────────────────────
interface ColumnProps {
  id: string
  column: { name: string; items: TaskT[] }
  onOpen: (task: TaskT) => void
}

const Column = ({ id, column, onOpen }: ColumnProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const cfg = COLUMN_CONFIG[id]

  const { setNodeRef, isOver } = useDroppable({ id })

  const totalPages = Math.ceil(column.items.length / itemsPerPage)
  
  // Ensure currentPage is always within valid bounds without using useEffect
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages))
  
  const currentItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage
    return column.items.slice(start, start + itemsPerPage)
  }, [column.items, safeCurrentPage])

  return (
    <div className="flex min-w-[350px] max-w-[450px] flex-1 flex-col">

      {/* Column header */}
      <div className={`mb-3 rounded-2xl bg-gradient-to-r ${cfg.gradient} p-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="opacity-80">{cfg.icon}</span>
            <span className="text-sm font-bold tracking-wide">{cfg.label}</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full ${cfg.badge} px-2.5 py-0.5`}>
            <span className="text-xs font-bold">{column.items.length}</span>
          </div>
        </div>

        {/* Pagination inside header */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/20 px-2 py-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-lg p-1 text-white hover:bg-white/20 disabled:opacity-30 transition"
            >
              <MdNavigateBefore size={18} />
            </button>
            <span className="text-xs font-semibold text-white">
              Página {safeCurrentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-lg p-1 text-white hover:bg-white/20 disabled:opacity-30 transition"
            >
              <MdNavigateNext size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-2xl border-2 p-3 transition-all duration-200 min-h-[300px]
          ${isOver
            ? `${cfg.border} bg-blue-50/60 shadow-inner`
            : "border-gray-100 bg-white/70 shadow-sm backdrop-blur-sm"
          }`}
      >
        {currentItems.length > 0
          ? currentItems.map(task => (
              <Card key={task.id} columnId={id} task={task} onOpen={onOpen} />
            ))
          : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              {cfg.emptyIcon}
              <p className="text-sm text-gray-400 font-medium">{cfg.emptyMsg}</p>
              <p className="text-xs text-gray-300">Arraste um chamado para cá</p>
            </div>
          )
        }
      </div>
    </div>
  )
}