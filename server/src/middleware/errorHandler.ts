import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => {
      // إذا كانت الرسالة عبارة عن مفتاح ترجمة، قم بترجمتها، وإلا استخدم الرسالة الأصلية
      const translatedMessage = req.t ? req.t(issue.message) : issue.message;
      return {
        field: issue.path.join('.'),
        message: translatedMessage
      };
    });
    return res.status(400).json({ 
      success: false,
      errors: formattedErrors 
    });
  }

  const status = (err as any).statusCode || (err as any).status || 500;
  let message = (err as any).message || 'errors:internal_error';

  // المحاولة لترجمة الرسالة إذا كانت عبارة عن Key
  if (req.t) {
    message = req.t(message);
  }

  return res.status(status).json({ message });
};
