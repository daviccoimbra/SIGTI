import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import requesterRoutes from './routes/requesterRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas de autenticação (públicas e protegidas)
app.use('/api/auth', authRoutes);

// Rotas da aplicação
app.use('/api/tickets', ticketRoutes);
app.use('/api/requesters', requesterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipments', equipmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
