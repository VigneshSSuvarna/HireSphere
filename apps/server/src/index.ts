import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { users } from './db/schema.js';
import { registerUser, loginUser } from './modules/users/user.controller.js';
import { logProblem, getUserProgress, updateProblem, deleteProblem } from './modules/dsa/dsa.controller.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { drivesRouter } from './modules/drives/drives.routes.js';
import { applicationsRouter } from './modules/applications/applications.routes.js';
import { studentsRouter } from './modules/students/students.routes.js';
import { resumeRouter } from './modules/resume/resume.routes.js';
import { statsRouter } from './modules/stats/stats.routes.js';
import { eventsRouter } from './modules/events/events.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { getJwtSecret, verifyToken, type AuthRequest } from './middleware/authGuard.js';

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

app.get('/api/auth/me', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.is_active,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// DSA Progress Routes
app.post('/api/dsa', verifyToken, logProblem);
app.get('/api/dsa', verifyToken, getUserProgress);
app.put('/api/dsa/:id', verifyToken, updateProblem);
app.delete('/api/dsa/:id', verifyToken, deleteProblem);

// Feature Module Routers
app.use('/api/profile', profileRouter);
app.use('/api', drivesRouter);
app.use('/api', applicationsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/stats', statsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/admin', adminRouter);

// Health Check with real DB latency
app.get('/api/health', async (_req, res) => {
  const start = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latencyMs = Math.round(performance.now() - start);
    res.json({ status: 'ok', database: 'connected', latencyMs });
  } catch {
    const latencyMs = Math.round(performance.now() - start);
    res.status(500).json({ status: 'error', database: 'disconnected', latencyMs });
  }
});

app.listen(PORT, () => {
  console.log(`HireSphere server listening on http://localhost:${PORT}`);
});
