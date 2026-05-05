import {
  DndContext,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";

import { useState, useEffect, useCallback } from "react";
import type { Columns, TaskT } from "../../types";
import Card from "./Cards";
import TaskModal from "../../components/TaksModal";
import { useApiTickets } from "../../services/hooks";

const Boards = () => {
  const [columns, setColumns] = useState<Columns>({
    backlog: { name: "Para Fazer (Backlog)", items: [] },
    pending: { name: "Em Andamento", items: [] },
    todo: { name: "Aguardando Cliente", items: [] },
  });
  const [selectedTask, setSelectedTask] = useState<TaskT | null>(null);
  const CURRENT_USER = "Denix"

  const fetchTickets = useCallback(async () => {
    try {
      const tickets: TaskT[] = await useApiTickets.getTickets();;
      
      const newColumns: Columns = {
        backlog: { name: "Para Fazer (Backlog)", items: [] },
        pending: { name: "Em Andamento", items: [] },
        todo: { name: "Aguardando Cliente", items: [] },
      };

    tickets.forEach(ticket => {
      const status = ticket.status as keyof Columns;
      if (newColumns[status]) {
        newColumns[status].items.push(ticket);
      }
    });

      setColumns(newColumns);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchTickets();
    }
    return () => { isMounted = false; };
  }, [fetchTickets]);

  // Sensores
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleViewTask = (task: TaskT) => {
    setSelectedTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = (active.data.current as { columnId: string })?.columnId;
    const targetColumnId = over.id as string;

    if (!sourceColumnId || !targetColumnId) return;
    if (sourceColumnId === targetColumnId) return;

    const card = columns[sourceColumnId].items.find(
      (item: TaskT) => item.id === active.id
    );
    if (!card) return;

    const newHistoryItem = {
      from: columns[sourceColumnId].name,
      to: columns[targetColumnId].name,
      user: CURRENT_USER,
      date: new Date().toISOString(),
    }

    // Optimistic update
    setColumns((prev) => {
      const sourceItems = prev[sourceColumnId].items.filter(
        (item: TaskT) => item.id !== active.id
      );

      const updatedCard = {
        ...card,
        status: targetColumnId,
        history: [...(card.history || []), newHistoryItem],
      };

      const targetItems = [...prev[targetColumnId].items, updatedCard];

      return {
        ...prev,
        [sourceColumnId]: { ...prev[sourceColumnId], items: sourceItems },
        [targetColumnId]: { ...prev[targetColumnId], items: targetItems },
      };
    });

    try {
      await useApiTickets.updateStatusTicket(card.id, targetColumnId, newHistoryItem)
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      fetchTickets(); // Revert on error
    }

    // 🔥 se o modal estiver aberto, atualiza também
    setSelectedTask((prev: TaskT | null) =>
      prev?.id === card.id
        ? {
          ...prev,
          status: targetColumnId,
          history: [...(prev.history || []), newHistoryItem],
        }
        : prev
    );
  };


  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full px-5">

        <h1 className="text-2xl mb-6 mt-[20px] font-bold">
          Kanban chamados
        </h1>

        <span className="text-[13px] text-gray-600 mb-3 block">
          Arraste os cards para alterar o status dos chamados
        </span>

        <div className="flex flex-col md:flex-row items-start gap-5 pb-8">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              id={columnId}
              column={column}
              onOpen={handleViewTask} // 🔥 passando corretamente
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={fetchTickets}
      />
    </DndContext>
  );
};

export default Boards;

interface ColumnProps {
    id: string;
    column: { name: string; items: TaskT[] };
    onOpen: (task: TaskT) => void;
}

const Column = ({ id, column, onOpen }: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col flex-1 min-w-[250px] mt-4"
    >
      <h1 className="py-[10px] w-full text-[20px] mb-2 font-semibold">
        {column.name}
      </h1>

      <span className="text-[13px] text-gray-400 mb-3">
        {column.items.length} chamados
      </span>

      <div className="p-3 rounded-lg border-2 border-gray-300">
        {column.items.map((task: TaskT) => (
          <Card
            key={task.id}
            columnId={id}
            task={task}
            onOpen={onOpen} // 🔥 corrigido aqui
          />
        ))}
      </div>
    </div>
  );
};
