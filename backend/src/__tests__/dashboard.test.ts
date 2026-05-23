import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

const mockPrisma = {
  ticket: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
    aggregate: vi.fn().mockResolvedValue({ _avg: { resolvedAt: null } }),
  },
  ticketHistory: {
    findMany: vi.fn().mockResolvedValue([]),
    groupBy: vi.fn().mockResolvedValue([]),
  },
};

vi.mock('../lib/prisma.js', () => ({
  default: mockPrisma,
}));

let app: any;

beforeAll(async () => {
  vi.resetModules();
  const mod = await import('../app.js');
  app = mod.default;
});

describe('GET /api/health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Dashboard routes — validation', () => {
  it('should reject invalid days param on /kpis', async () => {
    const res = await request(app).get('/api/dashboard/kpis?days=abc');
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Dados inválidos');
    expect(res.body.details).toBeDefined();
  });

  it('should reject days outside 1-365 on /kpis', async () => {
    const res = await request(app).get('/api/dashboard/kpis?days=999');
    expect(res.status).toBe(422);
  });

  it('should reject invalid date format on /charts', async () => {
    const res = await request(app).get('/api/dashboard/charts?startDate=01-01-2024');
    expect(res.status).toBe(422);
  });

  it('should accept valid query params on /charts', async () => {
    const res = await request(app).get('/api/dashboard/charts?startDate=2024-01-01&endDate=2024-12-31');
    expect(res.status).not.toBe(422);
  });

  it('should reject invalid date on /evolution', async () => {
    const res = await request(app).get('/api/dashboard/evolution?endDate=not-a-date');
    expect(res.status).toBe(422);
  });

  it('should reject invalid date on /alerts', async () => {
    const res = await request(app).get('/api/dashboard/alerts?startDate=not-a-date');
    expect(res.status).toBe(422);
  });

  it('should accept valid query on /alerts', async () => {
    const res = await request(app).get('/api/dashboard/alerts?days=30');
    expect(res.status).not.toBe(422);
  });
});

describe('Ticket routes — validation', () => {
  it('should reject empty body on POST /api/tickets', async () => {
    const res = await request(app).post('/api/tickets').send({});
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Dados inválidos');
  });

  it('should reject missing status on PATCH /api/tickets/1/status', async () => {
    const res = await request(app).patch('/api/tickets/1/status').send({});
    expect(res.status).toBe(422);
  });
});
