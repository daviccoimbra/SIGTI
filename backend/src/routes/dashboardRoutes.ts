import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const getStartOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Helper para obter datas do query params
const getDateRange = (query: Record<string, any>) => {
  const startDate = query.startDate ? new Date(query.startDate) : null;
  const endDate = query.endDate ? new Date(query.endDate) : null;
  
  return { startDate, endDate };
};

// Helper para construir where clause com filtro de data
const buildDateFilter = (startDate: Date | null, endDate: Date | null, dateField: 'createdAt' | 'updatedAt' = 'createdAt') => {
  if (startDate && endDate) {
    return {
      [dateField]: {
        gte: getStartOfDay(startDate),
        lte: getEndOfDay(endDate)
      }
    };
  }
  if (startDate) {
    return {
      [dateField]: {
        gte: getStartOfDay(startDate)
      }
    };
  }
  if (endDate) {
    return {
      [dateField]: {
        lte: getEndOfDay(endDate)
      }
    };
  }
  return {};
};

// Status que representam "resolvido/fechado"
const RESOLVED_STATUSES = ['todo', 'resolved', 'closed', 'fechado', 'concluido', 'done'];

router.get('/kpis', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const dateFilter = buildDateFilter(startDate, endDate, 'createdAt');
    const dateFilterUpdated = buildDateFilter(startDate, endDate, 'updatedAt');
    
    const now = new Date();
    const startOfToday = getStartOfDay(now);
    const endOfToday = getEndOfDay(now);

    // Se há filtro de período, usa ele; caso contrário usa "todos os tempos"
    const hasDateFilter = startDate || endDate;

    // Contagens com suporte a filtro de período
    const [
      totalTickets,
      totalResolved,
      totalCreated,
      totalClosed,
      inProgress,
      backlog,
      criticalOpen,
      totalCategories,
      totalEquipments,
      totalRequesters
    ] = await Promise.all([
      // Total de tickets (ativos)
      prisma.ticket.count({ 
        where: { isArchived: false, ...(hasDateFilter ? dateFilter : {}) } 
      }),
      // Total resolvidos no período
      prisma.ticket.count({
        where: { isArchived: false, status: { in: RESOLVED_STATUSES } }
      }),
      // Total criado no período
      prisma.ticket.count({
        where: { isArchived: false, ...(hasDateFilter ? dateFilter : {}) }
      }),
      // Total fechado no período
      prisma.ticket.count({
        where: { isArchived: false, status: { in: RESOLVED_STATUSES }, ...(hasDateFilter ? dateFilterUpdated : {}) }
      }),
      // Em andamento (não resolvido)
      prisma.ticket.count({
        where: { isArchived: false, status: { notIn: RESOLVED_STATUSES } }
      }),
      // Backlog (mais de 4 dias)
      prisma.ticket.count({
        where: {
          isArchived: false,
          status: 'backlog',
          createdAt: { lt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
        }
      }),
      // Críticos abertos
      prisma.ticket.count({
        where: {
          isArchived: false,
          prioridade: { in: ['Alta', 'Crítica', 'alta', 'critica'] },
          status: { notIn: RESOLVED_STATUSES }
        }
      }),
      prisma.category.count(),
      prisma.equipment.count(),
      prisma.requester.count()
    ]);

    // Calcular taxa de resolução
    const resolutionRate = totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 0;

    // Calcular tempo médio de resposta
    const ticketsWithHistory = await prisma.ticket.findMany({
      where: { isArchived: false },
      include: {
        history: {
          orderBy: { date: 'asc' },
          take: 1
        }
      }
    });

    let totalResponseTime = 0;
    let countWithResponse = 0;

    ticketsWithHistory.forEach(ticket => {
      const firstHistory = ticket.history[0];
      if (firstHistory && firstHistory.from !== 'backlog') {
        const responseTime = Math.abs(firstHistory.date.getTime() - ticket.createdAt.getTime());
        totalResponseTime += responseTime;
        countWithResponse++;
      }
    });

    const avgResponseTime = countWithResponse > 0 ? totalResponseTime / countWithResponse : null;

    res.json({
      totalTickets,
      totalResolved,
      totalCreated,
      totalClosed,
      inProgress,
      backlog,
      criticalOpen,
      resolutionRate,
      totalCategories,
      totalEquipments,
      totalRequesters,
      avgResponseTime: avgResponseTime ? Math.round(avgResponseTime / 1000 / 60) : null,
      periodStart: startDate?.toISOString() || null,
      periodEnd: endDate?.toISOString() || null
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;

    // Busca tickets (incluindo arquivados para análises completas)
    const tickets = await prisma.ticket.findMany({
      where: { isArchived: false, ...(hasDateFilter ? dateFilter : {}) },
      include: {
        category: true,
        requester: true,
        equipment: true
      }
    });

    const statusCount: Record<string, number> = {
      backlog: 0,
      pending: 0,
      todo: 0,
    };

    const priorityCount: Record<string, number> = {
      'Alta': 0,
      'Crítica': 0,
      'Média': 0,
      'Media': 0,
      'Baixa': 0
    };

    const categoryCount: Record<string, number> = {};
    const departmentCount: Record<string, number> = {};
    const unitCount: Record<string, number> = {};

    tickets.forEach(ticket => {
      const status = ticket.status || 'backlog';
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      } else {
        statusCount['backlog'] = (statusCount['backlog'] || 0) + 1;
      }

      const priority = ticket.prioridade || 'Média';
      if (priorityCount[priority] !== undefined) {
        priorityCount[priority]++;
      } else {
        priorityCount['Média']++;
      }

      if (ticket.category?.descricao) {
        categoryCount[ticket.category.descricao] = (categoryCount[ticket.category.descricao] || 0) + 1;
      }

      if (ticket.departamento) {
        departmentCount[ticket.departamento] = (departmentCount[ticket.departamento] || 0) + 1;
      }

      // Contagem por unidade (do requester)
      if (ticket.requester?.unidade) {
        unitCount[ticket.requester.unidade] = (unitCount[ticket.requester.unidade] || 0) + 1;
      }
    });

    const statusData = [
      { name: 'Para Fazer', value: statusCount.backlog, color: '#6b7280' },
      { name: 'Em Andamento', value: statusCount.pending, color: '#3b82f6' },
      { name: 'Aguardando Cliente', value: statusCount.todo, color: '#8b5cf6' },
    ];

    const priorityData = [
      { name: 'Alta/Crítica', value: (priorityCount['Alta'] || 0) + (priorityCount['Crítica'] || 0), color: '#ef4444' },
      { name: 'Média', value: (priorityCount['Média'] || 0) + (priorityCount['Media'] || 0), color: '#f59e0b' },
      { name: 'Baixa', value: priorityCount['Baixa'] || 0, color: '#22c55e' }
    ];

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    }));

    const departmentData = Object.entries(departmentCount).map(([name, value]) => ({
      name,
      value
    }));

    const unitData = Object.entries(unitCount).map(([name, value]) => ({
      name,
      value
    }));

    res.json({
      status: statusData,
      priority: priorityData,
      category: categoryData,
      department: departmentData,
      unit: unitData
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const tickets = await prisma.ticket.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        requester: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching recent tickets:', error);
    res.status(500).json({ error: 'Failed to fetch recent tickets' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const highPriorityTickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        prioridade: { in: ['alta', 'alta_critica', 'Alta', 'Crítica'] },
        status: { notIn: ['todo'] }
      },
      include: {
        category: true,
        requester: true
      },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    res.json(highPriorityTickets);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/evolution', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;
    
    // Se há filtro específico, usa-o; caso contrário usa o período
    const hasDateFilter = startDate && endDate;
    
    if (!hasDateFilter) {
      effectiveStartDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    const dailyData: Record<string, { created: number; closed: number }> = {};
    
    // Gerar todas as datas no período
    const currentDate = new Date(effectiveStartDate);
    while (currentDate <= effectiveEndDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyData[dateKey] = { created: 0, closed: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    tickets.forEach(ticket => {
      const dateKey = ticket.createdAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].created++;
      }
    });

    const historyEntries = await prisma.history.findMany({
      where: {
        to: { in: RESOLVED_STATUSES },
        date: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      select: { date: true }
    });

    historyEntries.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].closed++;
      }
    });

    const evolutionData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        created: data.created,
        closed: data.closed
      }));

    res.json(evolutionData);
  } catch (error) {
    console.error('Error fetching evolution data:', error);
    res.status(500).json({ error: 'Failed to fetch evolution data' });
  }
});

