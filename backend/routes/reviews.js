const express = require('express');
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.vendor_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.vendorId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vendor/:vendorId', authenticate, requireRole('host'), async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const vendorCheck = await pool.query(
      `SELECT id FROM vendors WHERE id = $1 AND status = 'approved'`, [req.params.vendorId]
    );
    if (vendorCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (vendor_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (vendor_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [req.params.vendorId, req.user.id, parseInt(rating), comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('host'), async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
