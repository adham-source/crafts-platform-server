import { createServer } from './app';
import { connectDB } from './db';
import logger, { setupProductionSecurity } from './utils/logger';
import { config } from './config';

async function start() {
  // تفعيل نظام الأمان للسجلات في بيئة الإنتاج
  setupProductionSecurity();

  try {
    await connectDB();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  const app = createServer();
  const port = config.port;

  const server = app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
    logger.info(`📚 Swagger: ${config.urls.swagger}/api/docs`);
    logger.info(`🌍 Environment: ${config.env}`);
  });

  // معالجة الأخطاء غير المتوقعة
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${port} is already in use`);
    } else {
      logger.error('❌ Server error:', error);
    }
    process.exit(1);
  });

  // معالجة عمليات الإيقاف
  process.on('SIGTERM', () => {
    logger.info('⚠️ SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('✅ HTTP server closed');
      process.exit(0);
    });
  });
}

// استخدام try و catch لتسجيل أي أخطاء بدء التشغيل
try {
  start();
} catch (error) {
  logger.error('❌ Fatal error during startup:', error);
  process.exit(1);
}
