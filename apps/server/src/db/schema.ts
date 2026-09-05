import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, pgEnum, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export const roleEnum = pgEnum('role', ['STUDENT', 'COORDINATOR', 'ADMIN']);
export const difficultyEnum = pgEnum('difficulty', ['EASY', 'MEDIUM', 'HARD']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: roleEnum('role').default('STUDENT').notNull(),
  streak: integer('streak').default(0).notNull(), // Automatically tracks the user's daily streak
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const dsaLogs = pgTable('dsa_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(), 
  problemTitle: text('problem_title').notNull(),
  problemUrl: text('problem_url').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});