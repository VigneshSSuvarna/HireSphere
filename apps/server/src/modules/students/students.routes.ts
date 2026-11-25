import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { exportStudentsCsv, listStudents } from './students.controller.js';

export const studentsRouter = Router();

studentsRouter.get('/', verifyToken, requireRole('COORDINATOR', 'ADMIN'), listStudents);
studentsRouter.get('/export.csv', verifyToken, requireRole('COORDINATOR', 'ADMIN'), exportStudentsCsv);
