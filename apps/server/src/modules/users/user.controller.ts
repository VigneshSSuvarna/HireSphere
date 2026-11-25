import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users } from '../../db/schema'; // ✅ Perfect import path
import { eq } from 'drizzle-orm';
import { JWT_SECRET } from '../../config';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      email,
      password_hash: hashedPassword,
      role: role || 'STUDENT'
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error: any) {
    console.error("❌ REGISTRATION ERROR:", error); 
    
    // 🔥 Added the smart handler for Duplicate Emails
    if (error.code === '23505') {
      res.status(400).json({ error: "An account with this email already exists!" });
      return;
    }

    res.status(500).json({ error: "Failed to register user", details: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const userResult = await db.select().from(users).where(eq(users.email, email));
    const user = userResult[0];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error("❌ LOGIN ERROR:", error); 
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};