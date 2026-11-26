import type { Response } from 'express';
import { desc, eq, sql } from 'drizzle-orm';
import { createCompanySchema, createDriveSchema, updateDriveSchema } from '@hiresphere/shared';
import { db } from '../../db/index.js';
import { applications, companies, drives, studentProfiles } from '../../db/schema.js';
import type { AuthRequest } from '../../middleware/authGuard.js';
import { writeAuditLog } from '../../utils/audit.js';

export const listCompanies = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(companies).orderBy(companies.name);
    res.json({ companies: rows });
  } catch {
    res.status(500).json({ error: 'Failed to load companies' });
  }
};

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid company payload' });
      return;
    }

    const [created] = await db.insert(companies).values(parsed.data).returning();
    res.status(201).json({ company: created });
  } catch (error: unknown) {
    const pgErr = error as { code?: string };
    if (pgErr.code === '23505') {
      res.status(400).json({ error: 'A company with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create company' });
  }
};

export const listDrives = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const rows = await db
      .select({
        id: drives.id,
        companyId: drives.companyId,
        companyName: companies.name,
        companyWebsite: companies.website,
        roleTitle: drives.roleTitle,
        description: drives.description,
        packageLpa: drives.packageLpa,
        location: drives.location,
        minCgpa: drives.minCgpa,
        allowedDepartments: drives.allowedDepartments,
        deadline: drives.deadline,
        status: drives.status,
        createdAt: drives.createdAt,
      })
      .from(drives)
      .innerJoin(companies, eq(drives.companyId, companies.id))
      .orderBy(desc(drives.createdAt));

    if (user.role === 'STUDENT') {
      const [profile] = await db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, user.id));

      const myApps = await db
        .select({
          driveId: applications.driveId,
          status: applications.status,
          id: applications.id,
        })
        .from(applications)
        .where(eq(applications.studentId, user.id));

      const appMap = new Map(myApps.map((a) => [a.driveId, a]));

      const openDrives = rows
        .filter((d) => d.status === 'OPEN')
        .map((d) => {
          const app = appMap.get(d.id);
          const cgpa = profile?.cgpa ?? 0;
          const dept = profile?.department ?? '';
          const reasons: string[] = [];

          if (!profile) {
            reasons.push('Complete your profile (CGPA & department) to check eligibility');
          } else {
            if (cgpa < d.minCgpa) {
              reasons.push(`Requires CGPA >= ${d.minCgpa} (yours: ${cgpa})`);
            }
            if (
              d.allowedDepartments.length > 0 &&
              !d.allowedDepartments.map((x) => x.toUpperCase()).includes(dept.toUpperCase())
            ) {
              reasons.push(`Restricted to ${d.allowedDepartments.join(', ')}`);
            }
          }

          if (new Date(d.deadline).getTime() < Date.now()) {
            reasons.push('Application deadline has passed');
          }

          return {
            ...d,
            eligible: reasons.length === 0,
            ineligibilityReason: reasons[0] || null,
            applied: Boolean(app),
            applicationStatus: app?.status || null,
          };
        });

      res.json({ drives: openDrives });
      return;
    }

    // Coordinator / Admin: include applicant count per drive
    const counts = await db
      .select({
        driveId: applications.driveId,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .groupBy(applications.driveId);

    const countMap = new Map(counts.map((c) => [c.driveId, c.count]));
    const enriched = rows.map((d) => ({
      ...d,
      applicantCount: countMap.get(d.id) ?? 0,
    }));

    res.json({ drives: enriched });
  } catch {
    res.status(500).json({ error: 'Failed to load drives' });
  }
};

export const createDrive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createDriveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid drive data' });
      return;
    }

    const data = parsed.data;
    let companyId = data.companyId;

    if (!companyId && data.companyName) {
      const existing = await db
        .select()
        .from(companies)
        .where(eq(companies.name, data.companyName));
      if (existing[0]) {
        companyId = existing[0].id;
      } else {
        const [newCompany] = await db
          .insert(companies)
          .values({ name: data.companyName })
          .returning();
        companyId = newCompany.id;
      }
    }

    if (!companyId) {
      res.status(400).json({ error: 'Either companyId or companyName is required' });
      return;
    }

    const [created] = await db
      .insert(drives)
      .values({
        companyId,
        roleTitle: data.roleTitle,
        description: data.description,
        packageLpa: data.packageLpa,
        location: data.location,
        minCgpa: data.minCgpa,
        allowedDepartments: data.allowedDepartments,
        deadline: new Date(data.deadline),
        status: data.status,
        createdBy: req.user!.id,
      })
      .returning();

    await writeAuditLog(req.user!.id, 'DRIVE_CREATED', 'drives', {
      driveId: created.id,
      roleTitle: created.roleTitle,
    });

    res.status(201).json({ drive: created });
  } catch {
    res.status(500).json({ error: 'Failed to create drive' });
  }
};

export const updateDrive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const parsed = updateDriveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid drive update' });
      return;
    }

    const data = parsed.data;
    const updatePayload: Record<string, unknown> = {};
    if (data.companyId !== undefined) updatePayload.companyId = data.companyId;
    if (data.roleTitle !== undefined) updatePayload.roleTitle = data.roleTitle;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.packageLpa !== undefined) updatePayload.packageLpa = data.packageLpa;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.minCgpa !== undefined) updatePayload.minCgpa = data.minCgpa;
    if (data.allowedDepartments !== undefined) updatePayload.allowedDepartments = data.allowedDepartments;
    if (data.deadline !== undefined) updatePayload.deadline = new Date(data.deadline);
    if (data.status !== undefined) updatePayload.status = data.status;

    const [updated] = await db
      .update(drives)
      .set(updatePayload)
      .where(eq(drives.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Drive not found' });
      return;
    }

    await writeAuditLog(req.user!.id, 'DRIVE_UPDATED', 'drives', { driveId: id });
    res.json({ drive: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update drive' });
  }
};

export const deleteDrive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const [deleted] = await db.delete(drives).where(eq(drives.id, id)).returning({ id: drives.id });
    if (!deleted) {
      res.status(404).json({ error: 'Drive not found' });
      return;
    }

    await writeAuditLog(req.user!.id, 'DRIVE_DELETED', 'drives', { driveId: id });
    res.json({ message: 'Drive deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete drive' });
  }
};
