import { useQuery } from '@tanstack/react-query';
import { MdWarning, MdError } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function OverdueTicketsCard({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['overdue-tickets', queryParams],
    queryFn: () => dashboardService.getOverdueTickets(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-10 w-20 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
    );
  }

  if (!data) return null;

  const isCritical = data.overduePercentage >= 50;

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isCritical ? 'bg-rose-50' : 'bg-amber-50'}`}>
            {isCritical ? <MdError className="w-5 h-5 text-rose-600" /> : <MdWarning className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Tickets em Atraso (SLA)</h3>
            <p className="text-xs text-slate-500">Últimos {data.periodDays} dias</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-6 mb-4">
        <div>
          <span className="text-sm text-slate-500">Em atraso</span>
          <div className={`text-4xl font-bold tracking-tight ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
            {data.overdueCount}
          </div>
        </div>
        <div className="text-slate-300 text-2xl font-light">/</div>
        <div>
          <span className="text-sm text-slate-500">Total ativos</span>
          <div className="text-2xl font-bold text-slate-800">{data.totalActive}</div>
        </div>
        <div className="ml-auto">
          <div className={`text-3xl font-bold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
            {data.overduePercentage}%
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="space-y-2">
          {Object.entries(data.overdueByPriority).map(([priority, count]) => {
            const colors: Record<string, string> = {
              'Alta/Crítica': 'bg-rose-500',
              'Média': 'bg-amber-500',
              'Baixa': 'bg-blue-500',
            };
            return (
              <div key={priority} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-slate-400'}`} />
                  <span className="text-slate-600">{priority}</span>
                </div>
                <span className="font-semibold text-slate-800">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
