import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { getAdminStats, getCoordinatorStats, getStudentStats } from './stats.controller.js';

export const statsRouter = Router();

statsRouter.get('/student', verifyToken, requireRole('STUDENT'), getStudentStats);
statsRouter.get('/coordinator', verifyToken, requireRole('COORDINATOR', 'ADMIN'), getCoordinatorStats);
statsRouter.get('/admin', verifyToken, requireRole('ADMIN'), getAdminStats);
