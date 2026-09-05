import { Response } from 'express';
import { db, dsaLogs } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard';

export const logProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { problemTitle, problemUrl, difficulty } = req.body;
    await db.insert(dsaLogs).values({
      userId: req.user.id,
      problemTitle,
      problemUrl,
      difficulty
    });
    res.status(201).json({ message: "Problem logged successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to log problem", details: error.message });
  }
};

export const getUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await db.select().from(dsaLogs)
      .where(eq(dsaLogs.userId, req.user.id))
      .orderBy(desc(dsaLogs.completedAt));

    let streak = 0;
    const uniqueDates = [...new Set(logs.map(log => 
      new Date(log.completedAt).toDateString()
    ))];

    let referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0); 

    for (let i = 0; i < uniqueDates.length; i++) {
      const logDate = new Date(uniqueDates[i]);
      logDate.setHours(0, 0, 0, 0); 
      
      const diffTime = Math.abs(referenceDate.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        if (streak === 0) streak = 1; 
      } else if (diffDays === 1) {
        streak++;
        referenceDate = logDate; 
      } else {
        break; 
      }
    }

    res.status(200).json({ logs, currentStreak: streak });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch progress", details: error.message });
  }
};

export const deleteProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: "Problem ID is required" });
      return;
    }

    await db.delete(dsaLogs).where(
      and(
        eq(dsaLogs.id, id), 
        eq(dsaLogs.userId, String(req.user!.id))
      )
    );

    res.status(200).json({ message: "Problem deleted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete problem", details: error.message });
  }
};