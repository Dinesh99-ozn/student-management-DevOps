// Express app setup for auth-service (separated from server.js so tests can import it without listening on a port).
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny')); // simple request logging

// Health check endpoint - used by Docker/Elastic Beanstalk to verify the service is alive.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

app.use('/api/auth', authRoutes);

// Centralized error handler - catches anything thrown/passed to next().
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
