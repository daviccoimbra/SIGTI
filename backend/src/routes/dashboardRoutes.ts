import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { getDateRangeFromParams, buildDateFilter, toDateString } from '../utils/dateUtils.js';
import { validate } from '../middleware/validate.js';
import { dashboardQuerySchema } from '../schemas/dashboard.js';

const router = Router();

const RESOLVED_STATUSES = ['todo', 'resolved', 'closed', 'fechado', 'concluido', 'done', 'finalizado'];

const CATEGORY_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#a855f7', '#64748b'
];

// ─── Histórico (todos os chamados, incluindo arquivados) ───

router.get('/kpis', validate(dashboardQuerySchema, 'query'), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate, 'createdAt');
    const dateFilterUpdated = buildDateFilter(startDate, endDate, 'updatedAt');
    const hasDateFilter = startDate || endDate;

    const now = new Date();

    const [
      totalTickets,
      totalClosed,
      inProgress,
      backlog,
      criticalOpen,
      totalCategories,
      totalEquipments,
      totalRequesters
    ] = await Promise.all([
      prisma.ticket.count({
        where: { ...(hasDateFilter ? dateFilter : {}) }
      }),
      prisma.ticket.count({
        where: {
          OR: [
            { status: { in: RESOLVED_STATUSES } },
            { isArchived: true }
          ],
          ...(hasDateFilter ? dateFilterUpdated : {})
        }
      }),
      prisma.ticket.count({
        where: { isArchived: false, status: { notIn: RESOLVED_STATUSES }, ...(hasDateFilter ? dateFilter : {}) }
      }),
      prisma.ticket.count({
        where: {
          isArchived: false,
          status: 'backlog',
          createdAt: {
            ...(hasDateFilter ? { gte: startDate!, lte: endDate! } : {}),
            lt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.ticket.count({
        where: {
          isArchived: false,
          prioridade: { in: ['Alta', 'Crítica', 'alta', 'critica'] },
          status: { notIn: RESOLVED_STATUSES },
          ...(hasDateFilter ? dateFilter : {})
        }
      }),
      prisma.category.count(),
      prisma.equipment.count(),
      prisma.requester.count()
    ]);

    const resolutionRate = totalTickets > 0 ? Math.round((totalClosed / totalTickets) * 100) : 0;

    const ticketsWithHistory = await prisma.ticket.findMany({
      where: { ...(hasDateFilter ? dateFilter : {}) },
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
      totalResolved: totalClosed,
      totalCreated: totalTickets,
      totalClosed,
      inProgress,
      backlog,
      criticalOpen,
      resolutionRate,
      totalCategories,
      totalEquipments,
      totalRequesters,
      avgResponseTime: avgResponseTime ? Math.round(avgResponseTime / 1000 / 60) : null,
      periodStart: startDate ? toDateString(startDate) : null,
      periodEnd: endDate ? toDateString(endDate) : null
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching KPIs');
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

router.get('/charts', validate(dashboardQuerySchema, 'query'), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;

    const tickets = await prisma.ticket.findMany({
      where: { ...(hasDateFilter ? dateFilter : {}) },
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
      finalizado: 0,
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
      const status = ticket.isArchived ? 'finalizado' : (ticket.status || 'backlog');
      if (status in statusCount) {
        statusCount[status] = (statusCount[status] ?? 0) + 1;
      } else {
        statusCount['finalizado'] = (statusCount['finalizado'] ?? 0) + 1;
      }

      const priority = ticket.prioridade || 'Média';
      if (priority in priorityCount) {
        priorityCount[priority] = (priorityCount[priority] ?? 0) + 1;
      } else {
        priorityCount['Média'] = (priorityCount['Média'] ?? 0) + 1;
      }

      if (ticket.category?.descricao) {
        categoryCount[ticket.category.descricao] = (categoryCount[ticket.category.descricao] || 0) + 1;
      }

      if (ticket.departamento) {
        departmentCount[ticket.departamento] = (departmentCount[ticket.departamento] || 0) + 1;
      }

      if (ticket.requester?.unidade) {
        unitCount[ticket.requester.unidade] = (unitCount[ticket.requester.unidade] || 0) + 1;
      }
    });

    const statusData = [
      { name: 'Para Fazer', value: statusCount.backlog, color: '#f59e0b' },
      { name: 'Em Andamento', value: statusCount.pending, color: '#3b82f6' },
      { name: 'Aguardando Cliente', value: statusCount.todo, color: '#ef4444' },
      { name: 'Finalizados', value: statusCount.finalizado, color: '#22c55e' },
    ];

    const priorityData = [
      { name: 'Alta/Crítica', value: (priorityCount['Alta'] || 0) + (priorityCount['Crítica'] || 0), color: '#ef4444' },
      { name: 'Média', value: (priorityCount['Média'] || 0) + (priorityCount['Media'] || 0), color: '#f59e0b' },
      { name: 'Baixa', value: priorityCount['Baixa'] || 0, color: '#22c55e' }
    ];

    const categoryData = Object.entries(categoryCount).map(([name, value], idx) => {
      const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]!;
      return { name, value, color };
    });

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
    logger.error({ err: error }, 'Error fetching chart data');
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;
    const limit = parseInt(req.query.limit as string) || 10;

    const tickets = await prisma.ticket.findMany({
      where: { ...(hasDateFilter ? dateFilter : {}) },
      include: {
        category: true,
        requester: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(tickets);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching recent tickets');
    res.status(500).json({ error: 'Failed to fetch recent tickets' });
  }
});

router.get('/alerts', validate(dashboardQuerySchema, 'query'), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;

    const highPriorityTickets = await prisma.ticket.findMany({
      where: {
        prioridade: { in: ['alta', 'alta_critica', 'Alta', 'Crítica'] },
        status: { notIn: ['todo'] },
        ...(hasDateFilter ? dateFilter : {})
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
    logger.error({ err: error }, 'Error fetching alerts');
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/evolution', validate(dashboardQuerySchema, 'query'), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;
    const hasDateFilter = startDate && endDate;

    if (!hasDateFilter) {
      effectiveStartDate.setTime(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    const dailyData: Record<string, { created: number; closed: number }> = {};

    const currentDate = new Date(effectiveStartDate);
    while (currentDate <= effectiveEndDate) {
      const dateKey = toDateString(currentDate);
      dailyData[dateKey] = { created: 0, closed: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    tickets.forEach(ticket => {
      const dateKey = toDateString(ticket.createdAt);
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
      const dateKey = toDateString(entry.date);
      if (dailyData[dateKey]) {
        dailyData[dateKey].closed++;
      }
    });

    const evolutionData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        created: data.created,
        closed: data.closed
      }));

    res.json(evolutionData);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching evolution data');
    res.status(500).json({ error: 'Failed to fetch evolution data' });
  }
});

router.get('/avg-resolution-time', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { status: { in: RESOLVED_STATUSES } },
          { isArchived: true }
        ],
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      }
    });

    let totalResolutionTime = 0;
    let countResolved = 0;

    resolvedTickets.forEach(ticket => {
      const resolutionTime = Math.abs(ticket.updatedAt.getTime() - ticket.createdAt.getTime());
      totalResolutionTime += resolutionTime;
      countResolved++;
    });

    const avgResolutionTime = countResolved > 0 ? totalResolutionTime / countResolved : 0;

    res.json({
      avgResolutionTime: Math.round(avgResolutionTime / 1000 / 60),
      periodDays: days,
      ticketsAnalyzed: countResolved,
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching avg resolution time');
    res.status(500).json({ error: 'Failed to fetch average resolution time' });
  }
});

router.get('/technician-distribution', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate);
    const hasDateFilter = startDate || endDate;

    const tickets = await prisma.ticket.findMany({
      where: { ...(hasDateFilter ? dateFilter : {}) },
      include: {
        requester: true
      }
    });

    const distribution: Record<string, number> = {};

    tickets.forEach(ticket => {
      const name = ticket.requester?.nome || 'Não atribuído';
      distribution[name] = (distribution[name] || 0) + 1;
    });

    const distributionArray = Object.entries(distribution)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / tickets.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    res.json(distributionArray);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching requester distribution');
    res.status(500).json({ error: 'Failed to fetch requester distribution' });
  }
});

router.get('/sla-compliance', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { status: { in: RESOLVED_STATUSES } },
          { isArchived: true }
        ],
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      }
    });

    let withinSla = 0;
    let totalAnalyzed = 0;

    resolvedTickets.forEach(ticket => {
      totalAnalyzed++;
      const resolutionTimeMs = Math.abs(ticket.updatedAt.getTime() - ticket.createdAt.getTime());
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
    });

    const compliancePercentage = totalAnalyzed > 0 ? Math.round((withinSla / totalAnalyzed) * 100) : 0;

    res.json({
      slaCompliance: compliancePercentage,
      withinSla,
      totalAnalyzed,
      periodDays: days,
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching SLA compliance');
    res.status(500).json({ error: 'Failed to fetch SLA compliance' });
  }
});

