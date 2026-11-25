import 'dotenv/config';
import './config';
import express from 'express';
import cors from 'cors';
import { db, users } from './db/schema'; // ✅ Removed .js
import { registerUser, loginUser } from './modules/users/user.controller'; // ✅ Removed .js
import { logProblem, getUserProgress, deleteProblem } from './modules/dsa/dsa.controller';
import { verifyToken } from './middleware/authGuard';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// DSA Progress Routes
app.post('/api/dsa', verifyToken, logProblem);
app.get('/api/dsa', verifyToken, getUserProgress);
app.delete('/api/dsa/:id', verifyToken, deleteProblem);

// Current User Route
app.get('/api/auth/me', verifyToken, async (req: any, res) => {
  try {
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    const user = userResult[0];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 HireSphere server is live on http://localhost:${PORT}`);
});