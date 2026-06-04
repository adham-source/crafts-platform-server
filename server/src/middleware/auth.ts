import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { UserRole, RoleValue } from '../constants/roles';

export const requireAuth = passport.authenticate('jwt', { session: false });

export function requireRole(...roles: RoleValue[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // passport attaches user to req.user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json(({ message:req.t('errors:unauthorized') }));
    }

    if (user.isBlocked) {
      return res.status(403).json(({ message: req.t('errors:account_blocked') }));
    }

    const allowedRoles = new Set<RoleValue>([UserRole.ADMIN, ...roles]);
    if (!allowedRoles.has(user.role)) {
      return res.status(403).json({ message: req.t('errors:forbidden') });
    }

    return next();
  };
}
