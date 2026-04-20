const express = require('express');
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [users, vendors, pendingVendors, bookings, photos, unreadSupport] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role != 'admin'`),
      pool.query(`SELECT COUNT(*) FROM vendors WHERE status = 'approved'`),
      pool.query(`SELECT COUNT(*) FROM vendors WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM bookings`),
      pool.query(`SELECT COUNT(*) FROM vendor_photos`),
      pool.query(`SELECT COUNT(*) FROM support_messages WHERE is_read = FALSE`),
    ]);

    res.json({
      totalUsers:        parseInt(users.rows[0].count),
      totalVendors:      parseInt(vendors.rows[0].count),
      pendingApprovals:  parseInt(pendingVendors.rows[0].count),
      totalBookings:     parseInt(bookings.rows[0].count),
      totalPhotos:       parseInt(photos.rows[0].count),
      unreadSupport:     parseInt(unreadSupport.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/vendors', async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT v.id, v.business_name, v.location, v.status, v.rating, v.total_reviews,
             v.submitted_at, v.approved_at, v.is_verified,
             u.name, u.email, u.phone,
             ARRAY_AGG(DISTINCT vs.specialization) FILTER (WHERE vs.specialization IS NOT NULL) AS specializations
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      LEFT JOIN vendor_specializations vs ON vs.vendor_id = v.id
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE v.status = $1`;
    }
    query += ` GROUP BY v.id, u.name, u.email, u.phone ORDER BY v.submitted_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, v.business_name, u.name AS host_name, u.email AS host_email
      FROM bookings b
      JOIN vendors v ON v.id = b.vendor_id
      JOIN users u ON u.id = b.host_id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active`,
      [is_active, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/photos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vp.id, vp.photo_url, vp.caption, vp.event_type, vp.subcategory, vp.created_at,
             v.business_name, v.id AS vendor_id
      FROM vendor_photos vp
      JOIN vendors v ON v.id = vp.vendor_id
      ORDER BY vp.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