// Novo endpoint: Tempo médio de resolução
router.get('/avg-resolution-time', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;
    const hasDateFilter = startDate && endDate;

    // Buscar tickets resolvidos no período
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        status: { in: RESOLVED_STATUSES },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        history: {
          orderBy: { date: 'asc' }
        }
      }
    });

    let totalResolutionTime = 0;
    let countResolved = 0;

    resolvedTickets.forEach(ticket => {
      const closedHistory = ticket.history
        .filter(h => RESOLVED_STATUSES.includes(h.to))
        .pop();

      if (closedHistory) {
        const resolutionTime = Math.abs(closedHistory.date.getTime() - ticket.createdAt.getTime());
        totalResolutionTime += resolutionTime;
        countResolved++;
      }
    });

    const avgResolutionTime = countResolved > 0 ? totalResolutionTime / countResolved : 0;

    res.json({
      avgResolutionTime: Math.round(avgResolutionTime / 1000 / 60),
      periodDays: days,
      ticketsAnalyzed: countResolved,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching avg resolution time:', error);
    res.status(500).json({ error: 'Failed to fetch average resolution time' });
  }
});

// Novo endpoint: Distribuição por técnico
router.get('/technician-distribution', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;

    const tickets = await prisma.ticket.findMany({
      where: { isArchived: false, ...(hasDateFilter ? dateFilter : {}) },
      include: {
        requester: true
      }
    });

    const distribution: Record<string, number> = {};

    tickets.forEach(ticket => {
      const technician = ticket.requester?.nome || 'Não atribuído';
      distribution[technician] = (distribution[technician] || 0) + 1;
    });

    const distributionArray = Object.entries(distribution)
      .map(([technician, count]) => ({
        technician,
        count,
        percentage: Math.round((count / tickets.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    res.json(distributionArray);
  } catch (error) {
    console.error('Error fetching technician distribution:', error);
    res.status(500).json({ error: 'Failed to fetch technician distribution' });
  }
});

// Novo endpoint: Cumprimento de SLA
router.get('/sla-compliance', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    // Buscar tickets resolvidos no período
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        status: { in: RESOLVED_STATUSES },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        history: {
          orderBy: { date: 'asc' }
        }
      }
    });

    let withinSla = 0;
    let totalAnalyzed = 0;

    resolvedTickets.forEach(ticket => {
      const closedHistory = ticket.history
        .filter(h => RESOLVED_STATUSES.includes(h.to))
        .pop();

      if (closedHistory) {
        totalAnalyzed++;
        const resolutionTimeMs = Math.abs(closedHistory.date.getTime() - ticket.createdAt.getTime());
        const resolutionTimeHours = resolutionTimeMs / (1000 * 60 * 60);

        let slaHours = 0;
        switch (ticket.prioridade?.toLowerCase()) {
          case 'alta':
          case 'crítica':
            slaHours = 4;
            break;
          case 'média':
          case 'media':
            slaHours = 8;
            break;
          case 'baixa':
            slaHours = 24;
            break;
          default:
            slaHours = 8;
        }

        if (resolutionTimeHours <= slaHours) {
          withinSla++;
        }
      }
    });

    const compliancePercentage = totalAnalyzed > 0 ? Math.round((withinSla / totalAnalyzed) * 100) : 0;

    res.json({
      slaCompliance: compliancePercentage,
      withinSla,
      totalAnalyzed,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching SLA compliance:', error);
    res.status(500).json({ error: 'Failed to fetch SLA compliance' });
  }
});

