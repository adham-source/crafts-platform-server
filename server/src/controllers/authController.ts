import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { HttpError } from '../utils/httpError';
import { userService } from '../services/userService';
import { IUser } from '../models/user';
import { getPublicRole } from '../constants/roles';

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User Logout
 *     description: Logs out the user by revoking the current refresh token or all refresh tokens for all devices.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       '200':
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Missing refresh token for single device logout.
 *       '401':
 *         description: Invalid refresh token.
 */
export async function logout(req: Request, res: Response) {
  const userReq = req.user as IUser;
  const { refreshToken, allDevices } = req.body;
  await authService.logout(userReq._id.toString(), refreshToken, allDevices);
  // Return different messages based on whether it's a single device logout or all devices logout
  if (allDevices) {
    return res.json({ success: true, message: req.t('auth:logout_all_devices_success') });
  }
  return res.json({ success: true, message: req.t('auth:logout_success') });
}

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get Current User Profile
 *     description: Retrieves the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSummary'
 *       '401':
 *         description: Unauthorized. Valid JWT token is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function getMe(req: Request, res: Response) {
  const userReq = req.user as IUser;
  const user = await userService.findById(userReq._id.toString());
  if (!user) {
    throw new HttpError(404, 'errors:user_not_found');
  }

  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: getPublicRole(user.role), // إظهار الاسم العام بدلاً من المفتاح السري
    craftSpecialty: user.craftSpecialty,
    bio: user.bio
  });
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account. Artisan-specific fields like `craftSpecialty` and `bio` are optional.
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: Registration successful. An activation email will be sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationSuccess'
 *       '400':
 *         description: Validation failed or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Conflict. Email already registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function register(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  await authService.register(req.body, baseUrl);
  return res.status(201).json({
    success: true,
    message: req.t('auth:registration_success'),
  });
}

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User Login
 *     description: Authenticates a user and returns access and refresh tokens.
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthPayload'
 *       '401':
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden. Account might be blocked or email not verified.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.json(result);
}

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh Access Token
 *     description: Exchanges a valid refresh token for a new access token.
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       '200':
 *         description: Token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessTokenResponse'
 *       '401':
 *         description: Refresh token is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const accessToken = await authService.refreshToken(refreshToken);
  return res.json({ accessToken });
}

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request Password Reset
 *     description: Sends a password reset link to the user's registered email address.
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       '200':
 *         description: Request processed. If the email exists, a reset link was sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Invalid email format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function forgotPassword(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  await authService.forgotPassword(req.body.email, baseUrl, req.language);
  return res.json({ success: true, message: req.t('auth:password_reset_email_sent') });
}

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset Password
 *     description: Sets a new password using a valid reset token.
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       '200':
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Token is invalid, expired, or passwords do not meet complexity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return res.json({ success: true, message: req.t('auth:password_reset_success') });
}

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify Email Address
 *     description: Verifies a user's email address using the token provided in the registration email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The unique verification token.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     responses:
 *       '200':
 *         description: Email verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Token is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: User associated with the token not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string;
  await authService.verifyEmailToken(token, req.language);
  return res.json({ success: true, message: req.t('auth:email_verification_success') });
}
