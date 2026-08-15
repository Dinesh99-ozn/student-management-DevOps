// Login and current-user routes.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
// Verifies credentials and issues a JWT containing id, role and linkedId
// (linkedId = students.id or teachers.id, used by other services).
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare plain-text password against the stored bcrypt hash.
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Look up the linked student/teacher id (students & teachers only see their own data).
    let linkedId = null;
    if (user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [user.id]);
      linkedId = s.rows[0]?.id || null;
    } else if (user.role === 'teacher') {
      const t = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [user.id]);
      linkedId = t.rows[0]?.id || null;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.full_name, linkedId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name, linkedId },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - returns the currently authenticated user (from JWT).
router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
