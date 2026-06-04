import { HttpError } from '../utils/httpError';
import { userService } from './userService';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateAccessToken, generateEmailVerificationToken, generatePasswordResetToken, generateRefreshToken, verifyJwt } from '../utils/tokens';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/mailer';
import { IUser } from '../models/user';
import { UserRole, RoleValue, isPublicRegistrationRole, PublicRole, RoleMapping } from '../constants/roles';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: PublicRole;
  craftSpecialty?: string[];
  bio?: { ar?: string; en?: string };
}

export class AuthService {
  async register(payload: RegisterPayload, baseUrl: string, lng = 'ar'): Promise<IUser> {
    const existing = await userService.findByEmail(payload.email);
    if (existing) {
      throw new HttpError(409, 'auth:email_registered');
    }

    if (payload.role && !Object.values(PublicRole).includes(payload.role)) {
      throw new HttpError(400, 'errors:invalid_role');
    }

    const password = await hashPassword(payload.password);
    const mappedRole = payload.role ? RoleMapping[payload.role] : UserRole.BUYER;
    const user = await userService.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password,
      role: mappedRole,
      craftSpecialty: payload.craftSpecialty,
      bio: payload.bio
    });


    const verifyToken = generateEmailVerificationToken(user._id.toString());
    const verifyLink = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user.email, verifyLink, lng);

    return user;
  }

  async login(email: string, password: string) {
    const user = await userService.findByEmailWithPassword(email);
    if (!user) {
      throw new HttpError(401, 'auth:invalid_credentials');
    }

    if (user.isBlocked) {
      throw new HttpError(403, 'errors:account_blocked');
    }

    const valid = await verifyPassword(password, user.password || '');
    if (!valid) {
      throw new HttpError(401, 'auth:invalid_credentials');
    }

    if (!user.isEmailVerified) {
      throw new HttpError(403, 'auth:email_not_verified');
    }

    const uid = user._id.toString();
    const accessToken = generateAccessToken(uid, user.email);
    const { token: refreshToken, jti, jtiHash } = await generateRefreshToken(uid);
    await userService.addRefreshToken(uid, jtiHash);

    return {
      accessToken,
      refreshToken,
      user: { id: uid, name: user.name, email: user.email, role: user.role }
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = verifyJwt(refreshToken) as any;
    if (payload.type !== 'refresh' || !payload.sub || !payload.jti) {
      throw new HttpError(401, 'auth:invalid_refresh_token');
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      throw new HttpError(401, 'auth:invalid_refresh_token');
    }

    if (user.isBlocked) {
      throw new HttpError(403, 'errors:account_blocked');
    }

    const valid = await userService.verifyRefreshToken(user._id.toString(), payload.jti);
    if (!valid) {
      throw new HttpError(401, 'auth:invalid_refresh_token');
    }

    return generateAccessToken(user._id.toString(), user.email);
  }

  async verifyEmailToken(token: string, lng = 'ar'): Promise<IUser> {
    const payload = verifyJwt(token) as any;
    if (payload.action !== 'verify' || !payload.sub) {
      throw new HttpError(400, 'auth:invalid_token');
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      throw new HttpError(404, 'errors:user_not_found');
    }

    user.isEmailVerified = true;
    await user.save();
    await sendWelcomeEmail(user.email, user.name, lng);
    return user;
  }

  async forgotPassword(email: string, baseUrl: string, lng = 'ar') {
    const user = await userService.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = generatePasswordResetToken(user._id.toString());
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink, lng);
  }

  async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const payload = verifyJwt(token) as any;
    if (payload.action !== 'reset' || !payload.sub) {
      throw new HttpError(400, 'auth:invalid_token');
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      throw new HttpError(404, 'errors:user_not_found');
    }

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
    return user;
  }

  async logout(userId: string, refreshToken?: string, allDevices = false) {
    /**
     * منطق تسجيل الخروج الاحترافي:
     * 1. في حالة "جميع الأجهزة": نقوم بمسح كافة التوكنات. لا نشترط الـ refreshToken 
     *    هنا للسماح للمستخدم بتأمين حسابه في حالات الطوارئ (مثل فقدان الجهاز).
     * 2. في حالة "جهاز واحد": يجب إرسال الـ refreshToken لتعريف الجلسة المراد إبطالها.
     */
    if (allDevices) {
      await userService.revokeAllRefreshTokens(userId);
      return;
    }

    if (!refreshToken) {
      throw new HttpError(400, 'errors:refresh_token_required');
    }

    try {
      const payload = verifyJwt(refreshToken) as any;
      if (payload.sub !== userId || !payload.jti) {
        throw new HttpError(401, 'auth:invalid_refresh_token');
      }
      await userService.removeRefreshToken(userId, payload.jti);
    } catch (error) {
      throw new HttpError(401, 'auth:invalid_refresh_token');
    }
  }
}

export const authService = new AuthService();
