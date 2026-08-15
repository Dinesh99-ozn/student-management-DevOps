// Tests for auth-service: login success/failure and /health.
// The Postgres pool is mocked so tests run without a real database.
process.env.JWT_SECRET = 'test_secret';

jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const pool = require('../src/db');
const app = require('../src/app');

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/login', () => {
  const hashed = bcrypt.hashSync('password123', 10);
  const fakeUser = {
    id: 1,
    username: 'testadmin',
    password_hash: hashed,
    role: 'admin',
    full_name: 'Test Admin',
  };

  afterEach(() => jest.clearAllMocks());

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'a' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects unknown user with 401', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/auth/login').send({ username: 'nouser', password: 'x' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects wrong password with 401', async () => {
    pool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('logs in successfully and returns a token', async () => {
    pool.query.mockResolvedValueOnce({ rows: [fakeUser] }); // user lookup
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });
});
