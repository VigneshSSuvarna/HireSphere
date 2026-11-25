import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { resumeScans } from '../../db/schema.js';
import { extractTextFromPdf } from '../../utils/pdfParser.js';
import { scoreResumeText } from '../../utils/atsScorer.js';
export const scanResume = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Please upload a PDF resume file (field name: resume).' });
            return;
        }
        const jobDescription = typeof req.body?.jobDescription === 'string' && req.body.jobDescription.trim()
            ? req.body.jobDescription.trim()
            : null;
        let extractedText = '';
        try {
            extractedText = await extractTextFromPdf(file.buffer);
        }
        catch {
            res.status(400).json({ error: 'Could not parse PDF. Please upload a valid, unencrypted PDF file.' });
            return;
        }
        if (!extractedText || extractedText.length < 20) {
            res.status(400).json({
                error: 'No selectable text found in the PDF. Please export a text-based PDF rather than a scanned image.',
            });
            return;
        }
        const result = scoreResumeText(extractedText, jobDescription);
        const storedBreakdown = {
            ...result.breakdown,
            suggestions: result.suggestions,
        };
        const [saved] = await db
            .insert(resumeScans)
            .values({
            userId: req.user.id,
            fileName: file.originalname,
            score: result.score,
            breakdown: storedBreakdown,
            jobDescription,
        })
            .returning();
        res.status(201).json({
            scan: {
                id: saved.id,
                fileName: saved.fileName,
                score: saved.score,
                breakdown: result.breakdown,
                suggestions: result.suggestions,
                jobDescription: saved.jobDescription,
                createdAt: saved.createdAt,
            },
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to scan resume' });
    }
};
export const getMyResumeScans = async (req, res) => {
    try {
        const rows = await db
            .select()
            .from(resumeScans)
            .where(eq(resumeScans.userId, req.user.id))
            .orderBy(desc(resumeScans.createdAt))
            .limit(20);
        const scans = rows.map((row) => {
            const raw = row.breakdown;
            const suggestions = Array.isArray(raw.suggestions) ? raw.suggestions : [];
            const { suggestions: _s, ...breakdown } = raw;
            return {
                id: row.id,
                fileName: row.fileName,
                score: row.score,
                breakdown,
                suggestions,
                jobDescription: row.jobDescription,
                createdAt: row.createdAt,
            };
        });
        res.json({ scans });
    }
    catch {
        res.status(500).json({ error: 'Failed to load resume scan history' });
    }
};
//# sourceMappingURL=resume.controller.js.map