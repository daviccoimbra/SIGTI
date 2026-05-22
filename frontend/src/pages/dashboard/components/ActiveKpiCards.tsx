import { MdAssignment, MdTrendingUp, MdWarning, MdOutlineInventory, MdAccessAlarm, MdPercent } from 'react-icons/md';
import type { ActiveKpis } from '../../../services/dashboard';

interface ActiveKpiCardsProps {
  data: ActiveKpis | null;
  isLoading: boolean;
}

const config = [
  { key: 'totalActive' as const, label: 'Total em Aberto', icon: MdAssignment, color: 'from-slate-600 to-slate-700' },
  { key: 'inProgress' as const, label: 'Em Andamento', icon: MdTrendingUp, color: 'from-indigo-500 to-indigo-600' },
  { key: 'backlog' as const, label: 'Backlog (>4 dias)', icon: MdOutlineInventory, color: 'from-amber-500 to-amber-600' },
  { key: 'criticalOpen' as const, label: 'Críticos Abertos', icon: MdWarning, color: 'from-rose-500 to-rose-600' },
  { key: 'overdueCount' as const, label: 'Chamados Atrasados', icon: MdAccessAlarm, color: 'from-orange-500 to-orange-600' },
  { key: 'overdueRate' as const, label: 'Taxa de Atraso', icon: MdPercent, color: 'from-red-500 to-red-600', suffix: '%' },
];

export function ActiveKpiCards({ data, isLoading }: ActiveKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {config.map(({ key, label, icon: Icon, color, suffix }, idx) => {
        const value = data[key] as number;
        const displayValue = suffix === '%' ? `${value}%` : value;
        const isCritical = key === 'criticalOpen' && value > 0;

        return (
          <div
            key={key}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/50 transition-all duration-500 hover:-translate-y-2"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1 uppercase tracking-wide">
                  {label}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className={`text-3xl font-bold tracking-tight ${isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                {displayValue}
              </div>

              {isCritical && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-lg w-fit">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  Requer atenção
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
