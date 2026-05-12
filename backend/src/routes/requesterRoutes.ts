import { Router } from 'express';
import { createRequester, getRequesters } from '../controllers/requesterController.js';

const router = Router();

router.post('/', createRequester);
router.get('/', getRequesters);

export default router;
