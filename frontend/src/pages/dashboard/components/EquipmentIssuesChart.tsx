import { useQuery } from '@tanstack/react-query';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function EquipmentIssuesChart({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['equipment-issues', queryParams],
    queryFn: () => dashboardService.getEquipmentIssues(queryParams).then(res => res.data),
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

  const maxCount = Math.max(...data.topEquipment.map(e => e.count), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-rose-500 rounded-full" />
        Equipamentos com Mais Chamados
      </h3>
      <div className="space-y-4">
        {data.topEquipment.length === 0 && (
          <p className="text-center text-slate-400 py-6">Sem dados disponíveis</p>
        )}
        {data.topEquipment.slice(0, 8).map((item, idx) => (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}º</span>
                <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
              </div>
              <span className="text-xs text-slate-500 ml-2">{item.count} chamados</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
