import { asc, eq, gte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { applications, drives, dsaLogs, events, resumeScans, studentProfiles, users, } from '../../db/schema.js';
const ALL_APP_STATUSES = [
    'APPLIED',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'REJECTED',
];
function emptyAppCounts() {
    return {
        APPLIED: 0,
        SHORTLISTED: 0,
        INTERVIEW: 0,
        OFFERED: 0,
        REJECTED: 0,
    };
}
export const getStudentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const appRows = await db
            .select({
            status: applications.status,
            count: sql `count(*)::int`,
        })
            .from(applications)
            .where(eq(applications.studentId, userId))
            .groupBy(applications.status);
        const applicationsByStatus = emptyAppCounts();
        let totalApplications = 0;
        for (const row of appRows) {
            applicationsByStatus[row.status] = row.count;
            totalApplications += row.count;
        }
        const now = new Date();
        const upcomingEvents = await db
            .select({
            id: events.id,
            title: events.title,
            type: events.type,
            startsAt: events.startsAt,
            endsAt: events.endsAt,
        })
            .from(events)
            .where(gte(events.startsAt, now))
            .orderBy(asc(events.startsAt))
            .limit(5);
        const [atsAgg] = await db
            .select({
            avgScore: sql `ROUND(AVG(${resumeScans.score}))::int`,
        })
            .from(resumeScans)
            .where(eq(resumeScans.userId, userId));
        const [userRow] = await db
            .select({ streak: users.streak })
            .from(users)
            .where(eq(users.id, userId));
        const dsaRows = await db
            .select({
            difficulty: dsaLogs.difficulty,
            count: sql `count(*)::int`,
        })
            .from(dsaLogs)
            .where(eq(dsaLogs.userId, userId))
            .groupBy(dsaLogs.difficulty);
        const dsaCounts = { total: 0, easy: 0, medium: 0, hard: 0 };
        for (const r of dsaRows) {
            if (r.difficulty === 'EASY')
                dsaCounts.easy = r.count;
            if (r.difficulty === 'MEDIUM')
                dsaCounts.medium = r.count;
            if (r.difficulty === 'HARD')
                dsaCounts.hard = r.count;
            dsaCounts.total += r.count;
        }
        res.json({
            applicationsByStatus,
            totalApplications,
            upcomingEventsCount: upcomingEvents.length,
            upcomingEvents,
            avgAtsScore: atsAgg?.avgScore ?? null,
            dsaStreak: userRow?.streak ?? 0,
            dsaCounts,
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to load student stats' });
    }
};
export const getCoordinatorStats = async (_req, res) => {
    try {
        const driveRows = await db
            .select({
            status: drives.status,
            count: sql `count(*)::int`,
        })
            .from(drives)
            .groupBy(drives.status);
        let totalDrives = 0;
        let openDrives = 0;
        for (const d of driveRows) {
            totalDrives += d.count;
            if (d.status === 'OPEN')
                openDrives = d.count;
        }
        const appRows = await db
            .select({
            status: applications.status,
            count: sql `count(*)::int`,
        })
            .from(applications)
            .groupBy(applications.status);
        const funnel = emptyAppCounts();
        let totalApplicants = 0;
        for (const row of appRows) {
            if (ALL_APP_STATUSES.includes(row.status)) {
                funnel[row.status] = row.count;
                totalApplicants += row.count;
            }
        }
        res.json({
            openDrives,
            totalDrives,
            totalApplicants,
            funnel,
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to load coordinator stats' });
    }
};
export const getAdminStats = async (_req, res) => {
    try {
        const userRows = await db
            .select({
            role: users.role,
            count: sql `count(*)::int`,
        })
            .from(users)
            .groupBy(users.role);
        const usersByRole = {
            STUDENT: 0,
            COORDINATOR: 0,
            ADMIN: 0,
        };
        for (const u of userRows) {
            usersByRole[u.role] = u.count;
        }
        const driveRows = await db
            .select({
            status: drives.status,
            count: sql `count(*)::int`,
        })
            .from(drives)
            .groupBy(drives.status);
        let totalDrives = 0;
        let openDrives = 0;
        for (const d of driveRows) {
            totalDrives += d.count;
            if (d.status === 'OPEN')
                openDrives = d.count;
        }
        const [placedRow] = await db
            .select({
            count: sql `count(DISTINCT ${applications.studentId})::int`,
        })
            .from(applications)
            .where(eq(applications.status, 'OFFERED'));
        const deptRows = await db
            .select({
            department: studentProfiles.department,
            totalStudents: sql `count(DISTINCT ${studentProfiles.userId})::int`,
            placedStudents: sql `count(DISTINCT CASE WHEN ${applications.status} = 'OFFERED' THEN ${applications.studentId} END)::int`,
        })
            .from(studentProfiles)
            .leftJoin(applications, eq(studentProfiles.userId, applications.studentId))
            .groupBy(studentProfiles.department);
        const placementRateByDepartment = deptRows.map((d) => ({
            department: d.department || 'General',
            totalStudents: d.totalStudents,
            placedStudents: d.placedStudents,
            rate: d.totalStudents > 0 ? Math.round((d.placedStudents / d.totalStudents) * 100) : 0,
        }));
        res.json({
            usersByRole,
            totalDrives,
            openDrives,
            totalPlacements: placedRow?.count ?? 0,
            placementRateByDepartment,
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to load admin stats' });
    }
};
//# sourceMappingURL=stats.controller.js.map