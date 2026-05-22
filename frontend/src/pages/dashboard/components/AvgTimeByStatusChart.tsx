import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams, type AvgTimeByStatusData } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

function StatusBar({ status, avgHours, count, max }: { status: string; avgHours: number; count: number; max: number }) {
  const barColor =
    status === 'Para Fazer' ? 'bg-amber-500' :
    status === 'Em Andamento' ? 'bg-blue-500' :
    'bg-purple-500';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{status}</span>
        <span className="text-xs text-slate-500">{avgHours}h ({count} ocorrências)</span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out group-hover:opacity-80`}
          style={{ width: `${max > 0 ? (avgHours / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export function AvgTimeByStatusChart({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['avg-time-by-status', queryParams],
    queryFn: () => dashboardService.getAvgTimeByStatus(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-3 bg-slate-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const maxHours = Math.max(...data.byStatus.map(s => s.avgHours), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-indigo-500 rounded-full" />
        Tempo Médio por Status
      </h3>
      <div className="space-y-5">
        {data.byStatus.map(s => (
          <StatusBar key={s.status} status={s.status} avgHours={s.avgHours} count={s.count} max={maxHours} />
        ))}
      </div>
    </div>
  );
}
