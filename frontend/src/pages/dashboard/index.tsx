import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineFire,
  HiOutlineChartPie,
  HiOutlineCube,
  HiOutlinePresentationChartLine,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { HiOutlineTrendingUp } from 'react-icons/hi';
import { MdDashboard, MdAnalytics } from 'react-icons/md';

import { dashboardService } from '../../services/dashboard';
import { useDateRange } from '../../hooks/useDateRange';
import { DateRangePicker } from '../../components/DateRangePicker';

import { ActiveOverview } from './components/ActiveOverview';
import { KpiCards } from './components/KpiCards';
import { DashboardCharts } from './components/DashboardCharts';
import { PriorityAlerts } from './components/PriorityAlerts';
import { AverageResolutionTimeCard } from './components/AverageResolutionTimeCard';
import { SLAComplianceIndicator } from './components/SLAComplianceIndicator';
import { TechnicianDistributionChart } from './components/TechnicianDistributionChart';

type TabId = 'em-aberto' | 'geral' | 'operacional' | 'analises' | 'avancado';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'em-aberto',
    label: 'Em Aberto',
    icon: <HiOutlineFire className="w-5 h-5" />,
    description: 'Indicadores dos chamados ativos'
  },
  {
    id: 'geral',
    label: 'Geral',
    icon: <HiOutlineChartPie className="w-5 h-5" />,
    description: 'Visão histórica dos indicadores'
  },
  {
    id: 'operacional',
    label: 'Operacional',
    icon: <HiOutlineCube className="w-5 h-5" />,
    description: 'Performance e eficiência (histórico)'
  },
  {
    id: 'analises',
    label: 'Análises',
    icon: <HiOutlinePresentationChartLine className="w-5 h-5" />,
    description: 'Distribuição e categorização (histórico)'
  },
  {
    id: 'avancado',
    label: 'Avançado',
    icon: <HiOutlineSparkles className="w-5 h-5" />,
    description: 'Indicadores especializados (histórico)'
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('em-aberto');
  const [isVisible, setIsVisible] = useState(false);
  const { dateRange, selectedPreset, setPreset, setCustomDates, queryParams } = useDateRange('30days');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', queryParams],
    queryFn: () => dashboardService.getKPIs(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts', queryParams],
    queryFn: () => dashboardService.getCharts(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: evolution, isLoading: evolutionLoading } = useQuery({
    queryKey: ['dashboard-evolution', queryParams],
    queryFn: () => dashboardService.getEvolution(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard-alerts', queryParams],
    queryFn: () => dashboardService.getAlerts(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  const isLoading = kpisLoading || chartsLoading || evolutionLoading || alertsLoading;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'em-aberto':
        return <ActiveOverview queryParams={queryParams} />;

      case 'geral':
        return (
          <div className="space-y-8">
            <KpiCards data={kpis || null} isLoading={kpisLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AverageResolutionTimeCard isLoading={kpisLoading} queryParams={queryParams} />
              <SLAComplianceIndicator isLoading={kpisLoading} queryParams={queryParams} />
            </div>
            <DashboardCharts
              charts={charts || null}
              evolution={evolution || null}
              isLoading={chartsLoading || evolutionLoading}
            />
          </div>
        );

      case 'operacional':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AverageResolutionTimeCard isLoading={kpisLoading} queryParams={queryParams} />
              <SLAComplianceIndicator isLoading={kpisLoading} queryParams={queryParams} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriorityAlerts tickets={alerts || []} isLoading={alertsLoading} />
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MdAnalytics className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-white/80">Tickets Críticos</span>
                  </div>
                  <div className="text-5xl font-bold mb-2">{kpis?.criticalOpen || 0}</div>
                  <p className="text-sm text-white/70">chamados de alta prioridade não resolvidos</p>
                  {kpis && kpis.criticalOpen > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 rounded-full px-3 py-1 w-fit">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Requer atenção imediata
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'analises':
        return (
          <div className="space-y-8">
            <DashboardCharts
              charts={charts || null}
              evolution={evolution || null}
              isLoading={chartsLoading || evolutionLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full" />
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                  Por Unidade
                </h3>
                {charts?.unit && charts.unit.length > 0 ? (
                  <div className="space-y-4">
                    {charts.unit.slice(0, 8).map((item) => (
                      <div key={item.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          <span className="text-xs text-slate-500">{item.value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out group-hover:from-indigo-400 group-hover:to-indigo-500"
                            style={{ width: `${(item.value / Math.max(...charts.unit.map(u => u.value))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">Sem dados disponíveis</div>
                )}
              </div>
              <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full" />
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                  Por Setor
                </h3>
                {charts?.department && charts.department.length > 0 ? (
                  <div className="space-y-4">
                    {charts.department.slice(0, 8).map((item) => (
                      <div key={item.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          <span className="text-xs text-slate-500">{item.value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out group-hover:from-emerald-400 group-hover:to-emerald-500"
                            style={{ width: `${(item.value / Math.max(...charts.department.map(d => d.value))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">Sem dados disponíveis</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'avancado':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TechnicianDistributionChart isLoading={kpisLoading} queryParams={queryParams} />
              <AverageResolutionTimeCard isLoading={kpisLoading} queryParams={queryParams} />
            </div>
            <DashboardCharts
              charts={charts || null}
              evolution={evolution || null}
              isLoading={chartsLoading || evolutionLoading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden left-[80px]">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3988] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <MdDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-slate-800 tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Dashboard Analítico
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Visão completa dos indicadores de TI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DateRangePicker
                dateRange={dateRange}
                selectedPreset={selectedPreset}
                onPresetChange={setPreset}
                onCustomDateChange={setCustomDates}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative bg-white/60 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 px-5 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#1e3988]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className={`transition-colors duration-300 ${
                  activeTab === tab.id ? 'text-[#1e3988]' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1e3988] to-[#2563eb] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Tab Description */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <HiOutlineTrendingUp className="w-4 h-4" />
          <span>{activeTabData?.description}</span>
        </div>

        {activeTab === 'em-aberto' ? (
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <ActiveOverview queryParams={queryParams} />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-slate-200 rounded-full" />
                <div className="absolute inset-0 border-3 border-transparent border-t-slate-800 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-500 animate-pulse">Carregando indicadores...</p>
            </div>
          </div>
        ) : (
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {renderTabContent()}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative border-t border-slate-200/50 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="text-slate-600">Dashboard de Gestão de Chamados</span>
            <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
            <span className="text-slate-400">Atualizado em tempo real</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-600">Sistema online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
