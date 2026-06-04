import { Router } from 'express';
import { listUsers, updateRole, revokeRefresh, sendNewsletter, toggleBlock } from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { newsletterSchema, roleUpdateSchema } from '../validators/authSchemas';
import { apiActionLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../constants/roles';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

router.get('/users', listUsers);
router.patch('/users/:id/role', validateBody(roleUpdateSchema), updateRole);
router.patch('/users/:id/block', toggleBlock);
router.post('/users/:id/revoke-refresh', revokeRefresh);
router.post('/newsletter', apiActionLimiter, validateBody(newsletterSchema), sendNewsletter);

export default router;
