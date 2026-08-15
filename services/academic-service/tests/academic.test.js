// Tests for academic-service: attendance, grades, role authorization, /health.
process.env.JWT_SECRET = 'test_secret';

jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/db');
const app = require('../src/app');

function tokenFor(role, linkedId = null) {
  return 'Bearer ' + jwt.sign({ id: 1, username: 'u', role, linkedId }, process.env.JWT_SECRET);
}

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe('academic-service');
  });
});

describe('Attendance', () => {
  afterEach(() => jest.clearAllMocks());

  it('a student cannot view another students attendance (403)', async () => {
    const res = await request(app)
      .get('/api/attendance/student/2')
      .set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(403);
  });

  it('a student can view their own attendance (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'present' }] });
    const res = await request(app)
      .get('/api/attendance/student/1')
      .set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(200);
  });

  it('rejects a student from marking attendance (403) - role authorization', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', tokenFor('student', 1))
      .send({ studentId: 1, date: '2026-08-01', status: 'present' });
    expect(res.statusCode).toBe(403);
  });

  it('rejects invalid status (400)', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', tokenFor('teacher', 1))
      .send({ studentId: 1, date: '2026-08-01', status: 'bogus' });
    expect(res.statusCode).toBe(400);
  });

  it('teacher can mark attendance (201)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, student_id: 1, status: 'present' }] });
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', tokenFor('teacher', 1))
      .send({ studentId: 1, date: '2026-08-01', status: 'present' });
    expect(res.statusCode).toBe(201);
  });
});

describe('Grades', () => {
  afterEach(() => jest.clearAllMocks());

  it('a student can view their own grades (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, subject: 'Maths', grade: 'A' }] });
    const res = await request(app)
      .get('/api/grades/student/1')
      .set('Authorization', tokenFor('student', 1));
    expect(res.statusCode).toBe(200);
  });

  it('rejects missing fields when creating a grade (400)', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', tokenFor('teacher', 1))
      .send({ studentId: 1 });
    expect(res.statusCode).toBe(400);
  });

  it('teacher can add a grade (201)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, subject: 'Maths', grade: 'A' }] });
    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', tokenFor('teacher', 1))
      .send({ studentId: 1, subject: 'Maths', term: 'Term 1', grade: 'A' });
    expect(res.statusCode).toBe(201);
  });

  it('admin can list all grades (200)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/grades').set('Authorization', tokenFor('admin'));
    expect(res.statusCode).toBe(200);
  });
});
