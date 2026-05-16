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

router.get('/kpis', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = getStartOfDay(now);
    const endOfToday = getEndOfDay(now);

    const [
      totalTickets,
      openToday,
      inProgress,
      closedToday,
      totalCategories,
      totalEquipments,
      totalRequesters
    ] = await Promise.all([
      prisma.ticket.count({ where: { isArchived: false } }),
      prisma.ticket.count({
        where: {
          isArchived: false,
          createdAt: { gte: startOfToday, lte: endOfToday }
        }
      }),
      prisma.ticket.count({
        where: {
          isArchived: false,
          status: 'pending'
        }
      }),
      prisma.ticket.count({
        where: {
          isArchived: false,
          updatedAt: { gte: startOfToday, lte: endOfToday },
          status: 'pending'
        }
      }),
      prisma.category.count(),
      prisma.equipment.count(),
      prisma.requester.count()
    ]);

    const avgResponseTime = await prisma.history.findFirst({
      where: {
        from: 'backlog'
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      totalTickets,
      openToday,
      inProgress,
      closedToday,
      totalCategories,
      totalEquipments,
      totalRequesters,
      avgResponseTime: null
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        requester: true
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

    res.json({
      status: statusData,
      priority: priorityData,
      category: categoryData,
      department: departmentData
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
    const days = parseInt(req.query.days as string) || 7;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const tickets = await prisma.ticket.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    const dailyData: Record<string, { created: number; closed: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { created: 0, closed: 0 };
    }

    tickets.forEach(ticket => {
      const dateKey = ticket.createdAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].created++;
      }
    });

    const historyEntries = await prisma.history.findMany({
      where: {
        to: { in: ['resolved', 'closed', 'fechado', 'concluido'] },
        date: { gte: startDate }
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

export default router;