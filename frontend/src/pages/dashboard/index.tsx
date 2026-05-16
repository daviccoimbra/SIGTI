import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard';
import { KpiCards } from './components/KpiCards';
import { DashboardCharts } from './components/DashboardCharts';
import { RecentActivity } from './components/RecentActivity';
import { PriorityAlerts } from './components/PriorityAlerts';

const Dashboard = () => {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.getKPIs().then(res => res.data),
    refetchInterval: 30000,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => dashboardService.getCharts().then(res => res.data),
  });

  const { data: evolution, isLoading: evolutionLoading } = useQuery({
    queryKey: ['dashboard-evolution'],
    queryFn: () => dashboardService.getEvolution(7).then(res => res.data),
  });

  const { data: recentTickets, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: () => dashboardService.getRecentTickets(10).then(res => res.data),
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardService.getAlerts().then(res => res.data),
  });

  const isLoading = kpisLoading || chartsLoading || evolutionLoading || recentLoading || alertsLoading;

  return (
    <div className="p-6 pl-[80px] min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Visão geral dos chamados de TI</p>
      </div>

      <KpiCards data={kpis || null} isLoading={kpisLoading} />

      <DashboardCharts
        charts={charts || null}
        evolution={evolution || null}
        isLoading={chartsLoading || evolutionLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity tickets={recentTickets || []} isLoading={recentLoading} />
        <PriorityAlerts tickets={alerts || []} isLoading={alertsLoading} />
      </div>
    </div>
  );
};

export default Dashboard;