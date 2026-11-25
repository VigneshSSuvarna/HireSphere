import { eq } from 'drizzle-orm';
import { profileUpdateSchema } from '@hiresphere/shared';
import { db } from '../../db/index.js';
import { studentProfiles, users } from '../../db/schema.js';
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [userRow] = await db
            .select({ id: users.id, email: users.email, role: users.role })
            .from(users)
            .where(eq(users.id, userId));
        if (!userRow) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const [profile] = await db
            .select()
            .from(studentProfiles)
            .where(eq(studentProfiles.userId, userId));
        res.json({
            user: userRow,
            profile: profile || {
                userId,
                fullName: userRow.email.split('@')[0],
                phone: '',
                bio: '',
                linkedin: '',
                github: '',
                department: 'CSE',
                cgpa: 0,
                graduationYear: 2026,
                skills: [],
                resumeUrl: '',
            },
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to load profile' });
    }
};
export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid profile data' });
            return;
        }
        const data = parsed.data;
        const [existing] = await db
            .select({ id: studentProfiles.id })
            .from(studentProfiles)
            .where(eq(studentProfiles.userId, userId));
        if (existing) {
            const [updated] = await db
                .update(studentProfiles)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where(eq(studentProfiles.userId, userId))
                .returning();
            res.json({ profile: updated });
            return;
        }
        const [created] = await db
            .insert(studentProfiles)
            .values({
            userId,
            ...data,
        })
            .returning();
        res.json({ profile: created });
    }
    catch {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
//# sourceMappingURL=profile.controller.js.map