import { Router } from 'express';
import { login, logout, register, me } from '../controllers/authController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota pública — login
router.post('/login', login);
router.post('/logout', logout);

// Rota protegida — apenas ADMIN pode registrar novos usuários
router.post('/register', authMiddleware, authorize('ADMIN'), register);

// Rota protegida — dados do usuário logado
router.get('/me', authMiddleware, me);

export default router;
