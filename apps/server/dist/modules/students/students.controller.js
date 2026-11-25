import { and, asc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { studentProfiles, users } from '../../db/schema.js';
function buildStudentFilters(query) {
    const conditions = [eq(users.role, 'STUDENT')];
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    if (search) {
        conditions.push(or(ilike(users.email, `%${search}%`), ilike(studentProfiles.fullName, `%${search}%`)));
    }
    const department = typeof query.department === 'string' ? query.department.trim() : '';
    if (department && department.toUpperCase() !== 'ALL') {
        conditions.push(eq(studentProfiles.department, department));
    }
    const minCgpaRaw = typeof query.minCgpa === 'string' ? Number(query.minCgpa) : NaN;
    if (!Number.isNaN(minCgpaRaw) && minCgpaRaw > 0) {
        conditions.push(gte(studentProfiles.cgpa, minCgpaRaw));
    }
    const skillsRaw = typeof query.skills === 'string' ? query.skills.trim() : '';
    if (skillsRaw) {
        const skillList = skillsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        for (const skill of skillList) {
            conditions.push(sql `EXISTS (SELECT 1 FROM unnest(${studentProfiles.skills}) AS sk WHERE LOWER(sk) LIKE LOWER(${`%${skill}%`}))`);
        }
    }
    return and(...conditions);
}
export const listStudents = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const offset = (page - 1) * limit;
        const whereClause = buildStudentFilters(req.query);
        const rows = await db
            .select({
            id: users.id,
            email: users.email,
            isActive: users.is_active,
            streak: users.streak,
            fullName: studentProfiles.fullName,
            department: studentProfiles.department,
            cgpa: studentProfiles.cgpa,
            graduationYear: studentProfiles.graduationYear,
            skills: studentProfiles.skills,
            phone: studentProfiles.phone,
            linkedin: studentProfiles.linkedin,
            github: studentProfiles.github,
        })
            .from(users)
            .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
            .where(whereClause)
            .orderBy(asc(studentProfiles.fullName), asc(users.email))
            .limit(limit)
            .offset(offset);
        const [{ total }] = await db
            .select({ total: sql `count(*)::int` })
            .from(users)
            .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
            .where(whereClause);
        res.json({
            students: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to list students' });
    }
};
function csvEscape(val) {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
export const exportStudentsCsv = async (req, res) => {
    try {
        const whereClause = buildStudentFilters(req.query);
        const rows = await db
            .select({
            email: users.email,
            fullName: studentProfiles.fullName,
            department: studentProfiles.department,
            cgpa: studentProfiles.cgpa,
            graduationYear: studentProfiles.graduationYear,
            skills: studentProfiles.skills,
            phone: studentProfiles.phone,
            streak: users.streak,
        })
            .from(users)
            .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
            .where(whereClause)
            .orderBy(asc(studentProfiles.fullName), asc(users.email));
        const header = ['Full Name', 'Email', 'Department', 'CGPA', 'Graduation Year', 'Skills', 'Phone', 'DSA Streak'].join(',');
        const lines = rows.map((r) => [
            csvEscape(r.fullName || ''),
            csvEscape(r.email),
            csvEscape(r.department || ''),
            csvEscape(r.cgpa ?? 0),
            csvEscape(r.graduationYear ?? ''),
            csvEscape((r.skills || []).join('; ')),
            csvEscape(r.phone || ''),
            csvEscape(r.streak),
        ].join(','));
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
        res.send([header, ...lines].join('\n'));
    }
    catch {
        res.status(500).json({ error: 'Failed to export students CSV' });
    }
};
//# sourceMappingURL=students.controller.js.map