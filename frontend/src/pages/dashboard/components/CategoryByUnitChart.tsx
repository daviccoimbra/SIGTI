import { useQuery } from '@tanstack/react-query';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function CategoryByUnitChart({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['category-by-unit', queryParams],
    queryFn: () => dashboardService.getCategoryByUnit(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const topUnits = data.correlation.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-teal-500 rounded-full" />
        Categoria por Unidade
      </h3>
      <div className="space-y-6">
        {topUnits.length === 0 && (
          <p className="text-center text-slate-400 py-6">Sem dados disponíveis</p>
        )}
        {topUnits.map((unit) => {
          const maxCatCount = Math.max(...unit.categories.map(c => c.count), 1);
          return (
            <div key={unit.unit}>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-teal-400 rounded-full" />
                {unit.unit}
              </h4>
              <div className="space-y-2 pl-3">
                {unit.categories.slice(0, 3).map(cat => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-1/3 truncate">{cat.category}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-6 text-right">{cat.count}</span>
                  </div>
                ))}
                {unit.categories.length > 3 && (
                  <p className="text-xs text-slate-400 pl-1">+{unit.categories.length - 3} categorias</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
