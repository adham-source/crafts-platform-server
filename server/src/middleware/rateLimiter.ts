import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * نظام تحديد معدل الطلبات (Rate Limiting) الاحترافي
 * تم تقسيم النظام لثلاث مستويات لضمان الأمان والمرونة:
 */

// 1. المحدِد العام (General Limiter): لحماية جميع المسارات بشكل عام
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل 15 دقيقة
  standardHeaders: true,
  legacyHeaders: false,
  message: (req: Request) => ({
    status: 429,
    message: req.t('errors:too_many_requests')
  })
});

// 2. المحدِد الصارم (Auth Limiter): لحماية مسارات الحساسة مثل التسجيل والدخول
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // يسمح بـ 10 محاولات فقط في الساعة (للدخول/التسجيل/استعادة كلمة المرور)
  standardHeaders: true,
  legacyHeaders: false,
  message: (req: Request) => ({
    status: 429,
    message: req.t('errors:too_many_auth_attempts')
  }),
  // تخطي التحقق إذا كان الطلب ناجحاً (اختياري لتقليل القيود على المستخدمين الشرعيين)
  skipSuccessfulRequests: false 
});

// 3. المحدِد الخاص بالرسائل الإخبارية (Newsletter Limiter): لمنع إساءة استخدام خدمة الإرسال
export const apiActionLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 دقيقة
  max: 20, 
  standardHeaders: true,
  legacyHeaders: false,
  message: (req: Request) => ({
    status: 429,
    message: req.t('errors:too_many_actions')
  })
});
