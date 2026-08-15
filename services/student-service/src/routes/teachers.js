// CRUD routes for teachers. Admin-only for write operations.
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/teachers - admin only (student-service keeps teacher management private to admin).
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, user_id, name, email, subject FROM teachers ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('List teachers error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/teachers/:id - admin, or the teacher viewing their own record.
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'teacher' && req.user.linkedId !== Number(id)) {
      return res.status(403).json({ error: 'You can only view your own profile' });
    }
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await pool.query('SELECT id, user_id, name, email, subject FROM teachers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get teacher error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/teachers - admin only. Creates a user (role=teacher) + teacher profile.
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, name, email, subject } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'username, password, name and email are required' });
    }

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (username, password_hash, role, full_name, email)
       VALUES ($1, $2, 'teacher', $3, $4) RETURNING id`,
      [username, passwordHash, name, email]
    );
    const userId = userResult.rows[0].id;

    const teacherResult = await client.query(
      `INSERT INTO teachers (user_id, name, email, subject)
       VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, email, subject`,
      [userId, name, email, subject || null]
    );

    await client.query('COMMIT');
    res.status(201).json(teacherResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create teacher error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/teachers/:id - admin only.
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject } = req.body;

    const result = await pool.query(
      `UPDATE teachers SET name = COALESCE($1, name), email = COALESCE($2, email),
       subject = COALESCE($3, subject) WHERE id = $4
       RETURNING id, user_id, name, email, subject`,
      [name, email, subject, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update teacher error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/teachers/:id - admin only. Cascades to the linked user account.
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await pool.query('SELECT user_id FROM teachers WHERE id = $1', [id]);
    if (teacher.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [teacher.rows[0].user_id]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete teacher error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
