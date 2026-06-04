import { createServer } from './app';
import { connectDB } from './db';
import logger, { setupProductionSecurity } from './utils/logger';
import { config } from './config';

async function start() {
  // تفعيل نظام الأمان للسجلات في بيئة الإنتاج
  setupProductionSecurity();

  await connectDB();
  const app = createServer();
  const port = config.port;

  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
    logger.info(`Swagger: http://localhost:${port}/api/docs`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
