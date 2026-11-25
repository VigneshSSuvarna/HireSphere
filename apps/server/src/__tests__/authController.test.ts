import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const insertValuesMock = vi.fn().mockResolvedValue(undefined);
const insertMock = vi.fn(() => ({ values: insertValuesMock }));
const whereMock = vi.fn();
const fromMock = vi.fn(() => ({ where: whereMock }));
const selectMock = vi.fn(() => ({ from: fromMock }));

vi.mock('../db/index.js', () => ({
  db: {
    insert: insertMock,
    select: selectMock,
  },
}));

const { registerUser, loginUser } = await import('../modules/users/user.controller.js');

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret_key_12345';
  });

  it('registerUser always forces STUDENT role even when ADMIN is passed', async () => {
    const req = {
      body: {
        email: 'hacker@test.edu',
        password: 'Password123!',
        role: 'ADMIN',
      },
    } as Request;
    const res = createMockRes();

    await registerUser(req, res);

    expect(res.statusCode).toBe(201);
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'hacker@test.edu',
        role: 'STUDENT',
      })
    );
  });

  it('loginUser rejects deactivated accounts with 403', async () => {
    whereMock.mockResolvedValueOnce([
      {
        id: 'u-1',
        email: 'inactive@test.edu',
        password_hash: 'hash',
        role: 'STUDENT',
        is_active: false,
      },
    ]);

    const req = {
      body: { email: 'inactive@test.edu', password: 'Password123!' },
    } as Request;
    const res = createMockRes();

    await loginUser(req, res);
    expect(res.statusCode).toBe(403);
  });
});
