import { useQuery } from '@tanstack/react-query';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { Skeleton } from '../../../components/Skeleton';
import { dashboardService, type QueryParams } from '../../../services/dashboard';

interface TechnicianDistributionChartProps {
  isLoading?: boolean;
  queryParams?: QueryParams;
}

const COLORS = [
  'from-indigo-500 to-indigo-600',
  'from-blue-500 to-blue-600',
  'from-cyan-500 to-cyan-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
];

export function TechnicianDistributionChart({ isLoading = false, queryParams = {} }: TechnicianDistributionChartProps) {
  const { data, isLoading: queryIsLoading, error } = useQuery({
    queryKey: ['technician-distribution', queryParams],
    queryFn: () => dashboardService.getTechnicianDistribution(queryParams).then(res => res.data),
    refetchInterval: 30000,
  });

  const loading = isLoading || queryIsLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600">
            <HiOutlineUserGroup className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Distribuição por Solicitante</h3>
        </div>
        <div className="text-slate-400 text-center py-8">Nenhum dado disponível</div>
      </div>
    );
  }

  const topTechnicians = data.slice(0, 6);
  const maxCount = Math.max(...topTechnicians.map(d => d.count), 1);

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 shadow-lg shadow-violet-200">
          <HiOutlineUserGroup className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Distribuição por Solicitante</h3>
          <p className="text-xs text-slate-500">Top 6 por volume</p>
        </div>
      </div>

      <div className="space-y-4">
        {topTechnicians.map((tech, idx) => {
          const colorIdx = idx % COLORS.length;
          const percentage = (tech.count / maxCount) * 100;
          
          return (
            <div key={idx} className="group/item">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">{tech.technician}</span>
                <span className="text-xs text-slate-500">{tech.count} ({tech.percentage}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${COLORS[colorIdx]} rounded-full transition-all duration-700 ease-out group-hover/item:shadow-md`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 6 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
          + mais {data.length - 6} solicitante{data.length - 6 !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}