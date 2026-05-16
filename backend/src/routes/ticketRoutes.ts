import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  updateTicketStatus, 
  archiveTicket,
  addComment,
  deleteTicket 
} from '../controllers/ticketController.js';

import { upload } from '../lib/multer.js';

const router = Router();

router.post('/', upload.single('anexo'), createTicket);
router.get('/', getTickets);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/archive', archiveTicket);
router.patch('/:id/comment', addComment);
router.delete('/:id', deleteTicket);

export default router;
