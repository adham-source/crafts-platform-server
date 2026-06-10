import { createServer } from './app.js';
import { connectDB } from './db.js';
import logger, { setupProductionSecurity } from './utils/logger.js';
import { config } from './config.js';

// تفعيل نظام الأمان للسجلات في بيئة الإنتاج
setupProductionSecurity();

// تصدير الـ app ليعمل كـ Serverless Function على Vercel
const app = createServer();

// محاولة الاتصال بقاعدة البيانات بشكل كلي (Global) لضمان إعادة استخدام الاتصال
connectDB()
  .then(() => logger.info('✅ Database connected successfully'))
  .catch((error) => logger.error('❌ Database connection error:', error));

// التشغيل التقليدي للسيرفر (فقط إذا لم يكن يعمل كـ Serverless Function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const port = config.port || 4000;
  app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
  });
}

export default app;
