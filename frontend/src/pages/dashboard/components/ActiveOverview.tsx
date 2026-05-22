import { useQuery } from '@tanstack/react-query';
import { dashboardService, type QueryParams } from '../../../services/dashboard';
import { ActiveKpiCards } from './ActiveKpiCards';
import { ActiveCharts } from './ActiveCharts';
import { PriorityAlerts } from './PriorityAlerts';
import { ActiveTicketAgeCard } from './ActiveTicketAgeCard';

interface ActiveOverviewProps {
  queryParams: QueryParams;
}

export function ActiveOverview({ queryParams }: ActiveOverviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-active-summary', queryParams],
    queryFn: () => dashboardService.getActiveSummary(queryParams).then(res => res.data),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-8">
      <ActiveKpiCards data={data?.kpis || null} isLoading={isLoading} />

      <ActiveCharts
        status={data?.status || []}
        priority={data?.priority || []}
        category={data?.category || []}
        department={data?.department || []}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityAlerts tickets={data?.alerts || []} isLoading={isLoading} />
        <ActiveTicketAgeCard queryParams={queryParams} />
      </div>
    </div>
  );
}
