const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const eventRoutes = require('./routes/events');
const emailRoutes = require('./routes/email');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    // Allow localhost, configured FRONTEND_URL, or any *.vercel.app deployment
    const allowed = process.env.FRONTEND_URL;
    if (!allowed || allowed === '*' || allowed === origin || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true); // fallback permissive for student/demo hosting
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev) ─────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/employees', '/employees'], employeeRoutes);
app.use(['/api/events', '/events'], eventRoutes);
app.use(['/api/email', '/email'], emailRoutes);
app.use(['/api/logs', '/logs'], logRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    success: true,
    message: 'AI Email Automation API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log('   AI Email Automation Backend Server');
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════ 🚀');
  console.log('');
});

module.exports = app;
