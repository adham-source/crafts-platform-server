import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { sendNewsEmail } from '../utils/mailer';
import { IUser } from '../models/user';
import { UserRole, RoleValue, PublicRole, RoleMapping } from '../constants/roles';

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List All Users
 *     description: Returns a list of all registered users with their roles and status. Requires Admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     responses:
 *       '200':
 *         description: A list of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       '401':
 *         description: Unauthorized. Valid Admin JWT token is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden. User does not have administrative permissions.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function listUsers(_req: Request, res: Response) {
  const users = await userService.all();
  const safe = users.map((user: IUser) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role === UserRole.ADMIN ? undefined : user.role,
    isEmailVerified: user.isEmailVerified,
    isBlocked: user.isBlocked
  }));
  return res.json({ data: safe });
}

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update User Role
 *     description: Changes the role of a specific user. Admins cannot change their own roles through this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUpdateRequest'
 *     responses:
 *       '200':
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Invalid role key provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden. Attempting to modify an Admin or insufficient permissions.
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
export async function updateRole(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body;
 
  const user = await userService.findById(id as string);
  if (!user) {
    return res.status(404).json({ message: req.t('errors:user_not_found') });
  }

  // prevent changing admin role to avoid lockout
  if (user.role === UserRole.ADMIN) {
    return res.status(403).json({ message: req.t('admin:cannot_modify_admin_role') });
  }

  user.role = RoleMapping[role as PublicRole];
  await user.save();
  return res.json({ message: req.t('admin:role_updated') });
}

/**
 * @openapi
 * /api/admin/users/{id}/block:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Block/Unblock User
 *     description: Toggles the blocked status of a user account. Admins cannot be blocked.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleBlockRequest'
 *     responses:
 *       '200':
 *         description: User status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden. Cannot block an Admin.
 *       '404':
 *         description: User not found.
 */
export async function toggleBlock(req: Request, res: Response) {
  const { id } = req.params;
  const { isBlocked } = req.body;

  const user = await userService.findById(id as string);
  if (!user) return res.status(404).json({ message: req.t('errors:user_not_found') });

  if (user.role === UserRole.ADMIN) {
    return res.status(403).json({ message: req.t('admin:cannot_block_admin') });
  }

  user.isBlocked = isBlocked;
  await user.save();
  return res.json({ message: req.t('admin:user_status_updated') });
}

/**
 * @openapi
 * /api/admin/users/{id}/revoke-refresh:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Revoke Refresh Tokens
 *     description: Revokes a specific refresh token (by JTI) or all refresh tokens for a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user.
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/LanguageHeader'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RevokeRefreshRequest'
 *     responses:
 *       '200':
 *         description: Refresh token(s) revoked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Missing user ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 */
export async function revokeRefresh(req: Request, res: Response) {
  const { id } = req.params;
  const { jti } = req.body;
  if (!id) {
    return res.status(400).json({ message: req.t('admin:missing_user_id') });
  }

  if (!jti) {
    await userService.revokeAllRefreshTokens(id as string);
    return res.json({ message: req.t('admin:all_refresh_tokens_revoked') });
  }

  await userService.removeRefreshToken(id as string, jti);
  return res.json({ message: req.t('admin:refresh_token_revoked') });
  }

  /**
   * @openapi
   * /api/admin/newsletter:
   *   post:
   *     tags:
   *       - Admin
   *     summary: Send Newsletter
   *     description: Broadcasts a newsletter email to all users with verified email addresses.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/LanguageHeader'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewsletterRequest'
   *     responses:
   *       '200':
   *         description: Newsletter broadcasted successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       '401':
   *         description: Unauthorized.
   *       '403':
   *         description: Forbidden.
   */
  export async function sendNewsletter(req: Request, res: Response) {
  const { subject, message } = req.body;
  const users = await userService.all();
  const recipients = users.filter((u) => u.isEmailVerified).map((user) => user.email);

  await Promise.all(recipients.map((email) => sendNewsEmail(email, subject, message)));

  return res.json({
    success: true,
    message: req.t('admin:newsletter_sent'),
    count: recipients.length
  });
  }
