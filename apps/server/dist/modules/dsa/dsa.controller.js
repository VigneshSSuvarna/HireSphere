"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblem = exports.getUserProgress = exports.logProblem = void 0;
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logProblem = async (req, res) => {
    try {
        const { problemTitle, problemUrl, difficulty } = req.body;
        await schema_1.db.insert(schema_1.dsaLogs).values({
            userId: req.user.id,
            problemTitle,
            problemUrl,
            difficulty
        });
        res.status(201).json({ message: "Problem logged successfully!" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log problem", details: error.message });
    }
};
exports.logProblem = logProblem;
const getUserProgress = async (req, res) => {
    try {
        const logs = await schema_1.db.select().from(schema_1.dsaLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.dsaLogs.userId, req.user.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.dsaLogs.completedAt));
        let streak = 0;
        const uniqueDates = [...new Set(logs.map(log => new Date(log.completedAt).toDateString()))];
        let referenceDate = new Date();
        referenceDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < uniqueDates.length; i++) {
            const logDate = new Date(uniqueDates[i]);
            logDate.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(referenceDate.getTime() - logDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                if (streak === 0)
                    streak = 1;
            }
            else if (diffDays === 1) {
                streak++;
                referenceDate = logDate;
            }
            else {
                break;
            }
        }
        res.status(200).json({ logs, currentStreak: streak });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch progress", details: error.message });
    }
};
exports.getUserProgress = getUserProgress;
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            res.status(400).json({ error: "Problem ID is required" });
            return;
        }
        await schema_1.db.delete(schema_1.dsaLogs).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dsaLogs.id, id), (0, drizzle_orm_1.eq)(schema_1.dsaLogs.userId, String(req.user.id))));
        res.status(200).json({ message: "Problem deleted." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete problem", details: error.message });
    }
};
exports.deleteProblem = deleteProblem;
//# sourceMappingURL=dsa.controller.js.map