"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dsaLogs = exports.users = exports.difficultyEnum = exports.roleEnum = exports.db = void 0;
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
const pg_core_1 = require("drizzle-orm/pg-core");
require("dotenv/config");
// 1. Establish the ONE connection
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
exports.db = (0, neon_http_1.drizzle)(sql);
// 2. Define the Enums
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['STUDENT', 'COORDINATOR', 'ADMIN']);
exports.difficultyEnum = (0, pg_core_1.pgEnum)('difficulty', ['EASY', 'MEDIUM', 'HARD']);
// 3. Define the Tables
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password_hash: (0, pg_core_1.text)('password_hash').notNull(),
    role: (0, exports.roleEnum)('role').default('STUDENT').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.dsaLogs = (0, pg_core_1.pgTable)('dsa_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    problemTitle: (0, pg_core_1.text)('problem_title').notNull(),
    problemUrl: (0, pg_core_1.text)('problem_url').notNull(),
    difficulty: (0, exports.difficultyEnum)('difficulty').notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map