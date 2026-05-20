import { MdWarning } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import type { TicketData } from '../../../services/dashboard';

interface PriorityAlertsProps {
  tickets: TicketData[];
  isLoading: boolean;
}

export function PriorityAlerts({ tickets, isLoading }: PriorityAlertsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border border-slate-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas de Prioridade</h3>
        <div className="text-center py-8">
          <MdWarning className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum chamado crítico pendente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MdWarning className="text-red-500" />
        Chamados Críticos
      </h3>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-red-600">{ticket.protocolo}</span>
                  <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                    {ticket.prioridade}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{ticket.titulo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {ticket.requester?.nome || ticket.solicitante} • {ticket.departamento}
                </p>
              </div>
              <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}