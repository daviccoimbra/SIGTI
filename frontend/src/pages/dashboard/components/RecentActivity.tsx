import type { TicketData } from '../../../services/dashboard';

interface RecentActivityProps {
  tickets: TicketData[];
  isLoading: boolean;
}

const statusColors: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-blue-100 text-blue-700',
  analise: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-green-100 text-green-700',
  concluido: 'bg-green-100 text-green-700',
  closed: 'bg-purple-100 text-purple-700',
  fechado: 'bg-purple-100 text-purple-700',
};

const priorityColors: Record<string, string> = {
  alta: 'text-red-600 bg-red-50',
  alta_critica: 'text-red-700 bg-red-100',
  media: 'text-amber-600 bg-amber-50',
  baixa: 'text-green-600 bg-green-50',
};

export function RecentActivity({ tickets, isLoading }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      backlog: 'Backlog',
      in_progress: 'Em Progresso',
      em_andamento: 'Em Andamento',
      analise: 'Em Análise',
      resolved: 'Resolvido',
      concluido: 'Concluído',
      closed: 'Fechado',
      fechado: 'Fechado',
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
        <p className="text-gray-500 text-center py-8">Nenhum chamado encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Protocolo</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Título</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Solicitante</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Prioridade</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 text-sm font-mono text-gray-600">{ticket.protocolo}</td>
                <td className="py-3 text-sm text-gray-800 max-w-xs truncate">{ticket.titulo}</td>
                <td className="py-3 text-sm text-gray-600">{ticket.requester?.nome || ticket.solicitante}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-700'}`}>
                    {formatStatus(ticket.status)}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.prioridade?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                    {ticket.prioridade}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-500">{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}