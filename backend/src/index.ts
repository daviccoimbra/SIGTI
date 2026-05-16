import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import requesterRoutes from './routes/requesterRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


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
app.use('/archive', express.static('archive'));

// Rotas de autenticação (públicas e protegidas)
app.use('/api/auth', authRoutes);

// Rotas da aplicação
app.use('/api/tickets', ticketRoutes);
app.use('/api/requesters', requesterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/users', userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