// Novo endpoint: Tempo médio de primeira resposta
router.get('/avg-first-response-time', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        history: {
          orderBy: { date: 'asc' },
          take: 1
        }
      }
    });

    let totalResponseTime = 0;
    let countWithResponse = 0;

    tickets.forEach(ticket => {
      const firstHistory = ticket.history[0];
      if (firstHistory && firstHistory.from !== 'backlog') {
        const responseTime = Math.abs(firstHistory.date.getTime() - ticket.createdAt.getTime());
        totalResponseTime += responseTime;
        countWithResponse++;
      }
    });

    const avgFirstResponseTime = countWithResponse > 0 ? totalResponseTime / countWithResponse : 0;

    res.json({
      avgFirstResponseTime: Math.round(avgFirstResponseTime / 1000 / 60),
      ticketsAnalyzed: countWithResponse,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching avg first response time:', error);
    res.status(500).json({ error: 'Failed to fetch average first response time' });
  }
});

// Novo endpoint: Tickets atrasados (baseado em SLA)
router.get('/overdue-tickets', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        status: { notIn: RESOLVED_STATUSES },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      select: {
        id: true,
        prioridade: true,
        createdAt: true,
        status: true
      }
    });

    let overdueCount = 0;
    const overdueByPriority: Record<string, number> = {
      'Alta/Crítica': 0,
      'Média': 0,
      'Baixa': 0
    };

    tickets.forEach(ticket => {
      const ageInHours = (now.getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
      
      let slaHours = 8;
      const priority = ticket.prioridade?.toLowerCase();
      if (priority === 'alta' || priority === 'crítica') {
        slaHours = 4;
      } else if (priority === 'baixa') {
        slaHours = 24;
      }

      if (ageInHours > slaHours) {
        overdueCount++;
        if (priority === 'alta' || priority === 'crítica') {
          overdueByPriority['Alta/Crítica']++;
        } else if (priority === 'média' || priority === 'media') {
          overdueByPriority['Média']++;
        } else {
          overdueByPriority['Baixa']++;
        }
      }
    });

    res.json({
      overdueCount,
      totalActive: tickets.length,
      overduePercentage: tickets.length > 0 ? Math.round((overdueCount / tickets.length) * 100) : 0,
      overdueByPriority,
      periodDays: days
    });
  } catch (error) {
    console.error('Error fetching overdue tickets:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tickets' });
  }
});

