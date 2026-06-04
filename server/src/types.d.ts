import { IUser } from './models/user';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: User;
    }
  }
}

declare module 'swagger-jsdoc';
declare module 'swagger-ui-express';
