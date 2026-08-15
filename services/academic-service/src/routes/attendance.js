// Routes for attendance records.
// Teachers mark/update attendance; admin + teacher can view any student's records;
// a student may only view their own.
const express = require('express');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance/student/:studentId - view attendance history for one student.
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.linkedId !== Number(studentId)) {
      return res.status(403).json({ error: 'You can only view your own attendance' });
    }

    const result = await pool.query(
      'SELECT * FROM attendance WHERE student_id = $1 ORDER BY date DESC',
      [studentId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get attendance error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attendance - list all attendance records (admin + teacher only).
router.get('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendance ORDER BY date DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('List attendance error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/attendance - teacher (or admin) marks attendance for a student on a date.
// Uses ON CONFLICT to upsert (one record per student per date).
router.post('/', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ error: 'studentId, date and status are required' });
    }
    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'status must be present, absent or late' });
    }

    const markedBy = req.user.role === 'teacher' ? req.user.linkedId : null;

    const result = await pool.query(
      `INSERT INTO attendance (student_id, date, status, marked_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by
       RETURNING *`,
      [studentId, date, status, markedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Mark attendance error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/attendance/:id - teacher/admin updates an existing attendance record's status.
router.put('/:id', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'A valid status is required' });
    }

    const result = await pool.query(
      'UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update attendance error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
