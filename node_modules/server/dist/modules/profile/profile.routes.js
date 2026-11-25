import { Router } from 'express';
import { verifyToken } from '../../middleware/authGuard.js';
import { getMyProfile, updateMyProfile } from './profile.controller.js';
export const profileRouter = Router();
profileRouter.get('/', verifyToken, getMyProfile);
profileRouter.put('/', verifyToken, updateMyProfile);
//# sourceMappingURL=profile.routes.js.map