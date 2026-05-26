import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import ticketRoutes from './routes/ticketRoutes.js';
import requesterRoutes from './routes/requesterRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path.startsWith('/archive'),
});
app.use(limiter);

app.use('/archive', express.static('archive'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', authMiddleware, ticketRoutes);
app.use('/api/requesters', authMiddleware, requesterRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/equipments', authMiddleware, equipmentRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

app.get('/api/archive/:file', authMiddleware, (req, res) => {
  try {
    const fileParam = req.params.file;
    if (typeof fileParam !== 'string') {
      return res.status(400).json({ error: 'Arquivo inválido' });
    }
    const file = decodeURIComponent(fileParam);
    const archiveDir = path.resolve(process.cwd(), 'archive');
    const filePath = path.resolve(archiveDir, file);

    if (!filePath.startsWith(archiveDir)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    return res.sendFile(filePath);
  } catch (err) {
    logger.error({ err }, 'Erro ao obter arquivo do arquivo');
    return res.status(500).json({ error: 'Erro interno' });
  }
});

app.use(errorHandler);

export default app;
