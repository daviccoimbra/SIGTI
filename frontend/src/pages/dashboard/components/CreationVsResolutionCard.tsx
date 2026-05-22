import { useQuery } from '@tanstack/react-query';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function CreationVsResolutionCard({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['creation-vs-resolution', queryParams],
    queryFn: () => dashboardService.getCreationVsResolution(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-10 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  if (!data) return null;

  const statusConfig = {
    improving: { icon: MdTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Melhorando' },
    stable: { icon: MdTrendingFlat, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Estável' },
    declining: { icon: MdTrendingDown, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Declinando' },
  };

  const cfg = statusConfig[data.status];

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${cfg.bg}`}>
            <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Criação vs Resolução</h3>
            <p className="text-xs text-slate-500">Últimos {data.periodDays} dias</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-6 mb-4">
        <div>
          <span className="text-sm text-slate-500">Criados</span>
          <div className="text-3xl font-bold text-slate-800">{data.created}</div>
        </div>
        <div className="text-slate-300 text-2xl font-light">×</div>
        <div>
          <span className="text-sm text-slate-500">Resolvidos</span>
          <div className="text-3xl font-bold text-slate-800">{data.resolved}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className={`text-lg font-bold ${cfg.color}`}>
          {data.rate}%
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-full`}>
          <cfg.icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>
    </div>
  );
}
