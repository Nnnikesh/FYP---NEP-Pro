const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const vendorRoutes  = require('./routes/vendors');
const adminRoutes   = require('./routes/admin');
const supportRoutes = require('./routes/support');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes  = require('./routes/reviews');
const paymentRoutes = require('./routes/payment');

const pool = require('./db');
const app = express();

// Auto-migrate: add password reset columns if they don't exist
pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
`).catch(err => console.error('Migration error:', err.message));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Serve uploaded vendor photos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NEP-Pro API' });
});

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/vendors',  vendorRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/support',  supportRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payment',  paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
