import { useQuery } from '@tanstack/react-query';
import { MdSpeed, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function OperationalEfficiencyCard({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['operational-efficiency', queryParams],
    queryFn: () => dashboardService.getOperationalEfficiency(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-10 w-24 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
    );
  }

  if (!data) return null;

  const statusConfig = {
    excellent: { icon: MdCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excelente', barColor: 'from-emerald-400 to-emerald-500' },
    good: { icon: MdCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Bom', barColor: 'from-blue-400 to-blue-500' },
    fair: { icon: MdWarning, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Regular', barColor: 'from-amber-400 to-amber-500' },
    poor: { icon: MdError, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Ruim', barColor: 'from-rose-400 to-rose-500' },
  };

  const cfg = statusConfig[data.status];

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${cfg.bg}`}>
            <MdSpeed className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Eficiência Operacional</h3>
            <p className="text-xs text-slate-500">Últimos {data.periodDays} dias</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className={`text-5xl font-bold tracking-tight ${cfg.color}`}>{data.efficiency}%</span>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${cfg.barColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(data.efficiency, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {data.resolved} resolvidos de {data.created} criados
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-full`}>
          <cfg.icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>
    </div>
  );
}
