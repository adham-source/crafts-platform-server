import { ZodTypeAny } from 'zod';
import { RequestHandler } from 'express';

/**
 * ميدل وير التحقق من البيانات (Validation Middleware)
 * تم التعديل ليتوافق مع Express 5 الذي يمنع إعادة تعيين req.query مباشرة.
 */

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const validated = schema.parse(req.body);
    // نقوم بتحديث الحقول الموجودة بدلاً من استبدال الكائن بالكامل
    Object.assign(req.body, validated);
    next();
  };
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const validated = schema.parse(req.query);
    // في Express 5، req.query هو getter ولا يمكن إعادة تعيينه
    // لذا نقوم بحذف المفاتيح القديمة وإضافة المفاتيح التي تم التحقق منها
    for (const key in req.query) {
      delete (req.query as any)[key];
    }
    Object.assign(req.query, validated);
    next();
  };
}
