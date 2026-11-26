import type { Response } from 'express';
import { asc, eq, gte } from 'drizzle-orm';
import { createEventSchema, updateEventSchema } from '@hiresphere/shared';
import { db } from '../../db/index.js';
import { events } from '../../db/schema.js';
import type { AuthRequest } from '../../middleware/authGuard.js';
import { writeAuditLog } from '../../utils/audit.js';

export const listEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user!.role;
    const includePast = req.query.all === 'true' && (role === 'COORDINATOR' || role === 'ADMIN');

    const rows = includePast
      ? await db.select().from(events).orderBy(asc(events.startsAt))
      : await db
          .select()
          .from(events)
          .where(gte(events.endsAt, new Date()))
          .orderBy(asc(events.startsAt));

    res.json({ events: rows });
  } catch {
    res.status(500).json({ error: 'Failed to load events' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid event data' });
      return;
    }

    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (endsAt <= startsAt) {
      res.status(400).json({ error: 'Event end time must be after start time' });
      return;
    }

    const [created] = await db
      .insert(events)
      .values({
        title: parsed.data.title,
        type: parsed.data.type,
        startsAt,
        endsAt,
        driveId: parsed.data.driveId ?? null,
        createdBy: req.user!.id,
      })
      .returning();

    await writeAuditLog(req.user!.id, 'EVENT_CREATED', 'events', {
      eventId: created.id,
      title: created.title,
    });

    res.status(201).json({ event: created });
  } catch {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid event update' });
      return;
    }

    const payload: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) payload.title = parsed.data.title;
    if (parsed.data.type !== undefined) payload.type = parsed.data.type;
    if (parsed.data.startsAt !== undefined) payload.startsAt = new Date(parsed.data.startsAt);
    if (parsed.data.endsAt !== undefined) payload.endsAt = new Date(parsed.data.endsAt);
    if (parsed.data.driveId !== undefined) payload.driveId = parsed.data.driveId;

    const [updated] = await db.update(events).set(payload).where(eq(events.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    await writeAuditLog(req.user!.id, 'EVENT_UPDATED', 'events', { eventId: id });
    res.json({ event: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const [deleted] = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
    if (!deleted) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    await writeAuditLog(req.user!.id, 'EVENT_DELETED', 'events', { eventId: id });
    res.json({ message: 'Event deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
