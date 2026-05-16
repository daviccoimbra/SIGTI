import api from './api';

export interface KPIs {
  totalTickets: number;
  openToday: number;
  inProgress: number;
  closedToday: number;
  totalCategories: number;
  totalEquipments: number;
  totalRequesters: number;
  avgResponseTime: number | null;
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
  requester?: { nome: string };
}

export interface EvolutionData {
  date: string;
  created: number;
  closed: number;
}

export const dashboardService = {
  getKPIs: () => api.get<KPIs>('/dashboard/kpis'),
  getCharts: () => api.get<ChartResponse>('/dashboard/charts'),
  getRecentTickets: (limit = 10) => api.get<TicketData[]>(`/dashboard/recent?limit=${limit}`),
  getAlerts: () => api.get<TicketData[]>('/dashboard/alerts'),
  getEvolution: (days = 7) => api.get<EvolutionData[]>(`/dashboard/evolution?days=${days}`),
};