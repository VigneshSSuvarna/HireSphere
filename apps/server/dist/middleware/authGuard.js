"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCoordinator = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
// Interceptor 1: Checks if they are logged in at all
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Gets token from "Bearer <token>"
    if (!token)
        return res.status(401).json({ error: "Access Denied. No VIP pass." });
    try {
        const verified = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.user = verified; // Attach the decoded token info to the request
        next(); // Let them pass
    }
    catch (error) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
};
exports.verifyToken = verifyToken;
// Interceptor 2: Checks if they are a Coordinator
const isCoordinator = (req, res, next) => {
    if (req.user && req.user.role === 'COORDINATOR') {
        next(); // Let them pass
    }
    else {
        res.status(403).json({ error: "Access Denied. Coordinators only." });
    }
};
exports.isCoordinator = isCoordinator;
//# sourceMappingURL=authGuard.js.map