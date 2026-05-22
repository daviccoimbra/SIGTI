import { useQuery } from '@tanstack/react-query';
import { MdAccessTime } from 'react-icons/md';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface Props {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

export function AvgFirstResponseTimeCard({ isLoading = false, queryParams = {} }: Props) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['avg-first-response-time', queryParams],
    queryFn: () => dashboardService.getAvgFirstResponseTime(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const loading = isLoading || queryLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-10 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  if (!data) return null;

  const interpretation = (minutes: number) => {
    if (minutes < 15) return { text: 'Excelente', color: 'text-emerald-600' };
    if (minutes < 60) return { text: 'Bom', color: 'text-blue-600' };
    if (minutes < 180) return { text: 'Moderado', color: 'text-amber-600' };
    return { text: 'Lento', color: 'text-rose-600' };
  };

  const info = interpretation(data.avgFirstResponseTime);

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 shadow-lg shadow-violet-200">
          <MdAccessTime className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Tempo Médio de Primeira Resposta</h3>
          <p className="text-xs text-slate-500">Últimos {data.periodDays} dias</p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-5xl font-bold text-slate-800 tracking-tight">{data.avgFirstResponseTime}</span>
        <span className="text-sm text-slate-500 mb-2">minutos</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {data.ticketsAnalyzed} chamado{data.ticketsAnalyzed !== 1 ? 's' : ''} analisado{data.ticketsAnalyzed !== 1 ? 's' : ''}
        </div>
        <div className={`text-xs font-medium ${info.color} flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 bg-current rounded-full" />
          {info.text}
        </div>
      </div>
    </div>
  );
}
