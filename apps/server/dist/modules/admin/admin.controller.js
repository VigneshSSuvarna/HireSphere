import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { updateActiveSchema, updateRoleSchema } from '@hiresphere/shared';
import { db } from '../../db/index.js';
import { auditLogs, users } from '../../db/schema.js';
import { writeAuditLog } from '../../utils/audit.js';
const uuidSchema = z.string().uuid('Invalid user ID');
export const listUsers = async (_req, res) => {
    try {
        const rows = await db
            .select({
            id: users.id,
            email: users.email,
            role: users.role,
            isActive: users.is_active,
            streak: users.streak,
            createdAt: users.created_at,
        })
            .from(users)
            .orderBy(desc(users.created_at));
        res.json({ users: rows });
    }
    catch {
        res.status(500).json({ error: 'Failed to list users' });
    }
};
export const changeUserRole = async (req, res) => {
    try {
        const idCheck = uuidSchema.safeParse(req.params.id);
        if (!idCheck.success) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const bodyCheck = updateRoleSchema.safeParse(req.body);
        if (!bodyCheck.success) {
            res.status(400).json({ error: bodyCheck.error.issues[0]?.message || 'Invalid role' });
            return;
        }
        const [updated] = await db
            .update(users)
            .set({ role: bodyCheck.data.role })
            .where(eq(users.id, idCheck.data))
            .returning({
            id: users.id,
            email: users.email,
            role: users.role,
            isActive: users.is_active,
        });
        if (!updated) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await writeAuditLog(req.user.id, 'USER_ROLE_UPDATED', 'users', {
            targetUserId: updated.id,
            newRole: updated.role,
        });
        res.json({ user: updated });
    }
    catch {
        res.status(500).json({ error: 'Failed to update user role' });
    }
};
export const setUserActive = async (req, res) => {
    try {
        const idCheck = uuidSchema.safeParse(req.params.id);
        if (!idCheck.success) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        if (idCheck.data === req.user.id) {
            res.status(400).json({ error: 'You cannot deactivate your own admin account' });
            return;
        }
        const bodyCheck = updateActiveSchema.safeParse(req.body);
        if (!bodyCheck.success) {
            res.status(400).json({ error: bodyCheck.error.issues[0]?.message || 'Invalid payload' });
            return;
        }
        const [updated] = await db
            .update(users)
            .set({ is_active: bodyCheck.data.isActive })
            .where(eq(users.id, idCheck.data))
            .returning({
            id: users.id,
            email: users.email,
            role: users.role,
            isActive: users.is_active,
        });
        if (!updated) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await writeAuditLog(req.user.id, bodyCheck.data.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'users', { targetUserId: updated.id });
        res.json({ user: updated });
    }
    catch {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
export const listAuditLogs = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
        const offset = (page - 1) * limit;
        const rows = await db
            .select({
            id: auditLogs.id,
            actorId: auditLogs.actorId,
            actorEmail: users.email,
            action: auditLogs.action,
            entity: auditLogs.entity,
            meta: auditLogs.meta,
            createdAt: auditLogs.createdAt,
        })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.actorId, users.id))
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ total }] = await db
            .select({ total: sql `count(*)::int` })
            .from(auditLogs);
        res.json({
            logs: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to load audit logs' });
    }
};
//# sourceMappingURL=admin.controller.js.map