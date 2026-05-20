import { useDraggable } from "@dnd-kit/core"
import {
  MdOutlineAccessTime,
  MdOutlineFileOpen,
  MdDragIndicator,
} from "react-icons/md"
import {
  HiOutlineUser,
  HiOutlineHashtag,
} from "react-icons/hi2"

import type { TaskT } from "../../../types"

import { formatData } from "../../../utils/formatData"

interface TaskProps {
  task: TaskT
  columnId: string
  onOpen?: (task: TaskT) => void
}

const PRIORITY_CONFIG: Record<string, {
  bg: string
  text: string
  dot: string
  bar: string
  label: string
  border: string
  hoverBg: string
}> = {
  Crítica: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-600",
    bar: "bg-gradient-to-b from-red-600 to-red-500",
    label: "Crítica",
    border: "border-red-200",
    hoverBg: "hover:bg-red-50",
  },
  Alta: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    bar: "bg-gradient-to-b from-red-500 to-red-400",
    label: "Alta",
    border: "border-red-100",
    hoverBg: "hover:bg-red-50",
  },
  Média: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-b from-amber-500 to-amber-400",
    label: "Média",
    border: "border-amber-100",
    hoverBg: "hover:bg-amber-50",
  },
  Media: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-b from-amber-500 to-amber-400",
    label: "Média",
    border: "border-amber-100",
    hoverBg: "hover:bg-amber-50",
  },
  Baixa: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    bar: "bg-gradient-to-b from-emerald-500 to-emerald-400",
    label: "Baixa",
    border: "border-emerald-100",
    hoverBg: "hover:bg-emerald-50",
  },
}

const DEFAULT_PRIORITY = {
  bg: "bg-slate-50",
  text: "text-slate-500",
  dot: "bg-slate-400",
  bar: "bg-gradient-to-b from-slate-400 to-slate-300",
  label: "—",
  border: "border-slate-100",
  hoverBg: "hover:bg-slate-50",
}

const Card = ({ columnId, task, onOpen }: TaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { columnId },
  })

  const prio = PRIORITY_CONFIG[task.prioridade] ?? DEFAULT_PRIORITY

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-full"
    >
      <div
        className={`group relative flex overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${prio.border} ${prio.hoverBg}
          ${isDragging ? "shadow-xl border-[#1e3988]/30 rotate-1 scale-105 ring-2 ring-[#1e3988]/20" : ""}`}
      >
        {/* Priority left-bar with glow */}
        <div className={`relative w-1.5 shrink-0 rounded-l-2xl ${prio.bar}`}>
          <div className={`absolute inset-0 blur-sm ${prio.bar} opacity-50`} />
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col gap-3 p-4 min-w-0">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <span 
              className="text-[15px] font-bold text-slate-800 leading-tight line-clamp-2 flex-1 min-w-0"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {task.titulo}
            </span>

            {/* Priority badge */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${prio.bg} ${prio.text}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
              {prio.label}
            </span>
          </div>

          {/* Protocolo + Solicitante */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <HiOutlineHashtag size={12} />
              <span className="font-mono">{task.protocolo}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate min-w-0">
              <HiOutlineUser size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{task.solicitante}</span>
            </span>
          </div>

          {/* Category chip (if present) */}
          {task.category?.descricao && (
            <span 
              className="inline-block w-fit rounded-lg bg-[#1e3988]/5 px-3 py-1 text-[10px] font-semibold text-[#1e3988] truncate max-w-full border border-[#1e3988]/10"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {task.category.descricao}
            </span>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <MdOutlineAccessTime size={14} className="shrink-0" />
              <span>{formatData(task.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Drag handle */}
              <div
                {...listeners}
                className="cursor-grab touch-none rounded-lg p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-all duration-200 active:cursor-grabbing"
                title="Arrastar"
              >
                <MdDragIndicator size={16} />
              </div>

              {/* Open button */}
              <button
                onClick={() => onOpen?.(task)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1e3988] hover:text-white transition-all duration-200"
                title="Abrir chamado"
              >
                <MdOutlineFileOpen size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Card