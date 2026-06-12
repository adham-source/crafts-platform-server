import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import morgan from 'morgan';
import { jwtStrategy } from './passport/jwtStrategy';
import { registerRoutes } from './routes';
import { setupSwagger } from './swagger';
import { setupI18n } from './middleware/i18n';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

export function createServer(): Application {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  setupI18n(app);

  // تطبيق المحدِد العام على جميع المسارات
  app.use(generalLimiter);

  passport.use(jwtStrategy);
  app.use(passport.initialize());

  registerRoutes(app);
  setupSwagger(app);

  /**
   * @openapi
   * /health:
   *   get:
   *     tags:
   *       - System
   *     summary: Health Check
   *     description: Verifies that the API service is up and running.
   *     responses:
   *       '200':
   *         description: Service is healthy.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  app.get('/health', (req, res) =>{
     // favicon.ico
    if (req.path === '/favicon.ico') {
      return res.status(204).end();
    }
    res.json({ success: true, message: req.t('common:health_check') })
  });
   
  app.use(errorHandler);

  return app;
}
