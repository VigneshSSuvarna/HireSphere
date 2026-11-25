import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { applyToDrive, getDriveApplications, getMyApplications, updateApplicationStatus, } from './applications.controller.js';
export const applicationsRouter = Router();
applicationsRouter.post('/drives/:id/apply', verifyToken, requireRole('STUDENT'), applyToDrive);
applicationsRouter.get('/applications/mine', verifyToken, requireRole('STUDENT'), getMyApplications);
applicationsRouter.get('/drives/:id/applications', verifyToken, requireRole('COORDINATOR', 'ADMIN'), getDriveApplications);
applicationsRouter.patch('/applications/:id', verifyToken, requireRole('COORDINATOR', 'ADMIN'), updateApplicationStatus);
//# sourceMappingURL=applications.routes.js.map