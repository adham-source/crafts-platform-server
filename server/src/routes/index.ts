import { Express } from 'express';
import authRouter from './auth';
import adminRouter from './admin';

export function registerRoutes(app: Express) {
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
}
