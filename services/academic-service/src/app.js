const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendance');
const gradesRoutes = require('./routes/grades');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'academic-service' });
});

app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradesRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
