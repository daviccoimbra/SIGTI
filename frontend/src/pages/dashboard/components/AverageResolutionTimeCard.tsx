import { useQuery } from '@tanstack/react-query';
import { MdAccessTime, MdTrendingUp } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface AverageResolutionTimeCardProps {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function AverageResolutionTimeCard({ isLoading = false, queryParams = {} }: AverageResolutionTimeCardProps) {
  const { data, isLoading: queryIsLoading, error } = useQuery({
    queryKey: ['avg-resolution-time', queryParams],
    queryFn: () => dashboardService.getAvgResolutionTime(queryParams).then(res => res.data),
    refetchInterval: 30000,
  });

  const loading = isLoading || queryIsLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-end gap-3 mb-2">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-4 w-16 mb-3" />
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

  const getTimeInterpretation = (minutes: number) => {
    if (minutes < 60) return { text: 'Excelente', color: 'text-emerald-600' };
    if (minutes < 240) return { text: 'Bom', color: 'text-blue-600' };
    if (minutes < 480) return { text: 'Moderado', color: 'text-amber-600' };
    return { text: 'Precisa melhorar', color: 'text-rose-600' };
  };

  const interpretation = getTimeInterpretation(data.avgResolutionTime);

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200">
            <MdAccessTime className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Tempo Médio de Resolução</h3>
            <p className="text-xs text-slate-500">{periodLabel}</p>
          </div>
        </div>
        <MdTrendingUp className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-5xl font-bold text-slate-800 tracking-tight">{data.avgResolutionTime}</span>
        <span className="text-sm text-slate-500 mb-2">minutos</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {data.ticketsAnalyzed} chamado{data.ticketsAnalyzed !== 1 ? 's' : ''} analisado{data.ticketsAnalyzed !== 1 ? 's' : ''}
        </div>
        <div className={`text-xs font-medium ${interpretation.color} flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 bg-current rounded-full" />
          {interpretation.text}
        </div>
      </div>
    </div>
  );
}