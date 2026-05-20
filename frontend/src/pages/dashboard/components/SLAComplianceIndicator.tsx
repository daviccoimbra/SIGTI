import { useQuery } from '@tanstack/react-query';
import { MdVerifiedUser, MdWarning } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface SLAComplianceIndicatorProps {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function SLAComplianceIndicator({ isLoading = false, queryParams = {} }: SLAComplianceIndicatorProps) {
  const { data, isLoading: queryIsLoading, error } = useQuery({
    queryKey: ['sla-compliance', queryParams],
    queryFn: () => dashboardService.getSLACompliance(queryParams).then(res => res.data),
    refetchInterval: 30000,
  });

  const loading = isLoading || queryIsLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-end gap-3 mb-2">
          <Skeleton className="h-12 w-24" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="text-red-500 text-center py-6">Erro ao carregar dados</div>
      </div>
    );
  }

  if (!data) return null;

  const periodLabel = data.periodStart 
    ? `${new Date(data.periodStart).toLocaleDateString('pt-BR')} - ${new Date(data.periodEnd || '').toLocaleDateString('pt-BR')}`
    : `Últimos ${data.periodDays} dias`;

  const getComplianceInfo = (percentage: number) => {
    if (percentage >= 90) return { 
      label: 'Excelente', 
      color: 'from-emerald-500 to-emerald-600', 
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      barColor: 'from-emerald-400 to-emerald-500'
    };
    if (percentage >= 70) return { 
      label: 'Bom', 
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      barColor: 'from-blue-400 to-blue-500'
    };
    if (percentage >= 50) return { 
      label: 'Atenção', 
      color: 'from-amber-500 to-amber-600', 
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      barColor: 'from-amber-400 to-amber-500'
    };
    return { 
      label: 'Crítico', 
      color: 'from-rose-500 to-rose-600', 
      bgColor: 'bg-rose-500',
      textColor: 'text-rose-600',
      barColor: 'from-rose-400 to-rose-500'
    };
  };

  const info = getComplianceInfo(data.slaCompliance);

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${info.color} shadow-lg shadow-slate-200`}>
            {data.slaCompliance >= 50 ? (
              <MdVerifiedUser className="w-5 h-5 text-white" />
            ) : (
              <MdWarning className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Cumprimento de SLA</h3>
            <p className="text-xs text-slate-500">{periodLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className={`text-5xl font-bold tracking-tight ${info.textColor}`}>{data.slaCompliance}%</span>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${info.barColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${data.slaCompliance}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {data.withinSla} de {data.totalAnalyzed} dentro do prazo
        </div>
        <div className={`text-xs font-medium ${info.textColor} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 ${info.bgColor} rounded-full`} />
          {info.label}
        </div>
      </div>
    </div>
  );
}