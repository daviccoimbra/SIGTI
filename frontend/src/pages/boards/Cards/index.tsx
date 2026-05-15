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

import { TaskT } from "../../../types"

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
}> = {
  Alta: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    bar: "bg-gradient-to-b from-red-500 to-red-400",
    label: "Alta",
  },
  Média: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-b from-amber-500 to-amber-400",
    label: "Média",
  },
  Media: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    bar: "bg-gradient-to-b from-amber-500 to-amber-400",
    label: "Média",
  },
  Baixa: {
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
    bar: "bg-gradient-to-b from-green-500 to-green-400",
    label: "Baixa",
  },
}

const DEFAULT_PRIORITY = {
  bg: "bg-gray-50",
  text: "text-gray-500",
  dot: "bg-gray-400",
  bar: "bg-gradient-to-b from-gray-400 to-gray-300",
  label: "—",
}

const Card = ({ columnId, task, onOpen }: TaskProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { columnId },
  })

  const prio = PRIORITY_CONFIG[task.prioridade] ?? DEFAULT_PRIORITY

  const formatDate = new Date(task.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

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
        className={`group relative flex overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200
          hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200
          ${isDragging ? "shadow-xl border-blue-300 rotate-1 scale-105" : "border-gray-100"}`}
      >
        {/* Priority left-bar */}
        <div className={`w-1 shrink-0 rounded-l-xl ${prio.bar}`} />

        {/* Card body */}
        <div className="flex flex-1 flex-col gap-3 p-5 min-w-0">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-[16px] font-bold text-gray-800 leading-tight line-clamp-2 flex-1 min-w-0">
              {task.titulo}
            </span>

            {/* Priority badge */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${prio.bg} ${prio.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${prio.dot}`} />
              {prio.label}
            </span>
          </div>

          {/* Protocolo + Solicitante */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <HiOutlineHashtag size={13} />
              {task.protocolo}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-gray-500 truncate min-w-0">
              <HiOutlineUser size={13} className="shrink-0" />
              <span className="truncate">{task.solicitante}</span>
            </span>
          </div>

          {/* Category chip (if present) */}
          {task.category?.descricao && (
            <span className="inline-block w-fit rounded-md bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600 truncate max-w-full">
              {task.category.descricao}
            </span>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-gray-100 pt-3">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <MdOutlineAccessTime size={15} className="shrink-0" />
              <span>{formatDate}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <div
                {...listeners}
                className="cursor-grab touch-none rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition"
                title="Arrastar"
              >
                <MdDragIndicator size={18} />
              </div>

              {/* Open button */}
              <button
                onClick={() => onOpen?.(task)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-600 hover:text-white transition"
                title="Abrir chamado"
              >
                <MdOutlineFileOpen size={17} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Card