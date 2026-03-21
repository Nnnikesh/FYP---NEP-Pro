const express = require('express');
const multer  = require('multer');
const path    = require('path');
const pool    = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Multer setup for vendor photo uploads ────────────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/vendor-photos'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `vendor-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// GET /api/vendors — list all approved vendors (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.id, v.business_name, v.description, v.location,
        v.price_range, v.rating, v.total_reviews, v.is_verified, v.image_url,
        u.name AS contact_name, u.email, u.phone,
        ARRAY_AGG(DISTINCT vs.specialization) FILTER (WHERE vs.specialization IS NOT NULL) AS specializations,
        ARRAY_AGG(DISTINCT svc.service) FILTER (WHERE svc.service IS NOT NULL) AS services
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      LEFT JOIN vendor_specializations vs ON vs.vendor_id = v.id
      LEFT JOIN vendor_services svc ON svc.vendor_id = v.id
      WHERE v.status = 'approved'
      GROUP BY v.id, u.name, u.email, u.phone
      ORDER BY v.rating DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Specific named paths MUST come before /:id ──────────────────────────────

// GET /api/vendors/me — vendor views their own profile
router.get('/me', authenticate, requireRole('vendor'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*,
        ARRAY_AGG(DISTINCT vs.specialization) FILTER (WHERE vs.specialization IS NOT NULL) AS specializations,
        ARRAY_AGG(DISTINCT svc.service) FILTER (WHERE svc.service IS NOT NULL) AS services
      FROM vendors v
      LEFT JOIN vendor_specializations vs ON vs.vendor_id = v.id
      LEFT JOIN vendor_services svc ON svc.vendor_id = v.id
      WHERE v.user_id = $1
      GROUP BY v.id
    `, [req.user.id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Vendor profile not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendors/admin/pending — admin: list pending vendor applications
router.get('/admin/pending', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id, v.business_name, v.location, v.submitted_at, v.status,
             u.name, u.email, u.phone,
             ARRAY_AGG(DISTINCT vs.specialization) AS specializations
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      LEFT JOIN vendor_specializations vs ON vs.vendor_id = v.id
      WHERE v.status = 'pending'
      GROUP BY v.id, u.name, u.email, u.phone
      ORDER BY v.submitted_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors/profile — vendor creates their profile
router.post('/profile', authenticate, requireRole('vendor'), async (req, res) => {
  const { business_name, description, location, price_range, image_url, specializations, services } = req.body;

  if (!business_name) {
    return res.status(400).json({ error: 'business_name is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Vendor profile already exists. Use PUT to update.' });
    }

    const vendorRes = await client.query(
      `INSERT INTO vendors (user_id, business_name, description, location, price_range, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, business_name, description || null, location || null, price_range || null, image_url || null]
    );
    const vendor = vendorRes.rows[0];

    if (Array.isArray(specializations)) {
      for (const s of specializations) {
        await client.query(`INSERT INTO vendor_specializations (vendor_id, specialization) VALUES ($1, $2)`, [vendor.id, s]);
      }
    }
    if (Array.isArray(services)) {
      for (const svc of services) {
        await client.query(`INSERT INTO vendor_services (vendor_id, service) VALUES ($1, $2)`, [vendor.id, svc]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(vendor);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/vendors/profile — vendor updates their own profile
router.put('/profile', authenticate, requireRole('vendor'), async (req, res) => {
  const { business_name, description, location, price_range, image_url, specializations, services } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const vendorRes = await client.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vendorRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Vendor profile not found. Create one first.' });
    }
    const vendorId = vendorRes.rows[0].id;

    await client.query(
      `UPDATE vendors
       SET business_name = COALESCE($1, business_name),
           description   = COALESCE($2, description),
           location      = COALESCE($3, location),
           price_range   = COALESCE($4, price_range),
           image_url     = COALESCE($5, image_url)
       WHERE id = $6`,
      [business_name, description, location, price_range, image_url, vendorId]
    );

    if (Array.isArray(specializations)) {
      await client.query('DELETE FROM vendor_specializations WHERE vendor_id = $1', [vendorId]);
      for (const s of specializations) {
        await client.query(`INSERT INTO vendor_specializations (vendor_id, specialization) VALUES ($1, $2)`, [vendorId, s]);
      }
    }
    if (Array.isArray(services)) {
      await client.query('DELETE FROM vendor_services WHERE vendor_id = $1', [vendorId]);
      for (const svc of services) {
        await client.query(`INSERT INTO vendor_services (vendor_id, service) VALUES ($1, $2)`, [vendorId, svc]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Vendor profile updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ── Photo portfolio endpoints ─────────────────────────────────────────────────

// GET /api/vendors/:id/photos — public: get all photos for a vendor
router.get('/:id/photos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, photo_url, caption, event_type, created_at
       FROM vendor_photos
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors/photos — vendor uploads a portfolio photo
router.post('/photos', authenticate, requireRole('vendor'), upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

  const { caption, event_type } = req.body;

  try {
    const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vendorRes.rowCount === 0) return res.status(404).json({ error: 'Vendor profile not found.' });
    const vendorId = vendorRes.rows[0].id;

    const photoUrl = `/uploads/vendor-photos/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO vendor_photos (vendor_id, photo_url, caption, event_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vendorId, photoUrl, caption || null, event_type || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vendors/photos/:photoId — vendor deletes their own photo
router.delete('/photos/:photoId', authenticate, requireRole('vendor'), async (req, res) => {
  try {
    const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vendorRes.rowCount === 0) return res.status(404).json({ error: 'Vendor profile not found.' });
    const vendorId = vendorRes.rows[0].id;

    const result = await pool.query(
      'DELETE FROM vendor_photos WHERE id = $1 AND vendor_id = $2 RETURNING id',
      [req.params.photoId, vendorId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Photo not found or not yours.' });
    res.json({ message: 'Photo deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dynamic param routes AFTER all named routes ──────────────────────────────

// GET /api/vendors/:id — single vendor detail (includes photos)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.*, u.name AS contact_name, u.email, u.phone,
        ARRAY_AGG(DISTINCT vs.specialization) FILTER (WHERE vs.specialization IS NOT NULL) AS specializations,
        ARRAY_AGG(DISTINCT svc.service) FILTER (WHERE svc.service IS NOT NULL) AS services
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      LEFT JOIN vendor_specializations vs ON vs.vendor_id = v.id
      LEFT JOIN vendor_services svc ON svc.vendor_id = v.id
      WHERE v.id = $1
      GROUP BY v.id, u.name, u.email, u.phone
    `, [req.params.id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Vendor not found.' });

    const vendor = result.rows[0];

    // Attach photos
    const photos = await pool.query(
      'SELECT id, photo_url, caption, event_type, created_at FROM vendor_photos WHERE vendor_id = $1 ORDER BY created_at DESC',
      [vendor.id]
    );
    vendor.photos = photos.rows;

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/vendors/:id/status — admin: approve, reject, or suspend
router.patch('/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const result = await pool.query(
      `UPDATE vendors
       SET status = $1,
           approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END
       WHERE id = $2 RETURNING id, business_name, status`,
      [status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Vendor not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
