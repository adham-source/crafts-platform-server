import { z } from 'zod';
import { UserRole, PublicRole } from '../constants/roles';

/**
 * نظام التحقق من البيانات (Validation System) - مستوى الحماية القصوى
 * تم استخدام Zod مع إضافة قيود أمنية لمنع الهجمات الشائعة (XSS, NoSQL Injection, etc.)
 */

// وظيفة مساعدة لتنظيف النصوص من أي وسوم HTML (منع XSS)
const sanitizeString = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

// قاعدة التحقق من قوة كلمة المرور
const strongPassword = z.string()
  .min(8, 'errors:password_too_short')
  .max(128)
  .regex(/[A-Z]/, 'errors:password_uppercase')
  .regex(/[a-z]/, 'errors:password_lowercase')
  .regex(/[0-9]/, 'errors:password_number')
  .regex(/[^A-Za-z0-9]/, 'errors:password_special');

export const registerSchema = z.object({
  name: z.string()
    .min(2)
    .max(100)
    .transform(sanitizeString),
  email: z.string()
    .email('errors:invalid_email')
    .toLowerCase()
    .trim(),
  password: strongPassword,
  role: z.nativeEnum(PublicRole).optional(),
  craftSpecialty: z.array(z.string().transform(sanitizeString)).optional(),
  bio: z.object({
    ar: z.string().max(500).transform(sanitizeString).optional(),
    en: z.string().max(500).transform(sanitizeString).optional()
  }).optional()
}).strict(); // منع إرسال حقول إضافية غير معرفة

export const loginSchema = z.object({
  email: z.string()
    .email('errors:invalid_email')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'errors:password_required')
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'errors:token_required')
}).strict();

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'errors:token_required')
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('errors:invalid_email')
    .toLowerCase()
    .trim()
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'errors:token_required'),
  password: strongPassword
}).strict();

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().optional()
}).strict();

export const newsletterSchema = z.object({
  subject: z.string()
    .min(5)
    .max(120)
    .transform(sanitizeString),
  message: z.string()
    .min(10)
    .max(5000)
    .transform(sanitizeString)
}).strict();

export const roleUpdateSchema = z.object({
  role: z.nativeEnum(PublicRole)
}).strict();
