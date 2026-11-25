import { Router, type NextFunction, type Request, type Response } from 'express';
import { verifyToken } from '../../middleware/authGuard.js';
import { resumeUpload } from '../../middleware/upload.js';
import { getMyResumeScans, scanResume } from './resume.controller.js';

export const resumeRouter = Router();

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  resumeUpload.single('resume')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'File upload failed';
      res.status(400).json({ error: msg });
      return;
    }
    next();
  });
};

resumeRouter.post('/scan', verifyToken, handleUpload, scanResume);
resumeRouter.get('/scans', verifyToken, getMyResumeScans);
