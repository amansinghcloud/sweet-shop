require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { initDB } = require('./config/db');
const seedData = require('./config/seed');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Static Frontend Files from Workspace Root
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(rootDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Madhuraj Sweet House REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Fallback for HTML routes (SPA / Multi-page friendly)
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server & Auto-seed if needed
const startServer = async () => {
  try {
    await initDB();
    await seedData();

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`
🍬 =================================================== 🍬
   Madhuraj Sweet House - Full Stack E-commerce Ready!
   API running at: http://localhost:${PORT}/api
   Frontend at:    http://localhost:${PORT}
   Admin Portal:   http://localhost:${PORT}/admin.html
🍬 =================================================== 🍬
        `);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
