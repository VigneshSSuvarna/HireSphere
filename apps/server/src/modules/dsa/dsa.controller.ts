import { Response } from 'express';
import { db, dsaLogs, users } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard';

const calculateAndSaveStreak = async (userId: string) => {
  const logs = await db.select().from(dsaLogs)
    .where(eq(dsaLogs.userId, userId))
    .orderBy(desc(dsaLogs.completedAt));

  let streak = 0;
  const uniqueDates = [...new Set(logs.map(log => new Date(log.completedAt).toDateString()))];

  let refDate = new Date();
  refDate.setHours(0, 0, 0, 0); 

  for (let i = 0; i < uniqueDates.length; i++) {
    const logDate = new Date(uniqueDates[i]);
    logDate.setHours(0, 0, 0, 0); 
    const diffDays = Math.ceil(Math.abs(refDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (streak === 0) streak = 1; 
    } else if (diffDays === 1) {
      streak++;
      refDate = logDate; 
    } else {
      break; 
    }
  }
  
  await db.update(users).set({ streak }).where(eq(users.id, userId));
  return streak;
};

export const logProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { problemTitle, problemUrl, difficulty } = req.body;
    const userId = String(req.user!.id); 

    await db.insert(dsaLogs).values({ userId, problemTitle, problemUrl, difficulty });
    const currentStreak = await calculateAndSaveStreak(userId);

    res.status(201).json({ message: "Problem logged!", currentStreak });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to log problem", details: error.message });
  }
};

export const getUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.user!.id); 
    const logs = await db.select().from(dsaLogs)
      .where(eq(dsaLogs.userId, userId))
      .orderBy(desc(dsaLogs.completedAt));

    const currentStreak = await calculateAndSaveStreak(userId);
    res.status(200).json({ logs, currentStreak });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch progress", details: error.message });
  }
};

export const updateProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: rawId } = req.params;
    const { problemTitle, problemUrl, difficulty } = req.body;
    const userId = String(req.user!.id); 
    
    if (!rawId || Array.isArray(rawId)) {
      res.status(400).json({ error: "Problem ID is required" });
      return;
    }

    const id = rawId;

    await db.update(dsaLogs).set({ problemTitle, problemUrl, difficulty })
      .where(and(eq(dsaLogs.id, id), eq(dsaLogs.userId, userId)));
      
    res.status(200).json({ message: "Problem updated successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update problem", details: error.message });
  }
};

export const deleteProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: rawId } = req.params;
    const userId = String(req.user!.id); 
    
    if (!rawId || Array.isArray(rawId)) {
      res.status(400).json({ error: "Problem ID is required" });
      return;
    }

    const id = rawId;

    await db.delete(dsaLogs).where(and(eq(dsaLogs.id, id), eq(dsaLogs.userId, userId)));
    const currentStreak = await calculateAndSaveStreak(userId);

    res.status(200).json({ message: "Problem deleted.", currentStreak });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete problem", details: error.message });
  }
};