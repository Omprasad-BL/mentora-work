const express = require('express');
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/students', require('./routes/student.routes'));
app.use('/lessons', require('./routes/lesson.routes'));
app.use('/bookings', require('./routes/booking.routes'));
app.use('/sessions', require('./routes/session.routes'));
app.use('/llm', require('./routes/llm.routes'));

// Top-level /me alias
const { authenticate } = require('./middleware/auth.middleware');
const { getMe } = require('./controllers/auth.controller');
app.get('/me', authenticate, getMe);

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
