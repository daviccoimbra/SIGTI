import { useEffect, useState, useCallback, useMemo } from 'react';
import type { TaskT } from '../../types';
import TaskModal from '../../components/TaksModal';
import { MdSearch } from 'react-icons/md';
import { useApiTickets } from '../../services/hooks';

const Archive = () => {
  const [archivedTickets, setArchivedTickets] = useState<TaskT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskT | null>(null);

  const fetchArchived = useCallback(async () => {
    try {
      const tickets = await useApiTickets.getTicketsArchived();
      setArchivedTickets(tickets);
    } catch (error) {
      console.error('Erro ao buscar arquivados:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchArchived();
    }
    return () => { isMounted = false; };
  }, [fetchArchived]);

  const filteredTickets = useMemo(() => {
    return archivedTickets.filter(ticket =>
      ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, archivedTickets]);

  return (
    <div className="w-full px-5 py-8">
      <h1 className="text-2xl font-bold mb-6">Chamados Arquivados</h1>

      <div className="relative mb-6 max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <MdSearch size={20} />
        </span>
        <input
          type="text"
          placeholder="Pesquisar por título, protocolo ou solicitante..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum chamado arquivado encontrado.</td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">#{ticket.protocolo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.solicitante}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full text-white font-bold ${ticket.prioridade === 'Alta' ? 'bg-red-500' :
                        ticket.prioridade === 'Media' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                      {ticket.prioridade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedTask(ticket)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TaskModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={fetchArchived}
      />
    </div>
  );
};

export default Archive;