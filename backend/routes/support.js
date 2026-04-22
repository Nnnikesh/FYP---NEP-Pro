const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

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

    // Email notification to admin (fire-and-forget)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      createTransporter().sendMail({
        from: `"NEP-Pro Support" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[NEP-Pro] New Support Message: ${subject}`,
        html: `
          <h3>New support message received</h3>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${message}</p>
          <hr/>
          <p style="color:#888;font-size:12px;">Reply from the Admin panel in NEP-Pro.</p>
        `,
      }).catch(err => console.error('Support email error:', err.message));
    }
  } catch (err) {
    console.error('Support message error:', err.message);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

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
