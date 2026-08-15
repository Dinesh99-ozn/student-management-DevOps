// CRUD routes for students. Creating a student also creates its login user account.
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/students - list all students (admin + teacher only)
router.get('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, user_id, name, email, dob, class FROM students ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('List students error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/:id - admin/teacher can view any student, a student may only view themselves.
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'student' && req.user.linkedId !== Number(id)) {
      return res.status(403).json({ error: 'You can only view your own profile' });
    }

    const result = await pool.query('SELECT id, user_id, name, email, dob, class FROM students WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get student error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/students - admin only. Creates a user (role=student) + student profile.
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, name, email, dob, class: className } = req.body;

    // Basic input validation
    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'username, password, name and email are required' });
    }

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (username, password_hash, role, full_name, email)
       VALUES ($1, $2, 'student', $3, $4) RETURNING id`,
      [username, passwordHash, name, email]
    );
    const userId = userResult.rows[0].id;

    const studentResult = await client.query(
      `INSERT INTO students (user_id, name, email, dob, class)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, name, email, dob, class`,
      [userId, name, email, dob || null, className || null]
    );

    await client.query('COMMIT');
    res.status(201).json(studentResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create student error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/students/:id - admin only. Updates student profile fields.
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, dob, class: className } = req.body;

    const result = await pool.query(
      `UPDATE students SET name = COALESCE($1, name), email = COALESCE($2, email),
       dob = COALESCE($3, dob), class = COALESCE($4, class) WHERE id = $5
       RETURNING id, user_id, name, email, dob, class`,
      [name, email, dob, className, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update student error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/students/:id - admin only. Deleting cascades to the linked user account.
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await pool.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (student.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Deleting the user cascades to the students row (ON DELETE CASCADE).
    await pool.query('DELETE FROM users WHERE id = $1', [student.rows[0].user_id]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete student error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
