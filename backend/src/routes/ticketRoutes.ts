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
import { validate } from '../middleware/validate.js';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.js';

const router = Router();

router.post('/', upload.single('anexo'), validate(createTicketSchema), createTicket);
router.get('/', getTickets);
router.patch('/:id/status', validate(updateTicketSchema), updateTicketStatus);
router.patch('/:id/archive', archiveTicket);
router.patch('/:id/comment', addComment);
router.delete('/:id', deleteTicket);

export default router;
