import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { changeUserRole, listAuditLogs, listUsers, setUserActive, } from './admin.controller.js';
export const adminRouter = Router();
adminRouter.use(verifyToken, requireRole('ADMIN'));
adminRouter.get('/users', listUsers);
adminRouter.patch('/users/:id/role', changeUserRole);
adminRouter.patch('/users/:id/active', setUserActive);
adminRouter.get('/logs', listAuditLogs);
//# sourceMappingURL=admin.routes.js.map