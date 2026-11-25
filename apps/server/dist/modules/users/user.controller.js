"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema_1 = require("../../db/schema"); // ✅ Perfect import path
const drizzle_orm_1 = require("drizzle-orm");
const config_1 = require("../../config");
const registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        await schema_1.db.insert(schema_1.users).values({
            email,
            password_hash: hashedPassword,
            role: role || 'STUDENT'
        });
        res.status(201).json({ message: "User registered successfully!" });
    }
    catch (error) {
        console.error("❌ REGISTRATION ERROR:", error);
        // 🔥 Added the smart handler for Duplicate Emails
        if (error.code === '23505') {
            res.status(400).json({ error: "An account with this email already exists!" });
            return;
        }
        res.status(500).json({ error: "Failed to register user", details: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await schema_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        const user = userResult[0];
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, config_1.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error("❌ LOGIN ERROR:", error);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=user.controller.js.map