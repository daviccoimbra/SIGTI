import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function CategoryTrendChart({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['category-trend', queryParams],
    queryFn: () => dashboardService.getCategoryTrend(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const maxCount = Math.max(...data.trends.map(t => t.count), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-amber-500 rounded-full" />
        Tendência por Categoria
      </h3>
      <div className="space-y-4">
        {data.trends.length === 0 && (
          <p className="text-center text-slate-400 py-6">Sem dados disponíveis</p>
        )}
        {data.trends.slice(0, 6).map((trend, idx) => (
          <div key={trend.category} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}º</span>
                <span className="text-sm font-medium text-slate-700 truncate">{trend.category}</span>
              </div>
              <span className="text-xs text-slate-500">{trend.count} ({trend.percentage}%)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                style={{ width: `${(trend.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.trends.length > 6 && (
          <p className="text-xs text-slate-400 text-center pt-1">
            +{data.trends.length - 6} categorias
          </p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        Total: {data.totalTickets} chamados
      </div>
    </div>
  );
}
