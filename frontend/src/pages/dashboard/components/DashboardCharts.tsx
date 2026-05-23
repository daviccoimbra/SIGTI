import type { ChartResponse, EvolutionData } from '../../../services/dashboard';

interface DashboardChartsProps {
  charts: ChartResponse | null;
  evolution: EvolutionData[] | null;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Para Fazer': '#f59e0b',
  'Em Andamento': '#3b82f6',
  'Aguardando Cliente': '#ef4444',
  'Finalizados': '#22c55e',
};

function SimplePieChart({ data, colors }: { data: { name: string; value: number }[]; colors: Record<string, string> }) {
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
      <div className="relative w-32 h-32 rounded-full" style={{ background: conic }}>
      </div>
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

function SimpleBarChart({ data, color }: { data: { name: string; value: number }[]; color: string }) {
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

export function DashboardCharts({ charts, evolution, isLoading }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!charts) return null;

  const maxEvolution = Math.max(
    ...(evolution || []).map(d => Math.max(d.created, d.closed)),
    1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados por Status</h3>
        <SimplePieChart data={charts.status} colors={STATUS_COLORS} />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados por Prioridade</h3>
        <SimpleBarChart data={charts.priority} color="#6366f1" />
      </div>

      {charts.category.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados por Categoria</h3>
          <SimpleBarChart data={charts.category.slice(0, 6)} color="#6366f1" />
        </div>
      )}

      {charts.department.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados por Setor</h3>
          <SimpleBarChart data={charts.department.slice(0, 6)} color="#10b981" />
        </div>
      )}

      {evolution && evolution.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução (Últimos 7 dias)</h3>
          <div className="space-y-4">
            {evolution.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-10">{day.date}</span>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 h-6 bg-blue-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded transition-all duration-300"
                      style={{ width: `${(day.created / maxEvolution) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-600 w-6">{day.created}</span>
                </div>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 h-6 bg-green-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded transition-all duration-300"
                      style={{ width: `${(day.closed / maxEvolution) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-green-600 w-6">{day.closed}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" /> Abertos
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" /> Fechados
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}