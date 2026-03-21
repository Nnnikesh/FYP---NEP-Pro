const express = require('express');
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/bookings
// Hosts see their own bookings; vendors see bookings made for them; admin sees all
router.get('/', authenticate, async (req, res) => {
  const { role, id } = req.user;
  try {
    let query, params;

    if (role === 'admin') {
      query = `
        SELECT b.*, v.business_name, u.name AS host_name, u.email AS host_email
        FROM bookings b
        JOIN vendors v ON v.id = b.vendor_id
        JOIN users u ON u.id = b.host_id
        ORDER BY b.created_at DESC
      `;
      params = [];
    } else if (role === 'vendor') {
      query = `
        SELECT b.*, v.business_name, u.name AS host_name, u.email AS host_email, u.phone AS host_phone
        FROM bookings b
        JOIN vendors v ON v.id = b.vendor_id
        JOIN users u ON u.id = b.host_id
        WHERE v.user_id = $1
        ORDER BY b.created_at DESC
      `;
      params = [id];
    } else {
      // host
      query = `
        SELECT b.*, v.business_name, v.image_url AS vendor_image,
               u.name AS vendor_contact_name, u.email AS vendor_email, u.phone AS vendor_phone
        FROM bookings b
        JOIN vendors v ON v.id = b.vendor_id
        JOIN users u ON u.id = v.user_id
        WHERE b.host_id = $1
        ORDER BY b.created_at DESC
      `;
      params = [id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id — single booking detail
router.get('/:id', authenticate, async (req, res) => {
  const { role, id } = req.user;
  try {
    const result = await pool.query(`
      SELECT b.*, v.business_name, v.image_url AS vendor_image,
             vu.name AS vendor_contact_name, vu.email AS vendor_email, vu.phone AS vendor_phone,
             hu.name AS host_name, hu.email AS host_email, hu.phone AS host_phone
      FROM bookings b
      JOIN vendors v ON v.id = b.vendor_id
      JOIN users vu ON vu.id = v.user_id
      JOIN users hu ON hu.id = b.host_id
      WHERE b.id = $1
    `, [req.params.id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Booking not found.' });

    const booking = result.rows[0];

    // Access control: host sees own, vendor sees theirs, admin sees all
    if (role === 'host' && booking.host_id !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (role === 'vendor') {
      const vendorCheck = await pool.query(
        'SELECT id FROM vendors WHERE user_id = $1 AND id = $2', [id, booking.vendor_id]
      );
      if (vendorCheck.rowCount === 0) return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings — host creates a booking
router.post('/', authenticate, requireRole('host'), async (req, res) => {
  const { vendor_id, event_date, event_location, notes, agreed_amount } = req.body;

  if (!vendor_id || !event_date) {
    return res.status(400).json({ error: 'vendor_id and event_date are required.' });
  }

  try {
    // Check vendor exists and is approved
    const vendorCheck = await pool.query(
      `SELECT id FROM vendors WHERE id = $1 AND status = 'approved'`, [vendor_id]
    );
    if (vendorCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Vendor not found or not approved.' });
    }

    const result = await pool.query(
      `INSERT INTO bookings (host_id, vendor_id, event_date, event_location, notes, agreed_amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, vendor_id, event_date, event_location || null, notes || null, agreed_amount || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status — vendor confirms/cancels; host cancels; admin can set any
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  const { role, id } = req.user;

  const allowed = {
    admin:  ['pending', 'confirmed', 'cancelled', 'completed'],
    vendor: ['confirmed', 'cancelled', 'completed'],
    host:   ['cancelled'],
  };

  if (!allowed[role] || !allowed[role].includes(status)) {
    return res.status(400).json({ error: 'Invalid status or insufficient permission for this status.' });
  }

  try {
    // Fetch the booking
    const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (bookingRes.rowCount === 0) return res.status(404).json({ error: 'Booking not found.' });

    const booking = bookingRes.rows[0];

    // Vendor can only update bookings assigned to them
    if (role === 'vendor') {
      const vendorCheck = await pool.query(
        'SELECT id FROM vendors WHERE user_id = $1 AND id = $2', [id, booking.vendor_id]
      );
      if (vendorCheck.rowCount === 0) return res.status(403).json({ error: 'Access denied.' });
    }

    // Host can only cancel their own bookings
    if (role === 'host' && booking.host_id !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id — host updates booking details (before confirmation)
router.patch('/:id', authenticate, requireRole('host'), async (req, res) => {
  const { event_date, event_location, notes, agreed_amount } = req.body;

  try {
    const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1 AND host_id = $2', [req.params.id, req.user.id]);
    if (bookingRes.rowCount === 0) return res.status(404).json({ error: 'Booking not found.' });

    if (bookingRes.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be edited.' });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET event_date = COALESCE($1, event_date),
           event_location = COALESCE($2, event_location),
           notes = COALESCE($3, notes),
           agreed_amount = COALESCE($4, agreed_amount)
       WHERE id = $5 AND host_id = $6
       RETURNING *`,
      [event_date, event_location, notes, agreed_amount, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id — host deletes a pending booking; admin can delete any
router.delete('/:id', authenticate, async (req, res) => {
  const { role, id } = req.user;
  try {
    let result;
    if (role === 'admin') {
      result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [req.params.id]);
    } else if (role === 'host') {
      result = await pool.query(
        `DELETE FROM bookings WHERE id = $1 AND host_id = $2 AND status = 'pending' RETURNING id`,
        [req.params.id, id]
      );
    } else {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found or cannot be deleted.' });
    }
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
