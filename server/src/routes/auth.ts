import { Router } from 'express';
import passport from 'passport';
import { register, login, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe, logout } from '../controllers/authController';
import { validateBody, validateQuery } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, logoutSchema } from '../validators/authSchemas';
import { asyncHandler } from '../utils/asyncHandler';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/me', passport.authenticate('jwt', { session: false }), asyncHandler(getMe));
router.post('/logout', passport.authenticate('jwt', { session: false }), validateBody(logoutSchema), asyncHandler(logout));
router.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(register));
router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(login));
router.post('/refresh-token', validateBody(refreshTokenSchema), asyncHandler(refreshToken));
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), asyncHandler(resetPassword));
router.get('/verify-email', validateQuery(verifyEmailSchema), asyncHandler(verifyEmail));

export default router;
