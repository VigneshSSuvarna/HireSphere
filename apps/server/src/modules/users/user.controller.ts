import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { getJwtSecret, type AuthRequest } from '../../middleware/authGuard.js';

const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const updateRoleSchema = z.object({
  role: z.enum(['STUDENT', 'COORDINATOR', 'ADMIN']),
});

const uuidSchema = z.string().uuid('Invalid user ID');

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid registration payload',
      });
      return;
    }

    const { email, password } = parsed.data;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      email,
      password_hash: hashedPassword,
      role: 'STUDENT',
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error: unknown) {
    const pgErr = error as { code?: string; message?: string };
    if (pgErr.code === '23505') {
      res.status(400).json({ error: 'An account with this email already exists!' });
      return;
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid login payload',
      });
      return;
    }

    const { email, password } = parsed.data;
    const userResult = await db.select().from(users).where(eq(users.email, email));
    const user = userResult[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idCheck = uuidSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const bodyCheck = updateRoleSchema.safeParse(req.body);
    if (!bodyCheck.success) {
      res.status(400).json({
        error: bodyCheck.error.issues[0]?.message || 'Invalid role',
      });
      return;
    }

    const updated = await db
      .update(users)
      .set({ role: bodyCheck.data.role })
      .where(eq(users.id, idCheck.data))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
      });

    if (!updated[0]) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user: updated[0] });
  } catch {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};
