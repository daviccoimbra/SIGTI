import api from './api';

export type QueryParams = Record<string, string>;

export interface KPIs {
  totalTickets: number;
  totalResolved: number;
  totalCreated: number;
  totalClosed: number;
  inProgress: number;
  backlog: number;
  criticalOpen: number;
  resolutionRate: number;
  totalCategories: number;
  totalEquipments: number;
  totalRequesters: number;
  avgResponseTime: number | null;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface ChartResponse {
  status: ChartData[];
  priority: ChartData[];
  category: ChartData[];
  department: { name: string; value: number }[];
  unit: { name: string; value: number }[];
}

export interface TicketData {
  id: string;
  protocolo: string;
  titulo: string;
  solicitante: string;
  departamento: string;
  prioridade: string;
  status: string;
  createdAt: string;
  category?: { descricao: string };
  requester?: { nome: string; unidade?: string };
  equipment?: { id: string; nome: string };
}

export interface EvolutionData {
  date: string;
  created: number;
  closed: number;
}

export interface AvgResolutionTimeData {
  avgResolutionTime: number;
  periodDays: number;
  ticketsAnalyzed: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface AvgFirstResponseTimeData {
  avgFirstResponseTime: number;
  ticketsAnalyzed: number;
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface TechnicianDistributionData {
  name: string;
  count: number;
  percentage: number;
}

export interface SLAComplianceData {
  slaCompliance: number;
  withinSla: number;
  totalAnalyzed: number;
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface OverdueTicketsData {
  overdueCount: number;
  totalActive: number;
  overduePercentage: number;
  overdueByPriority: Record<string, number>;
  periodDays: number;
}

export interface CreationVsResolutionData {
  created: number;
  resolved: number;
  rate: number;
  status: 'improving' | 'stable' | 'declining';
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface TicketAgeData {
  avgAgeHours: number;
  avgAgeDays: number;
  activeTickets: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface CategoryTimeData {
  category: string;
  avgTimeMinutes: number;
  count: number;
}

export interface ResolutionTimeByCategoryData {
  categories: CategoryTimeData[];
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface EquipmentIssueData {
  name: string;
  count: number;
}

export interface EquipmentIssuesData {
  topEquipment: EquipmentIssueData[];
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface CategoryByUnitData {
  unit: string;
  categories: { category: string; count: number }[];
}

export interface CategoryByUnitResponseData {
  correlation: CategoryByUnitData[];
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface CategoryTrendData {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoryTrendResponseData {
  trends: CategoryTrendData[];
  totalTickets: number;
  periodDays: number;
}

export interface OperationalEfficiencyData {
  efficiency: number;
  created: number;
  resolved: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface TimeByStatusData {
  status: string;
  avgHours: number;
  count: number;
}

export interface AvgTimeByStatusData {
  byStatus: TimeByStatusData[];
  periodDays: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface ActiveKpis {
  totalActive: number;
  inProgress: number;
  backlog: number;
  criticalOpen: number;
  overdueCount: number;
  overdueRate: number;
}

export interface ActiveSummaryData {
  kpis: ActiveKpis;
  status: ChartData[];
  priority: ChartData[];
  category: ChartData[];
  department: { name: string; value: number }[];
  alerts: TicketData[];
}

const buildQueryString = (params: QueryParams): string => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
};

export const dashboardService = {
  getKPIs: (params: QueryParams = {}) => 
    api.get<KPIs>(`/dashboard/kpis${buildQueryString(params)}`),
  
  getCharts: (params: QueryParams = {}) => 
    api.get<ChartResponse>(`/dashboard/charts${buildQueryString(params)}`),
  
  getRecentTickets: (limit = 10, params: QueryParams = {}) => 
    api.get<TicketData[]>(`/dashboard/recent?limit=${limit}&${new URLSearchParams(params).toString()}`),
  
  getAlerts: (params: QueryParams = {}) => 
    api.get<TicketData[]>(`/dashboard/alerts${buildQueryString(params)}`),
  
  getEvolution: (params: QueryParams = {}) => 
    api.get<EvolutionData[]>(`/dashboard/evolution${buildQueryString(params)}`),
  
  getAvgResolutionTime: (params: QueryParams = {}) => 
    api.get<AvgResolutionTimeData>(`/dashboard/avg-resolution-time${buildQueryString(params)}`),
  
  getAvgFirstResponseTime: (params: QueryParams = {}) => 
    api.get<AvgFirstResponseTimeData>(`/dashboard/avg-first-response-time${buildQueryString(params)}`),
  
  getTechnicianDistribution: (params: QueryParams = {}) => 
    api.get<TechnicianDistributionData[]>(`/dashboard/technician-distribution${buildQueryString(params)}`),
  
  getSLACompliance: (params: QueryParams = {}) => 
    api.get<SLAComplianceData>(`/dashboard/sla-compliance${buildQueryString(params)}`),
  
  getOverdueTickets: (params: QueryParams = {}) => 
    api.get<OverdueTicketsData>(`/dashboard/overdue-tickets${buildQueryString(params)}`),
  
  getCreationVsResolution: (params: QueryParams = {}) => 
    api.get<CreationVsResolutionData>(`/dashboard/creation-vs-resolution${buildQueryString(params)}`),
  
  getTicketAge: (params: QueryParams = {}) => 
    api.get<TicketAgeData>(`/dashboard/ticket-age${buildQueryString(params)}`),
  
  getResolutionTimeByCategory: (params: QueryParams = {}) => 
    api.get<ResolutionTimeByCategoryData>(`/dashboard/resolution-time-by-category${buildQueryString(params)}`),
  
  getEquipmentIssues: (params: QueryParams = {}) => 
    api.get<EquipmentIssuesData>(`/dashboard/equipment-issues${buildQueryString(params)}`),
  
  getCategoryByUnit: (params: QueryParams = {}) => 
    api.get<CategoryByUnitResponseData>(`/dashboard/category-by-unit${buildQueryString(params)}`),
  
  getCategoryTrend: (params: QueryParams = {}) => 
    api.get<CategoryTrendResponseData>(`/dashboard/category-trend${buildQueryString(params)}`),
  
  getOperationalEfficiency: (params: QueryParams = {}) => 
    api.get<OperationalEfficiencyData>(`/dashboard/operational-efficiency${buildQueryString(params)}`),
  
  getAvgTimeByStatus: (params: QueryParams = {}) => 
    api.get<AvgTimeByStatusData>(`/dashboard/avg-time-by-status${buildQueryString(params)}`),

  getActiveSummary: (params: QueryParams = {}) =>
    api.get<ActiveSummaryData>(`/dashboard/active-summary${buildQueryString(params)}`),
};