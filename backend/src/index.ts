import dotenv from 'dotenv';
import app from './app.js';
import { logger } from './lib/logger.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});
