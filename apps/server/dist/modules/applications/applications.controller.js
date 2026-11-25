import { and, desc, eq } from 'drizzle-orm';
import { updateApplicationStatusSchema } from '@hiresphere/shared';
import { db } from '../../db/index.js';
import { applications, companies, drives, studentProfiles, users } from '../../db/schema.js';
import { writeAuditLog } from '../../utils/audit.js';
export const applyToDrive = async (req, res) => {
    try {
        const driveId = String(req.params.id || '');
        const studentId = req.user.id;
        const [drive] = await db.select().from(drives).where(eq(drives.id, driveId));
        if (!drive) {
            res.status(404).json({ error: 'Drive not found' });
            return;
        }
        if (drive.status !== 'OPEN') {
            res.status(400).json({ error: 'This drive is no longer accepting applications' });
            return;
        }
        if (new Date(drive.deadline).getTime() < Date.now()) {
            res.status(400).json({ error: 'Application deadline has passed' });
            return;
        }
        const [profile] = await db
            .select()
            .from(studentProfiles)
            .where(eq(studentProfiles.userId, studentId));
        if (!profile) {
            res.status(400).json({ error: 'Please complete your profile (CGPA and department) before applying' });
            return;
        }
        if (profile.cgpa < drive.minCgpa) {
            res.status(400).json({ error: `Minimum CGPA required is ${drive.minCgpa}` });
            return;
        }
        if (drive.allowedDepartments.length > 0 &&
            !drive.allowedDepartments.map((d) => d.toUpperCase()).includes(profile.department.toUpperCase())) {
            res.status(400).json({
                error: `This drive is restricted to: ${drive.allowedDepartments.join(', ')}`,
            });
            return;
        }
        const [existing] = await db
            .select({ id: applications.id })
            .from(applications)
            .where(and(eq(applications.driveId, driveId), eq(applications.studentId, studentId)));
        if (existing) {
            res.status(409).json({ error: 'You have already applied to this drive' });
            return;
        }
        const [created] = await db
            .insert(applications)
            .values({
            driveId,
            studentId,
            status: 'APPLIED',
        })
            .returning();
        res.status(201).json({ application: created });
    }
    catch {
        res.status(500).json({ error: 'Failed to submit application' });
    }
};
export const getMyApplications = async (req, res) => {
    try {
        const studentId = req.user.id;
        const rows = await db
            .select({
            id: applications.id,
            driveId: applications.driveId,
            status: applications.status,
            appliedAt: applications.appliedAt,
            roleTitle: drives.roleTitle,
            packageLpa: drives.packageLpa,
            location: drives.location,
            deadline: drives.deadline,
            companyName: companies.name,
        })
            .from(applications)
            .innerJoin(drives, eq(applications.driveId, drives.id))
            .innerJoin(companies, eq(drives.companyId, companies.id))
            .where(eq(applications.studentId, studentId))
            .orderBy(desc(applications.appliedAt));
        res.json({ applications: rows });
    }
    catch {
        res.status(500).json({ error: 'Failed to load applications' });
    }
};
export const getDriveApplications = async (req, res) => {
    try {
        const driveId = String(req.params.id || '');
        const rows = await db
            .select({
            id: applications.id,
            driveId: applications.driveId,
            studentId: applications.studentId,
            status: applications.status,
            appliedAt: applications.appliedAt,
            email: users.email,
            fullName: studentProfiles.fullName,
            department: studentProfiles.department,
            cgpa: studentProfiles.cgpa,
            skills: studentProfiles.skills,
        })
            .from(applications)
            .innerJoin(users, eq(applications.studentId, users.id))
            .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
            .where(eq(applications.driveId, driveId))
            .orderBy(desc(applications.appliedAt));
        res.json({ applications: rows });
    }
    catch {
        res.status(500).json({ error: 'Failed to load drive applicants' });
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        const id = String(req.params.id || '');
        const parsed = updateApplicationStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid status' });
            return;
        }
        const [updated] = await db
            .update(applications)
            .set({ status: parsed.data.status })
            .where(eq(applications.id, id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }
        await writeAuditLog(req.user.id, 'APPLICATION_STATUS_UPDATED', 'applications', {
            applicationId: id,
            newStatus: parsed.data.status,
            driveId: updated.driveId,
            studentId: updated.studentId,
        });
        res.json({ application: updated });
    }
    catch {
        res.status(500).json({ error: 'Failed to update application status' });
    }
};
//# sourceMappingURL=applications.controller.js.map