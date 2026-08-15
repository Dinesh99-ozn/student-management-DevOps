// Routes for grade records. Same access pattern as attendance:
// teachers/admin manage grades, a student may only view their own.
const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/grades/student/:studentId - view grades for one student.
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.linkedId !== Number(studentId)) {
      return res.status(403).json({ error: 'You can only view your own grades' });
    }

    const result = await pool.query(
      'SELECT * FROM grades WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get grades error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/grades - list all grade records (admin + teacher only).
router.get('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grades ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('List grades error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/grades - teacher (or admin) records a grade for a student.
router.post('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, subject, term, grade } = req.body;

    if (!studentId || !subject || !term || !grade) {
      return res.status(400).json({ error: 'studentId, subject, term and grade are required' });
    }

    const markedBy = req.user.role === 'teacher' ? req.user.linkedId : null;

    const result = await pool.query(
      `INSERT INTO grades (student_id, subject, term, grade, marked_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studentId, subject, term, grade, markedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create grade error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/grades/:id - teacher/admin updates an existing grade.
router.put('/:id', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { grade } = req.body;

    if (!grade) {
      return res.status(400).json({ error: 'grade is required' });
    }

    const result = await pool.query(
      'UPDATE grades SET grade = $1 WHERE id = $2 RETURNING *',
      [grade, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade record not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update grade error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
