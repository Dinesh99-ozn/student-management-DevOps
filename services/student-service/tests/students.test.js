// Tests for student-service: student CRUD, role authorization, and /health.
process.env.JWT_SECRET = 'test_secret';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

// Helper to build an Authorization header for a given role.
function tokenFor(role, linkedId = null) {
  return 'Bearer ' + jwt.sign({ id: 1, username: 'u', role, linkedId }, process.env.JWT_SECRET);
}

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe('student-service');
  });
});

describe('GET /api/students', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects requests with no token (401)', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(401);
  });

  it('rejects a student role (403) - role authorization', async () => {
    const res = await request(app).get('/api/students').set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(403);
  });

  it('allows admin to list students (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice Brown' }] });
    const res = await request(app).get('/api/students').set('Authorization', tokenFor('admin'));
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('allows teacher to list students (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/students').set('Authorization', tokenFor('teacher', 1));
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/students/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('a student cannot view another students profile (403)', async () => {
    const res = await request(app).get('/api/students/99').set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(403);
  });

  it('a student can view their own profile (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice Brown' }] });
    const res = await request(app).get('/api/students/1').set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for a missing student', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/students/999').set('Authorization', tokenFor('admin'));
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/students', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects non-admin (403)', async () => {
    const res = await request(app).post('/api/students').set('Authorization', tokenFor('teacher', 1)).send({});
    expect(res.statusCode).toBe(403);
  });

  it('rejects missing fields (400)', async () => {
    const fakeClient = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValueOnce(fakeClient);
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', tokenFor('admin'))
      .send({ username: 'x' });
    expect(res.statusCode).toBe(400);
  });

  it('creates a student successfully as admin (201)', async () => {
    const fakeClient = {
      query: jest.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // insert user
        .mockResolvedValueOnce({ rows: [{ id: 5, user_id: 10, name: 'New Student', email: 'n@e.com' }] }) // insert student
        .mockResolvedValueOnce({}), // COMMIT
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(fakeClient);

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', tokenFor('admin'))
      .send({ username: 'newstudent', password: 'pass123', name: 'New Student', email: 'n@e.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Student');
  });
});

describe('DELETE /api/students/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects non-admin (403)', async () => {
    const res = await request(app).delete('/api/students/1').set('Authorization', tokenFor('teacher', 1));
    expect(res.statusCode).toBe(403);
  });

  it('deletes successfully as admin (204)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 10 }] })
      .mockResolvedValueOnce({});
    const res = await request(app).delete('/api/students/1').set('Authorization', tokenFor('admin'));
    expect(res.statusCode).toBe(204);
  });
});
