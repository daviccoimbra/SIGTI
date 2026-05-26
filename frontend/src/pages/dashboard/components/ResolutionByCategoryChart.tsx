import { useQuery } from '@tanstack/react-query';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function ResolutionByCategoryChart({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['resolution-time-by-category', queryParams],
    queryFn: () => dashboardService.getResolutionTimeByCategory(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const maxMinutes = Math.max(...data.categories.map(c => c.avgTimeMinutes), 1);
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };
  const topCategories = data.categories.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-emerald-500 rounded-full" />
        Tempo de Resolução por Categoria
      </h3>
      <div className="space-y-4">
        {topCategories.length === 0 && (
          <p className="text-center text-slate-400 py-6">Sem dados disponíveis</p>
        )}
        {topCategories.map(cat => (
          <div key={cat.category} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 truncate">{cat.category}</span>
              <span className="text-xs text-slate-500">{formatTime(cat.avgTimeMinutes)}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                style={{ width: `${(cat.avgTimeMinutes / maxMinutes) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.categories.length > 6 && (
          <p className="text-xs text-slate-400 text-center pt-1">
            +{data.categories.length - 6} categorias
          </p>
        )}
      </div>
    </div>
  );
}
