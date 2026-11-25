import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireRole, verifyToken } from '../middleware/authGuard.js';
function createMockRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
}
describe('authGuard middleware', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test_secret_key_12345';
    });
    it('verifyToken returns 401 when Authorization header is missing', () => {
        const req = { headers: {} };
        const res = createMockRes();
        const next = vi.fn();
        verifyToken(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });
    it('verifyToken attaches decoded user and calls next for valid JWT', () => {
        const token = jwt.sign({ id: 'user-1', role: 'STUDENT' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        const next = vi.fn();
        verifyToken(req, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toMatchObject({ id: 'user-1', role: 'STUDENT' });
    });
    it('requireRole returns 403 when role is not allowed', () => {
        const req = { user: { id: 'u1', role: 'STUDENT' } };
        const res = createMockRes();
        const next = vi.fn();
        requireRole('ADMIN', 'COORDINATOR')(req, res, next);
        expect(res.statusCode).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });
    it('requireRole calls next when role is allowed', () => {
        const req = { user: { id: 'u2', role: 'COORDINATOR' } };
        const res = createMockRes();
        const next = vi.fn();
        requireRole('ADMIN', 'COORDINATOR')(req, res, next);
        expect(next).toHaveBeenCalledOnce();
    });
});
//# sourceMappingURL=authGuard.test.js.map