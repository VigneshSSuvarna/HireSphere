import { Router } from 'express';
import { requireRole, verifyToken } from '../../middleware/authGuard.js';
import { createEvent, deleteEvent, listEvents, updateEvent } from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', verifyToken, listEvents);
eventsRouter.post('/', verifyToken, requireRole('COORDINATOR', 'ADMIN'), createEvent);
eventsRouter.put('/:id', verifyToken, requireRole('COORDINATOR', 'ADMIN'), updateEvent);
eventsRouter.delete('/:id', verifyToken, requireRole('COORDINATOR', 'ADMIN'), deleteEvent);