router.get('/avg-first-response-time', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
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
      if (firstHistory) {
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching avg first response time');
    res.status(500).json({ error: 'Failed to fetch average first response time' });
  }
});

router.get('/overdue-tickets', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
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
      const ageInHours = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);

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
          overdueByPriority['Alta/Crítica'] = (overdueByPriority['Alta/Crítica'] ?? 0) + 1;
        } else if (priority === 'média' || priority === 'media') {
          overdueByPriority['Média'] = (overdueByPriority['Média'] ?? 0) + 1;
        } else {
          overdueByPriority['Baixa'] = (overdueByPriority['Baixa'] ?? 0) + 1;
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
    logger.error({ err: error }, 'Error fetching overdue tickets');
    res.status(500).json({ error: 'Failed to fetch overdue tickets' });
  }
});

router.get('/creation-vs-resolution', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const [created, resolved] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      }),
      prisma.ticket.count({
        where: {
          OR: [
            { status: { in: RESOLVED_STATUSES } },
            { isArchived: true }
          ],
          updatedAt: { gte: effectiveStartDate, lte: effectiveEndDate }
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching creation vs resolution');
    res.status(500).json({ error: 'Failed to fetch creation vs resolution data' });
  }
});

router.get('/ticket-age', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);

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
      totalAge += (now.getTime() - ticket.createdAt.getTime());
    });

    const avgAgeHours = tickets.length > 0 ? totalAge / tickets.length / (1000 * 60 * 60) : 0;

    res.json({
      avgAgeHours: Math.round(avgAgeHours),
      avgAgeDays: Math.round(avgAgeHours / 24),
      activeTickets: tickets.length,
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching ticket age');
    res.status(500).json({ error: 'Failed to fetch ticket age' });
  }
});

