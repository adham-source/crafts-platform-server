import { Express, Request, Response, NextFunction } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';
import path from 'path';
import logger from '../utils/logger';
import { config } from '../config';

export function setupI18n(app: Express) {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      fallbackLng: 'ar',
      supportedLngs: ['ar', 'en'],
      preload: ['ar', 'en'],
      ns: ['common', 'auth', 'admin', 'errors'],
      defaultNS: 'common',
      backend: { 
        loadPath: path.join(process.cwd(), 'locales/{{lng}}/{{ns}}.json')
      },
      detection: {
        order: ['header', 'querystring', 'cookie'],
        caches: false
      },
      interpolation: {
        escapeValue: false
      }
    });

  app.use(handle(i18next));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (config.env !== 'production') {
      logger.debug(`Detected Language: ${req.language} | Header: ${req.headers['accept-language']}`);
    }
    next();
  });
}
