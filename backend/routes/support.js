const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/support — submit a help message (public)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO support_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [name, email, subject, message]
    );
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Support message error:', err.message);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// GET /api/support — fetch all messages (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM support_messages ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// PATCH /api/support/:id/reply — admin sends a reply
router.patch('/:id/reply', authenticate, requireRole('admin'), async (req, res) => {
  const { admin_reply } = req.body
  if (!admin_reply?.trim()) {
    return res.status(400).json({ error: 'Reply text is required.' })
  }
  try {
    const result = await pool.query(
      `UPDATE support_messages
       SET admin_reply = $1, replied_at = NOW(), is_read = TRUE
       WHERE id = $2
       RETURNING id, admin_reply, replied_at`,
      [admin_reply.trim(), req.params.id]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Message not found.' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/support/:id/read — mark a message as read (admin only)
router.patch('/:id/read', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE support_messages SET is_read = TRUE WHERE id = $1 RETURNING id, is_read`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/support/:id — delete a message (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM support_messages WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