router.get('/resolution-time-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { status: { in: RESOLVED_STATUSES } },
          { isArchived: true }
        ],
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        category: true
      }
    });

    const categoryTimes: Record<string, { total: number; count: number }> = {};

    tickets.forEach(ticket => {
      const categoryName = ticket.category?.descricao || 'Sem categoria';
      const resolutionTime = Math.abs(ticket.updatedAt.getTime() - ticket.createdAt.getTime());

      if (!categoryTimes[categoryName]) {
        categoryTimes[categoryName] = { total: 0, count: 0 };
      }
      categoryTimes[categoryName].total += resolutionTime;
      categoryTimes[categoryName].count++;
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching resolution time by category');
    res.status(500).json({ error: 'Failed to fetch resolution time by category' });
  }
});

router.get('/equipment-issues', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching equipment issues');
    res.status(500).json({ error: 'Failed to fetch equipment issues' });
  }
});

router.get('/category-by-unit', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching category by unit');
    res.status(500).json({ error: 'Failed to fetch category by unit' });
  }
});

router.get('/category-trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const tickets = await prisma.ticket.findMany({
      where: {
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
    logger.error({ err: error }, 'Error fetching category trend');
    res.status(500).json({ error: 'Failed to fetch category trend' });
  }
});

router.get('/operational-efficiency', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const [created, resolved] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
        }
      }),
      prisma.ticket.count({
        where: {
          OR: [
            { status: { in: RESOLVED_STATUSES } },
            { isArchived: true }
          ],
          updatedAt: { gte: effectiveStartDate, lte: effectiveEndDate }
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
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching operational efficiency');
    res.status(500).json({ error: 'Failed to fetch operational efficiency' });
  }
});

router.get('/avg-time-by-status', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const days = parseInt(req.query.days as string) || 30;

    const now = new Date();
    const effectiveStartDate = startDate || new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const effectiveEndDate = endDate || now;

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: effectiveStartDate, lte: effectiveEndDate }
      },
      include: {
        history: {
          orderBy: { date: 'asc' }
        }
      }
    });

    const STATUS_DISPLAY_TO_CODE: Record<string, string> = {
      'Para Fazer': 'backlog',
      'Em Andamento': 'pending',
      'Aguardando Cliente': 'todo',
    };

    const statusTimes: Record<string, { total: number; count: number }> = {
      'backlog': { total: 0, count: 0 },
      'pending': { total: 0, count: 0 },
      'todo': { total: 0, count: 0 }
    };

    tickets.forEach(ticket => {
      let lastTime = ticket.createdAt;

      ticket.history.forEach(h => {
        const duration = h.date.getTime() - lastTime.getTime();
        const fromCode = STATUS_DISPLAY_TO_CODE[h.from] || h.from;

        if (statusTimes[fromCode]) {
          statusTimes[fromCode].total += duration;
          statusTimes[fromCode].count++;
        }

        lastTime = h.date;
      });
    });

    const LABEL_MAP: Record<string, string> = {
      'backlog': 'Para Fazer',
      'pending': 'Em Andamento',
      'todo': 'Aguardando Cliente'
    };

    const result = Object.entries(statusTimes).map(([code, data]) => ({
      status: LABEL_MAP[code] || code,
      avgHours: data.count > 0 ? Math.round(data.total / data.count / 1000 / 60 / 60) : 0,
      count: data.count
    }));

    res.json({
      byStatus: result,
      periodDays: days,
      periodStart: toDateString(effectiveStartDate),
      periodEnd: toDateString(effectiveEndDate)
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching average time by status');
    res.status(500).json({ error: 'Failed to fetch average time by status' });
  }
});

