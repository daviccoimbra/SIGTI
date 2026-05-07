import { useDraggable } from "@dnd-kit/core"
import {
  MdOutlineAccessTime,
  MdOutlineFileOpen
} from "react-icons/md"

import { TaskT } from "../../../types"

interface TaskProps {
  task: TaskT
  columnId: string
  onOpen?: (task: TaskT) => void
}

const Card = ({ columnId, task, onOpen }: TaskProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { columnId },
  })



  const formatData = (new Date(task.createdAt)).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  }

  const prioridadeColor =
    task.prioridade === "Alta"
      ? "bg-[#ff6900]"
      : task.prioridade === "Media"
        ? "bg-[#f0b100]"
        : "bg-[#00c950]"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="mb-3 w-full"
    >
      {/* 🔥 CONTAINER VISUAL (SEM CONFLITO COM DRAG) */}
      <div
        className="bg-white p-3 rounded-xl shadow-md border-2 
                   transition-all duration-200
                   hover:shadow-xl hover:-translate-y-[3px] hover:border-blue-400"
      >
        {/* DRAG HANDLE */}
        <div
          {...listeners}
          className="cursor-grab touch-none mb-2 flex flex-col gap-1 text-gray-500"
          title="Segure e arraste"
        >
          {/* Título + prioridade */}
          <div className="w-full flex justify-between items-start min-w-0 gap-2">
            <span className="text-[15.5px] text-[#1e40af] font-bold truncate min-w-0">
              {task.titulo}
            </span>

            <span
              className={`px-2 py-[2px] text-[12px] rounded-3xl text-white font-bold whitespace-nowrap ${prioridadeColor}`}
            >
              {task.prioridade}
            </span>
          </div>

          {/* Subtítulo */}
          <span className="text-[13.5px] text-gray-500 truncate min-w-0">
            {task.solicitante} #{task.protocolo}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full border border-dashed my-2"></div>

        {/* Rodapé */}
        <div className="w-full flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <MdOutlineAccessTime color="#666" size={18} />
            <span className="text-xs text-gray-700">
            {formatData}
            </span>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onOpen?.(task)}
              className="p-1 group hover:bg-green-600/70 rounded-lg transition"
              title="Acessar chamado"
            >
              <MdOutlineFileOpen className="text-black group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card