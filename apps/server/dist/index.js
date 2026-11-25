"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const schema_1 = require("./db/schema"); // ✅ Removed .js
const user_controller_1 = require("./modules/users/user.controller"); // ✅ Removed .js
const dsa_controller_1 = require("./modules/dsa/dsa.controller");
const authGuard_1 = require("./middleware/authGuard");
const drizzle_orm_1 = require("drizzle-orm");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Global Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''));
app.use((0, cors_1.default)({ origin: allowedOrigins }));
app.use(express_1.default.json());
// API Routes
app.post('/api/auth/register', user_controller_1.registerUser);
app.post('/api/auth/login', user_controller_1.loginUser);
// DSA Progress Routes
app.post('/api/dsa', authGuard_1.verifyToken, dsa_controller_1.logProblem);
app.get('/api/dsa', authGuard_1.verifyToken, dsa_controller_1.getUserProgress);
app.delete('/api/dsa/:id', authGuard_1.verifyToken, dsa_controller_1.deleteProblem);
// Current User Route
app.get('/api/auth/me', authGuard_1.verifyToken, async (req, res) => {
    try {
        const userResult = await schema_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            role: schema_1.users.role,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id));
        const user = userResult[0];
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`🚀 HireSphere server is live on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map