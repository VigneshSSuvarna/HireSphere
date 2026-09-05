import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db, users } from './db/schema'; 
import { registerUser, loginUser } from './modules/users/user.controller'; 
import { logProblem, getUserProgress, updateProblem, deleteProblem } from './modules/dsa/dsa.controller';
import { verifyToken } from './middleware/authGuard';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// DSA Progress Routes
app.post('/api/dsa', verifyToken, logProblem);
app.get('/api/dsa', verifyToken, getUserProgress);
app.put('/api/dsa/:id', verifyToken, updateProblem); 
app.delete('/api/dsa/:id', verifyToken, deleteProblem);

// Mock Drives Route to fix Frontend 404s
app.get('/api/drives', verifyToken, (req, res) => {
  res.json([
    { id: 1, company: "TechNova Solutions", role: "Frontend Developer", package: "12 LPA", deadline: "Oct 15", status: "Open" },
    { id: 2, company: "DataSphere", role: "Data Analyst", package: "9 LPA", deadline: "Oct 18", status: "Applied" },
    { id: 3, company: "CyberShield Inc.", role: "Security Associate", package: "15 LPA", deadline: "Oct 20", status: "Open" }
  ]);
});

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

// NOISY HEALTH ROUTE FOR DEBUGGING!
app.get('/api/health', async (req, res) => {
  console.log("➡️ Health route was hit by the browser!");
  
  try {
    console.log("⏳ Asking the Neon Database for users...");
    const allUsers = await db.select().from(users);
    
    console.log("✅ Database replied successfully!");
    res.json({ message: "✅ Connected to HireSphere Backend successfully!", users: allUsers });
  } catch (error: any) {
    console.error("❌ DATABASE ERROR: ", error);
    res.status(500).json({ error: "Failed to fetch from database", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HireSphere server is live on http://localhost:${PORT}`);
});