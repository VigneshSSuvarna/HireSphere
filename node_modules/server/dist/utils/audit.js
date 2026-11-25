import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
export async function writeAuditLog(actorId, action, entity, meta = {}) {
    await db.insert(auditLogs).values({
        actorId: actorId ?? null,
        action,
        entity,
        meta,
    });
}
//# sourceMappingURL=audit.js.map