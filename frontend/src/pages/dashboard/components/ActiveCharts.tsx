import type { ChartData } from '../../../services/dashboard';

interface ActiveChartsProps {
  status: ChartData[];
  priority: ChartData[];
  category: ChartData[];
  department: { name: string; value: number }[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Para Fazer': '#f59e0b',
  'Em Andamento': '#3b82f6',
  'Aguardando Cliente': '#ef4444',
};

function PieChart({ data, colors }: { data: ChartData[]; colors: Record<string, string> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-gray-400 text-center py-8">Sem dados</p>;

  const segments = data.filter(s => s.value > 0);
  let cumPct = 0;
  const stops = segments.map(s => {
    const pct = (s.value / total) * 100;
    const color = colors[s.name] || '#6b7280';
    const start = cumPct;
    cumPct += pct;
    return `${color} ${start}% ${cumPct}%`;
  });
  const conic = `conic-gradient(${stops.join(', ')})`;

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="w-32 h-32 rounded-full" style={{ background: conic }} />
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[item.name] || '#6b7280' }} />
            <span className="text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }: { data: { name: string; value: number }[]; color: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-20 truncate">{item.name}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ActiveCharts({ status, priority, category, department, isLoading }: ActiveChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status (em aberto)</h3>
        <PieChart data={status} colors={STATUS_COLORS} />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prioridade (em aberto)</h3>
        <BarChart data={priority} color="#6366f1" />
      </div>

      {category.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Categoria (em aberto)</h3>
          <BarChart data={category.slice(0, 6)} color="#6366f1" />
        </div>
      )}

      {department.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Setor (em aberto)</h3>
          <BarChart data={department.slice(0, 6)} color="#10b981" />
        </div>
      )}
    </div>
  );
}
