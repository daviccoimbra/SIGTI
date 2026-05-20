import { useState, useEffect } from 'react';
import { MdAssignment, MdTrendingUp, MdCheckCircle, MdWarning, MdOutlineInventory } from 'react-icons/md';
import type { KPIs } from '../../../services/dashboard';

interface KpiCardsProps {
  data: KPIs | null;
  isLoading: boolean;
}

const config = [
  { key: 'totalTickets', label: 'Total de Chamados', icon: MdAssignment, color: 'from-slate-600 to-slate-700' },
  { key: 'totalResolved', label: 'Resolvidos', icon: MdCheckCircle, color: 'from-emerald-500 to-emerald-600' },
  { key: 'inProgress', label: 'Em Andamento', icon: MdTrendingUp, color: 'from-indigo-500 to-indigo-600' },
  { key: 'backlog', label: 'Backlog (>4 dias)', icon: MdOutlineInventory, color: 'from-amber-500 to-amber-600' },
  { key: 'criticalOpen', label: 'Críticos Abertos', icon: MdWarning, color: 'from-rose-500 to-rose-600' },
  { key: 'resolutionRate', label: 'Taxa de Resolução', icon: MdCheckCircle, color: 'from-blue-500 to-blue-600', suffix: '%' },
];

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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
        const value = data[key as keyof KPIs] as number;
        const displayValue = suffix === '%' ? `${value}%` : value;
        const isCritical = key === 'criticalOpen' && value > 0;
        
        return (
          <div
            key={key}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/50 transition-all duration-500 hover:-translate-y-2 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              animationDelay: `${idx * 80}ms`,
              transitionDelay: `${idx * 50}ms`
            }}
          >
            {/* Gradient Glow Effect */}
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            
            {/* Corner Accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-50/50 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span 
                  className="text-xs font-semibold text-slate-500 line-clamp-1 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div 
                className={`text-3xl font-bold tracking-tight ${
                  isCritical ? 'text-rose-600' : 'text-slate-800'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
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