import { Router } from 'express';
import { listUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de gerenciamento de usuários requerem privilégios de ADMIN
router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.get('/', listUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


export default router;
