import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { config } from '../config';
import { userService } from '../services/userService';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret as string
};

export const jwtStrategy = new JwtStrategy(opts, async (payload, done) => {
  try {
    const sub = (payload as any).sub as string | undefined;
    const iat = (payload as any).iat as number | undefined;

    if (!sub) return done(null, false);
    const user = await userService.findById(sub);
    if (!user) return done(null, false);

    // التحقق من حالة الحظر
    if (user.isBlocked) return done(null, false);

    // إبطال التوكنات القديمة في حال تم تغيير كلمة المرور
    if (user.passwordChangedAt && iat) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (iat < changedAt) {
        return done(null, false);
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});
