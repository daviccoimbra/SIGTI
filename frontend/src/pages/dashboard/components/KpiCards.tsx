import { MdAssignment, MdAdd, MdTrendingUp, MdCheckCircle } from 'react-icons/md';
import { KPIs } from '../../../services/dashboard';

interface KpiCardsProps {
  data: KPIs | null;
  isLoading: boolean;
}

const icons = {
  total: MdAssignment,
  open: MdAdd,
  progress: MdTrendingUp,
  closed: MdCheckCircle,
};

const config = [
  { key: 'totalTickets', label: 'Total de Chamados', icon: 'total', color: 'from-blue-500 to-blue-600' },
  { key: 'openToday', label: 'Abertos Hoje', icon: 'open', color: 'from-orange-500 to-orange-600' },
  { key: 'inProgress', label: 'Em Andamento', icon: 'progress', color: 'from-indigo-500 to-indigo-600' },
  { key: 'closedToday', label: 'Fechados Hoje', icon: 'closed', color: 'from-green-500 to-green-600' },
];

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {config.map(({ key, label, icon, color }) => {
        const Icon = icons[icon as keyof typeof icons];
        const value = data[key as keyof KPIs] as number;
        return (
          <div
            key={key}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
          </div>
        );
      })}
    </div>
  );
}