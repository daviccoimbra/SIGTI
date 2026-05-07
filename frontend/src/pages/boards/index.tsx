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
  useEffect,
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

const INITIAL_COLUMNS: Columns = {
  backlog: {
    name: "Para Fazer (Backlog)",
    items: [],
  },

  pending: {
    name: "Em Andamento",
    items: [],
  },

  todo: {
    name: "Aguardando Cliente",
    items: [],
  },
}

const Boards = () => {
  const CURRENT_USER = "Denix"

  const [selectedTask, setSelectedTask] =
    useState<TaskT | null>(null)

  const [columns, setColumns] =
    useState<Columns>(INITIAL_COLUMNS)

  const {
    data: tickets = [],
    isLoading,
  } = useTickets(false)

  const { updateStatus } =
    useTicketMutations()

  // sincroniza tickets -> columns
  useEffect(() => {
    const newColumns: Columns = {
      backlog: {
        name: "Para Fazer (Backlog)",
        items: [],
      },

      pending: {
        name: "Em Andamento",
        items: [],
      },

      todo: {
        name: "Aguardando Cliente",
        items: [],
      },
    }

    tickets.forEach((ticket) => {
      const status =
        ticket.status as keyof Columns

      if (newColumns[status]) {
        newColumns[status].items.push(
          ticket
        )
      }
    })

    setColumns(newColumns)
  }, [tickets])

  // mantém modal sincronizado
  const selectedTaskUpdated =
    useMemo(() => {
      if (!selectedTask) return null

      const allTasks = Object.values(
        columns
      ).flatMap(
        (column) => column.items
      )

      return (
        allTasks.find(
          (ticket) =>
            ticket.id ===
            selectedTask.id
        ) || null
      )
    }, [columns, selectedTask])

  // sensores drag
  const sensors = useSensors(
    useSensor(PointerSensor),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const handleViewTask = (
    task: TaskT
  ) => {
    setSelectedTask(task)
  }

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event

    if (!over) return

    const sourceColumnId = (
      active.data.current as {
        columnId: keyof Columns
      }
    )?.columnId

    const targetColumnId =
      over.id as keyof Columns

    if (
      !sourceColumnId ||
      !targetColumnId
    ) {
      return
    }

    if (
      sourceColumnId ===
      targetColumnId
    ) {
      return
    }

    const card =
      columns[
        sourceColumnId
      ].items.find(
        (item) =>
          item.id === active.id
      )

    if (!card) return

    const newHistoryItem = {
      from: columns[sourceColumnId]
        .name,

      to: columns[targetColumnId]
        .name,

      user: CURRENT_USER,

      date: new Date().toISOString(),
    }

    // optimistic update
    setColumns((prev) => {
      const sourceItems =
        prev[
          sourceColumnId
        ].items.filter(
          (item) =>
            item.id !== active.id
        )

      const updatedCard = {
        ...card,

        status: targetColumnId,

        history: [
          ...(card.history || []),
          newHistoryItem,
        ],
      }

      const targetItems = [
        ...prev[targetColumnId]
          .items,
        updatedCard,
      ]

      return {
        ...prev,

        [sourceColumnId]: {
          ...prev[
            sourceColumnId
          ],

          items: sourceItems,
        },

        [targetColumnId]: {
          ...prev[
            targetColumnId
          ],

          items: targetItems,
        },
      }
    })

    // backend
    updateStatus.mutate({
      cardId: card.id,

      targetColumnId,

      history: newHistoryItem,
    })
  }

  if (isLoading) {
    return (
      <div className="p-5">
        Carregando chamados...
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full px-5">
        <h1 className="mt-5 mb-6 text-2xl font-bold">
          Kanban chamados
        </h1>

        <span className="mb-3 block text-[13px] text-gray-600">
          Arraste os cards para alterar
          o status dos chamados
        </span>

        <div className="flex flex-col items-start gap-5 pb-8 md:flex-row">
          {Object.entries(columns).map(
            ([columnId, column]) => (
              <Column
                key={columnId}
                id={columnId}
                column={column}
                onOpen={
                  handleViewTask
                }
              />
            )
          )}
        </div>
      </div>

      <TaskModal
        isOpen={
          !!selectedTaskUpdated
        }
        task={selectedTaskUpdated}
        onClose={() =>
          setSelectedTask(null)
        }
      />
    </DndContext>
  )
}

export default Boards

interface ColumnProps {
  id: string

  column: {
    name: string
    items: TaskT[]
  }

  onOpen: (task: TaskT) => void
}

const Column = ({
  id,
  column,
  onOpen,
}: ColumnProps) => {
  const { setNodeRef } =
    useDroppable({
      id,
    })

  return (
    <div
      ref={setNodeRef}
      className="mt-4 flex min-w-[250px] flex-1 flex-col"
    >
      <h1 className="mb-2 w-full py-[10px] text-[20px] font-semibold">
        {column.name}
      </h1>

      <span className="mb-3 text-[13px] text-gray-400">
        {column.items.length}{" "}
        chamados
      </span>

      <div className="rounded-lg border-2 border-gray-300 p-3 min-h-[200px]">
        {column.items.map((task) => (
          <Card
            key={task.id}
            columnId={id}
            task={task}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}