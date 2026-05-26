import { useQuery } from '@tanstack/react-query';
import { MdAccessTime, MdError } from 'react-icons/md';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function ActiveTicketAgeCard({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['ticket-age', queryParams],
    queryFn: () => dashboardService.getTicketAge(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
        <div className="h-10 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!data) return null;

  const isOld = data.avgAgeHours > 48;

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isOld ? 'bg-rose-50' : 'bg-blue-50'}`}>
          {isOld ? <MdError className="w-5 h-5 text-rose-600" /> : <MdAccessTime className="w-5 h-5 text-blue-600" />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Idade Média dos Tickets Ativos</h3>
          <p className="text-xs text-slate-500">Tempo desde a criação</p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className={`text-5xl font-bold tracking-tight ${isOld ? 'text-rose-600' : 'text-slate-800'}`}>
          {data.avgAgeHours}
        </span>
        <span className="text-sm text-slate-500 mb-2">horas</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {data.activeTickets} ticket{data.activeTickets !== 1 ? 's' : ''} ativo{data.activeTickets !== 1 ? 's' : ''}
        </div>
        {data.avgAgeDays > 0 && (
          <div className="text-xs text-slate-400">
            ≈ {data.avgAgeDays} dia{data.avgAgeDays !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
