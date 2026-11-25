import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { createCompany, createDrive, deleteDrive, listCompanies, listDrives, updateDrive, } from './drives.controller.js';
export const drivesRouter = Router();
drivesRouter.get('/companies', verifyToken, listCompanies);
drivesRouter.post('/companies', verifyToken, requireRole('COORDINATOR', 'ADMIN'), createCompany);
drivesRouter.get('/drives', verifyToken, listDrives);
drivesRouter.post('/drives', verifyToken, requireRole('COORDINATOR', 'ADMIN'), createDrive);
drivesRouter.put('/drives/:id', verifyToken, requireRole('COORDINATOR', 'ADMIN'), updateDrive);
drivesRouter.delete('/drives/:id', verifyToken, requireRole('COORDINATOR', 'ADMIN'), deleteDrive);
//# sourceMappingURL=drives.routes.js.map