import dotenv from 'dotenv';
dotenv.config();

if(process.env.NODE_ENV === 'production') {
  console.warn('Running in production mode. Ensure all environment variables are set correctly.');
} else {
  console.info('Running in development mode. Loaded environment variables from .env file.');
}

/**
 * ملف الإعدادات المركزي (Centralized Config)
 * الهدف: تجميع كافة متغيرات البيئة في مكان واحد لتسهيل الصيانة وتجنب تكرار process.env
 */

export const config = {
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET as string,
  saltRounds: Number(process.env.SALT_ROUNDS),
  secretKey: process.env.SECRET_KEY as string,
  
  // إعدادات قاعدة البيانات
  mongo: {
    uri: process.env.MONGO_URI as string,
  },

  // نظام الأدوار المحمي (Secret Roles)
  // استخدام نصوص سرية فريدة تجعل تخمين الأدوار مستحيلاً حتى لو تم تسريب قاعدة البيانات جزئياً
  roles: {
    admin: process.env.ADMIN_ROLE as string,
    artisan: process.env.ARTISAN_ROLE as string,
    buyer: process.env.BUYER_ROLE as string
  },

  // إعدادات البريد الإلكتروني
  mail: {
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    from: process.env.SMTP_FROM as string || 'Crafts Platform <no-reply@crafts.local>',
  },

  // روابط الواجهة الأمامية والتوثيق
  urls: {
    frontend: process.env.FRONTEND_URL as string,
    server: process.env.SERVER_URL as string,
  }
};