// Novo endpoint: Taxa de criação vs resolução
router.get('/creation-vs-resolution', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const [created, resolved] = await Promise.all([
      prisma.ticket.count({
        where: {
          isArchived: false,
          createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      }),
      prisma.history.count({
        where: {
          to: { in: RESOLVED_STATUSES },
          date: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      })
    ]);

    const rate = created > 0 ? Math.round((resolved / created) * 100) : 0;
    const status = rate >= 100 ? 'improving' : rate >= 80 ? 'stable' : 'declining';

    res.json({
      created,
      resolved,
      rate,
      status,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching creation vs resolution:', error);
    res.status(500).json({ error: 'Failed to fetch creation vs resolution data' });
  }
});

// Novo endpoint: Idade média dos tickets ativos
router.get('/ticket-age', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    
    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        status: { notIn: RESOLVED_STATUSES },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      select: {
        createdAt: true
      }
    });

    let totalAge = 0;
    tickets.forEach(ticket => {
      totalAge += (now.getTime() - new Date(ticket.createdAt).getTime());
    });

    const avgAgeHours = tickets.length > 0 ? totalAge / tickets.length / (1000 * 60 * 60) : 0;

    res.json({
      avgAgeHours: Math.round(avgAgeHours),
      avgAgeDays: Math.round(avgAgeHours / 24),
      activeTickets: tickets.length,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching ticket age:', error);
    res.status(500).json({ error: 'Failed to fetch ticket age' });
  }
});

// Novo endpoint: Tempo médio por categoria
router.get('/resolution-time-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        status: { in: RESOLVED_STATUSES },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        category: true,
        history: {
          orderBy: { date: 'asc' }
        }
      }
    });

    const categoryTimes: Record<string, { total: number; count: number }> = {};

    tickets.forEach(ticket => {
      const categoryName = ticket.category?.descricao || 'Sem categoria';
      const closedHistory = ticket.history.filter(h => RESOLVED_STATUSES.includes(h.to)).pop();
      
      if (closedHistory) {
        const resolutionTime = Math.abs(closedHistory.date.getTime() - ticket.createdAt.getTime());
        
        if (!categoryTimes[categoryName]) {
          categoryTimes[categoryName] = { total: 0, count: 0 };
        }
        categoryTimes[categoryName].total += resolutionTime;
        categoryTimes[categoryName].count++;
      }
    });

    const result = Object.entries(categoryTimes)
      .map(([category, data]) => ({
        category,
        avgTimeMinutes: Math.round(data.total / data.count / 1000 / 60),
        count: data.count
      }))
      .sort((a, b) => b.avgTimeMinutes - a.avgTimeMinutes);

    res.json({
      categories: result,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching resolution time by category:', error);
    res.status(500).json({ error: 'Failed to fetch resolution time by category' });
  }
});

