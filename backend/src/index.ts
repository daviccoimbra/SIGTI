import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import requesterRoutes from './routes/requesterRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import path from 'path'
import fs from 'fs'

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Logger simples para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors({

  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rotas de autenticação (públicas e protegidas)
app.use('/api/auth', authRoutes);

// Rotas da aplicação
app.use('/api/tickets', ticketRoutes);
app.use('/api/requesters', requesterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get(
  '/api/archive/:file',
  (req, res) => {
    try {
      const file =
        decodeURIComponent(
          req.params.file
        )

      const filePath =
        path.join(
          process.cwd(),
          'archive',
          file
        )

      console.log(filePath)

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res
          .status(404)
          .json({
            error:
              'Arquivo não encontrado',
          })
      }

      return res.sendFile(
        filePath
      )
    } catch (err) {
      console.error(err)

      return res
        .status(500)
        .json({
          error:
            'Erro interno',
          })
    }
  }
)