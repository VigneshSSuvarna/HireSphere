import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

// Extend the Express Request type so we can attach the user to it safely
export interface AuthRequest extends Request {
  user?: any;
}

// Interceptor 1: Checks if they are logged in at all
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1]; // Gets token from "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Access Denied. No VIP pass." });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach the decoded token info to the request
    next(); // Let them pass
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Interceptor 2: Checks if they are a Coordinator
export const isCoordinator = (req: AuthRequest, res: Response, next: NextFunction): any => {
  if (req.user && req.user.role === 'COORDINATOR') {
    next(); // Let them pass
  } else {
    res.status(403).json({ error: "Access Denied. Coordinators only." });
  }
};