// Novo endpoint: Equipamentos mais problemáticos
router.get('/equipment-issues', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        equipmentId: { not: null },
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        equipment: true
      }
    });

    const equipmentCount: Record<string, { name: string; count: number }> = {};

    tickets.forEach(ticket => {
      if (ticket.equipment) {
        const key = ticket.equipment.id;
        if (!equipmentCount[key]) {
          equipmentCount[key] = { name: ticket.equipment.nome, count: 0 };
        }
        equipmentCount[key].count++;
      }
    });

    const result = Object.values(equipmentCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      topEquipment: result,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching equipment issues:', error);
    res.status(500).json({ error: 'Failed to fetch equipment issues' });
  }
});

// Novo endpoint: Correlação categoria × unidade
router.get('/category-by-unit', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        category: true,
        requester: true
      }
    });

    const correlation: Record<string, Record<string, number>> = {};

    tickets.forEach(ticket => {
      const unit = ticket.requester?.unidade || 'Não especificada';
      const category = ticket.category?.descricao || 'Sem categoria';
      
      if (!correlation[unit]) {
        correlation[unit] = {};
      }
      if (!correlation[unit][category]) {
        correlation[unit][category] = 0;
      }
      correlation[unit][category]++;
    });

    const result = Object.entries(correlation).map(([unit, categories]) => ({
      unit,
      categories: Object.entries(categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
    }));

    res.json({
      correlation: result,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching category by unit:', error);
    res.status(500).json({ error: 'Failed to fetch category by unit' });
  }
});

// Novo endpoint: Tendência de problemas por categoria
router.get('/category-trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: startDate }
      },
      include: {
        category: true
      }
    });

    const categoryCount: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      const category = ticket.category?.descricao || 'Sem categoria';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const total = tickets.length;
    const result = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      trends: result,
      totalTickets: total,
      periodDays: days
    });
  } catch (error) {
    console.error('Error fetching category trend:', error);
    res.status(500).json({ error: 'Failed to fetch category trend' });
  }
});

// Novo endpoint: Eficiência operacional
router.get('/operational-efficiency', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const [created, resolved] = await Promise.all([
      prisma.ticket.count({
        where: {
          isArchived: false,
          createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      }),
      prisma.history.count({
        where: {
          to: { in: RESOLVED_STATUSES },
          date: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      })
    ]);

    const efficiency = created > 0 ? Math.round((resolved / created) * 100) : 0;
    
    let status: string;
    if (efficiency >= 100) status = 'excellent';
    else if (efficiency >= 80) status = 'good';
    else if (efficiency >= 50) status = 'fair';
    else status = 'poor';

    res.json({
      efficiency,
      created,
      resolved,
      status,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching operational efficiency:', error);
    res.status(500).json({ error: 'Failed to fetch operational efficiency' });
  }
});

// Novo endpoint: Tempo médio por status
router.get('/avg-time-by-status', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const days = parseInt(req.query.days as string) || 30;
    
    const now = new Date();
    let effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        history: {
          orderBy: { date: 'asc' }
        }
      }
    });

    const statusTimes: Record<string, { total: number; count: number }> = {
      'backlog': { total: 0, count: 0 },
      'pending': { total: 0, count: 0 },
      'todo': { total: 0, count: 0 }
    };

    tickets.forEach(ticket => {
      let lastTime = ticket.createdAt;
      
      ticket.history.forEach(h => {
        const duration = new Date(h.date).getTime() - lastTime.getTime();
        const fromStatus = h.from || 'backlog';
        
        if (statusTimes[fromStatus]) {
          statusTimes[fromStatus].total += duration;
          statusTimes[fromStatus].count++;
        }
        
        lastTime = new Date(h.date);
      });
    });

    const result = Object.entries(statusTimes).map(([status, data]) => ({
      status: status === 'backlog' ? 'Para Fazer' : status === 'pending' ? 'Em Andamento' : 'Aguardando Cliente',
      avgHours: data.count > 0 ? Math.round(data.total / data.count / 1000 / 60 / 60) : 0,
      count: data.count
    }));

    res.json({
      byStatus: result,
      periodDays: days,
      periodStart: effectiveStartDate.toISOString(),
      periodEnd: effectiveEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error fetching avg time by status:', error);
    res.status(500).json({ error: 'Failed to fetch average time by status' });
  }
});

export default router;