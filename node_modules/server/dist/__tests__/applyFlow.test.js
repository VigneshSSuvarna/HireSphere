import { describe, expect, it, vi, beforeEach } from 'vitest';
const whereQueue = [];
const whereMock = vi.fn(() => Promise.resolve(whereQueue.shift() ?? []));
const fromMock = vi.fn(() => ({ where: whereMock }));
const selectMock = vi.fn(() => ({ from: fromMock }));
const returningMock = vi.fn(() => Promise.resolve([{ id: 'app-1', status: 'APPLIED' }]));
const valuesMock = vi.fn(() => ({ returning: returningMock }));
const insertMock = vi.fn(() => ({ values: valuesMock }));
vi.mock('../db/index.js', () => ({
    db: {
        select: selectMock,
        insert: insertMock,
    },
}));
const { applyToDrive } = await import('../modules/applications/applications.controller.js');
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
describe('applyToDrive flow', () => {
    const futureDate = new Date(Date.now() + 86400000);
    beforeEach(() => {
        vi.clearAllMocks();
        whereQueue.length = 0;
    });
    it('rejects student when CGPA is below drive minimum', async () => {
        whereQueue.push([{ id: 'd1', status: 'OPEN', deadline: futureDate, minCgpa: 8.0, allowedDepartments: ['CSE'] }], [{ userId: 's1', cgpa: 7.2, department: 'CSE' }]);
        const req = { params: { id: 'd1' }, user: { id: 's1', role: 'STUDENT' } };
        const res = createMockRes();
        await applyToDrive(req, res);
        expect(res.statusCode).toBe(400);
    });
    it('rejects duplicate application with 409', async () => {
        whereQueue.push([{ id: 'd1', status: 'OPEN', deadline: futureDate, minCgpa: 7.0, allowedDepartments: ['CSE'] }], [{ userId: 's1', cgpa: 8.5, department: 'CSE' }], [{ id: 'existing-app' }]);
        const req = { params: { id: 'd1' }, user: { id: 's1', role: 'STUDENT' } };
        const res = createMockRes();
        await applyToDrive(req, res);
        expect(res.statusCode).toBe(409);
    });
    it('creates application when eligible and not already applied', async () => {
        whereQueue.push([{ id: 'd1', status: 'OPEN', deadline: futureDate, minCgpa: 7.0, allowedDepartments: ['CSE'] }], [{ userId: 's1', cgpa: 8.5, department: 'CSE' }], []);
        const req = { params: { id: 'd1' }, user: { id: 's1', role: 'STUDENT' } };
        const res = createMockRes();
        await applyToDrive(req, res);
        expect(res.statusCode).toBe(201);
        expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({ driveId: 'd1', studentId: 's1', status: 'APPLIED' }));
    });
});
//# sourceMappingURL=applyFlow.test.js.map