// ─── Em Aberto (apenas chamados não arquivados) ───

router.get('/active-summary', async (req, res) => {
  try {
    const { startDate, endDate } = getDateRangeFromParams(req.query);
    const dateFilter = buildDateFilter(startDate, endDate, 'createdAt');
    const hasDateFilter = startDate || endDate;

    const baseWhere = {
      isArchived: false,
      ...(hasDateFilter ? dateFilter : {})
    } as const;

    const now = new Date();

    const [
      totalActive,
      inProgress,
      backlog,
      criticalOpen,
      activeTickets,
      alerts
    ] = await Promise.all([
      prisma.ticket.count({ where: baseWhere }),
      prisma.ticket.count({
        where: { ...baseWhere, status: { notIn: RESOLVED_STATUSES } }
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          status: 'backlog',
          createdAt: {
            ...(hasDateFilter ? { gte: startDate!, lte: endDate! } : {}),
            lt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.ticket.count({
        where: {
          ...baseWhere,
          prioridade: { in: ['Alta', 'Crítica', 'alta', 'critica'] },
          status: { notIn: RESOLVED_STATUSES }
        }
      }),
      prisma.ticket.findMany({
        where: { ...baseWhere, status: { notIn: RESOLVED_STATUSES } },
        select: {
          id: true,
          prioridade: true,
          createdAt: true,
          status: true
        }
      }),
      prisma.ticket.findMany({
        where: {
          ...baseWhere,
          prioridade: { in: ['alta', 'alta_critica', 'Alta', 'Crítica'] },
          status: { notIn: ['todo'] }
        },
        include: {
          category: true,
          requester: true
        },
        orderBy: { createdAt: 'asc' },
        take: 10
      })
    ]);

    let overdueCount = 0;
    activeTickets.forEach(ticket => {
      const ageInHours = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      let slaHours = 8;
      const priority = ticket.prioridade?.toLowerCase();
      if (priority === 'alta' || priority === 'crítica') slaHours = 4;
      else if (priority === 'baixa') slaHours = 24;
      if (ageInHours > slaHours) overdueCount++;
    });

    const overdueRate = activeTickets.length > 0
      ? Math.round((overdueCount / activeTickets.length) * 100)
      : 0;

    const chartTickets = await prisma.ticket.findMany({
      where: { ...baseWhere },
      include: {
        category: true,
        requester: true
      }
    });

    const statusCount: Record<string, number> = { backlog: 0, pending: 0, todo: 0 };
    const priorityCount: Record<string, number> = { 'Alta': 0, 'Crítica': 0, 'Média': 0, 'Media': 0, 'Baixa': 0 };
    const categoryCount: Record<string, number> = {};
    const departmentCount: Record<string, number> = {};

    chartTickets.forEach(ticket => {
      const status = ticket.status || 'backlog';
      if (status in statusCount) statusCount[status] = (statusCount[status] ?? 0) + 1;
      else statusCount['backlog'] = (statusCount['backlog'] ?? 0) + 1;

      const priority = ticket.prioridade || 'Média';
      if (priority in priorityCount) priorityCount[priority] = (priorityCount[priority] ?? 0) + 1;
      else priorityCount['Média'] = (priorityCount['Média'] ?? 0) + 1;

      if (ticket.category?.descricao) {
        categoryCount[ticket.category.descricao] = (categoryCount[ticket.category.descricao] || 0) + 1;
      }
      if (ticket.departamento) {
        departmentCount[ticket.departamento] = (departmentCount[ticket.departamento] || 0) + 1;
      }
    });

    const statusData = [
      { name: 'Para Fazer', value: statusCount.backlog, color: '#f59e0b' },
      { name: 'Em Andamento', value: statusCount.pending, color: '#3b82f6' },
      { name: 'Aguardando Cliente', value: statusCount.todo, color: '#ef4444' },
    ];

    const priorityData = [
      { name: 'Alta/Crítica', value: (priorityCount['Alta'] || 0) + (priorityCount['Crítica'] || 0), color: '#ef4444' },
      { name: 'Média', value: (priorityCount['Média'] || 0) + (priorityCount['Media'] || 0), color: '#f59e0b' },
      { name: 'Baixa', value: priorityCount['Baixa'] || 0, color: '#22c55e' }
    ];

    const categoryData = Object.entries(categoryCount)
      .map(([name, value], idx) => ({
        name,
        value,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]!
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const departmentData = Object.entries(departmentCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    res.json({
      kpis: {
        totalActive,
        inProgress,
        backlog,
        criticalOpen,
        overdueCount,
        overdueRate
      },
      status: statusData,
      priority: priorityData,
      category: categoryData,
      department: departmentData,
      alerts
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching active summary');
    res.status(500).json({ error: 'Failed to fetch active summary' });
  }
});

export default router;
