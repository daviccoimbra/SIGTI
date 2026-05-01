import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  updateTicketStatus, 
  archiveTicket, 
  deleteTicket 
} from '../controllers/ticketController.js';

const router = Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/archive', archiveTicket);
router.delete('/:id', deleteTicket);

export default router;
