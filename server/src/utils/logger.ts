import winston from 'winston';
import path from 'path';
import { config } from '../config';
import fs from 'fs';

/**
 * إعدادات المسجل الاحترافي (Winston)
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// التحقق من إمكانية الكتابة على نظام الملفات (مهم لـ Vercel)
const logsDir = 'logs';
let canWriteLogs = false;
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fs.accessSync(logsDir, fs.constants.W_OK);
  canWriteLogs = true;
} catch (err) {
  console.warn('Warning: Cannot write to logs directory. Using console only.');
  canWriteLogs = false;
}

const transports: winston.transport[] = [];

// إضافة File transports فقط إذا كان الكتابة ممكنة
if (canWriteLogs) {
  transports.push(
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'crafts-backend' },
  transports: transports.length > 0 ? transports : [new winston.transports.Console()],
});

if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
} else {
  // في الإنتاج، أضف Console بدون لون
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export function setupProductionSecurity() {
  if (config.env === 'production') {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    console.error = (...args) => logger.error(args.join(' '));
    console.warn = (...args) => logger.warn(args.join(' '));
    
    logger.info('🛡️ Security mode enabled: Traditional Console blocked, logs redirected to Winston.');
  }
}

export default logger;
