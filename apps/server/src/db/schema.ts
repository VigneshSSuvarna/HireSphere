import { pgTable, pgEnum, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
export { db } from './index.js';

export const roleEnum = pgEnum('role', ['STUDENT', 'COORDINATOR', 'ADMIN']);
export const difficultyEnum = pgEnum('difficulty', ['EASY', 'MEDIUM', 'HARD']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: roleEnum('role').default('STUDENT').notNull(),
  streak: integer('streak').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const dsaLogs = pgTable('dsa_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  problemTitle: text('problem_title').notNull(),
  problemUrl: text('problem_url').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  category: text('category').default('General').notNull(),
  language: text('language').default('Python').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});
