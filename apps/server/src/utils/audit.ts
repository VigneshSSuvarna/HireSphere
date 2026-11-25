import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';

export async function writeAuditLog(
  actorId: string | null | undefined,
  action: string,
  entity: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  await db.insert(auditLogs).values({
    actorId: actorId ?? null,
    action,
    entity,
    meta,
  });
}
