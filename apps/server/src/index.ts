import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { users } from './db/schema.js';
import { registerUser, loginUser, updateUserRole } from './modules/users/user.controller.js';
import { logProblem, getUserProgress, updateProblem, deleteProblem } from './modules/dsa/dsa.controller.js';
import { getJwtSecret, requireRole, verifyToken, type AuthRequest } from './middleware/authGuard.js';

// Fail fast if required secrets are missing
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 5000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication requests, please try again later.' },
});

// Global Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', authLimiter, registerUser);
app.post('/api/auth/login', authLimiter, loginUser);

// Admin User Role Route
app.patch('/api/admin/users/:id/role', verifyToken, requireRole('ADMIN'), updateUserRole);

// DSA Progress Routes
app.post('/api/dsa', verifyToken, logProblem);
app.get('/api/dsa', verifyToken, getUserProgress);
app.put('/api/dsa/:id', verifyToken, updateProblem);
app.delete('/api/dsa/:id', verifyToken, deleteProblem);

// Mock Drives Route (to be replaced in Phase 2)
app.get('/api/drives', verifyToken, (_req, res) => {
  res.json([
    { id: 1, company: 'TechNova Solutions', role: 'Frontend Developer', package: '12 LPA', deadline: 'Oct 15', status: 'Open' },
    { id: 2, company: 'DataSphere', role: 'Data Analyst', package: '9 LPA', deadline: 'Oct 18', status: 'Applied' },
    { id: 3, company: 'CyberShield Inc.', role: 'Security Associate', package: '15 LPA', deadline: 'Oct 20', status: 'Open' },
  ]);
});

// Current User Route
app.get('/api/auth/me', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    const user = userResult[0];
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Health Check
app.get('/api/health', async (_req, res) => {
  try {
    await db.select({ id: users.id }).from(users).limit(1);
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`HireSphere server listening on http://localhost:${PORT}`);
});
