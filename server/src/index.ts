import { createServer } from './app';
import { connectDB } from './db';
import logger, { setupProductionSecurity } from './utils/logger';
import { config } from './config';

setupProductionSecurity();
const app = createServer();

// الاتصال بقاعدة البيانات ثم بدء الخادم
connectDB()
  .then(() => {
    app.listen(config.port, () => {
      logger.info(`Server is running on ${config.urls.server}`);
      logger.info(`Swagger docs available at ${config.urls.server}/api/docs`);
      logger.info(`Environment: ${config.env}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to the database', err);
    process.exit(1);
  });