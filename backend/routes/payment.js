/**
 * eSewa EPay v2 — Payment Routes
 *
 * POST /api/payment/initiate  — build & return the signed form payload
 * GET  /api/payment/verify    — verify eSewa callback, mark booking as paid
 *
 * UAT credentials are read from .env.
 * TODO (production): swap ESEWA_* env values for live merchant credentials.
 */

const express   = require('express');
const crypto    = require('crypto');
const https     = require('https');
const { v4: uuidv4 } = require('uuid');
const pool      = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate eSewa HMAC-SHA256 signature (base64).
 * Signed message format: "total_amount=X,transaction_uuid=Y,product_code=Z"
 */
function generateSignature({ total_amount, transaction_uuid, product_code }) {
  const secret  = process.env.ESEWA_SECRET;
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

/**
 * Verify the signature returned by eSewa in the callback payload.
 * signed_field_names lists the fields (comma-separated) that were signed.
 * Message format: "field1=value1,field2=value2,..."
 */
function verifySignature(payload) {
  const secret = process.env.ESEWA_SECRET;
  const fields = payload.signed_field_names.split(',');
  const message = fields.map((f) => `${f}=${payload[f]}`).join(',');
  const expected = crypto.createHmac('sha256', secret).update(message).digest('base64');
  return expected === payload.signature;
}

/**
 * Secondary check: call eSewa's Transaction Status API to independently confirm.
 * TODO (production): ESEWA_STATUS_URL is already set to live URL in .env for production.
 * Returns the parsed JSON response or null on network error.
 */
function checkEsewaStatus({ product_code, total_amount, transaction_uuid }) {
  return new Promise((resolve) => {
    const base = process.env.ESEWA_STATUS_URL;
    const url  = `${base}?product_code=${encodeURIComponent(product_code)}&total_amount=${encodeURIComponent(total_amount)}&transaction_uuid=${encodeURIComponent(transaction_uuid)}`;

    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// ── POST /api/payment/initiate ────────────────────────────────────────────────
/**
 * Called by the frontend before redirecting the user to eSewa.
 * Body: { booking_id }
 * Returns the complete signed form payload the frontend must POST to eSewa.
 */
router.post('/initiate', authenticate, requireRole('host'), async (req, res) => {
  const { booking_id } = req.body;
  if (!booking_id) return res.status(400).json({ error: 'booking_id is required.' });

  try {
    // Fetch booking and confirm it belongs to this host and has an agreed amount
    const result = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND host_id = $2`,
      [booking_id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Booking not found.' });

    const booking = result.rows[0];

    if (!booking.agreed_amount || Number(booking.agreed_amount) <= 0) {
      return res.status(400).json({ error: 'Booking has no agreed amount to pay.' });
    }
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ error: 'This booking has already been paid.' });
    }

    const total_amount     = Number(booking.agreed_amount).toFixed(2);
    const transaction_uuid = uuidv4();
    const product_code     = process.env.ESEWA_MERCHANT_ID; // EPAYTEST (UAT)
    const clientUrl        = process.env.CLIENT_URL || 'http://localhost:5173';

    const signature = generateSignature({ total_amount, transaction_uuid, product_code });

    // Persist the transaction_uuid so we can look up the booking on callback
    await pool.query(
      `UPDATE bookings SET transaction_uuid = $1, payment_status = 'unpaid' WHERE id = $2`,
      [transaction_uuid, booking_id]
    );

    // Return the full payload — frontend will dynamically POST this to eSewa
    res.json({
      payment_url: process.env.ESEWA_PAYMENT_URL,
      // TODO (production): replace rc-epay URL with live eSewa payment URL
      payload: {
        amount:                   total_amount,
        tax_amount:               '0',
        total_amount:             total_amount,
        transaction_uuid,
        product_code,
        product_service_charge:   '0',
        product_delivery_charge:  '0',
        success_url:              `${clientUrl}/payment-success`,
        failure_url:              `${clientUrl}/payment-failure`,
        signed_field_names:       'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (err) {
    console.error('[payment/initiate]', err);
    res.status(500).json({ error: 'Could not initiate payment.' });
  }
});

// ── GET /api/payment/verify ───────────────────────────────────────────────────
/**
 * Called by the frontend after eSewa redirects to /payment-success?data=<base64>.
 * Query param: data — base64-encoded JSON from eSewa.
 * Verifies the HMAC, then marks the booking as paid.
 */
router.get('/verify', async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ error: 'Missing data parameter.' });

  try {
    // Decode base64 → JSON
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    // Step 1: HMAC signature check
    if (!verifySignature(payload)) {
      return res.status(400).json({ error: 'Signature mismatch. Payment not verified.' });
    }

    if (payload.status !== 'COMPLETE') {
      return res.status(400).json({ error: `Payment status is ${payload.status}, not COMPLETE.` });
    }

    // Step 2: Secondary confirmation via eSewa Transaction Status API
    const statusRes = await checkEsewaStatus({
      product_code:     payload.product_code,
      total_amount:     payload.total_amount,
      transaction_uuid: payload.transaction_uuid,
    });
    // If the status API responds, confirm it says COMPLETE (non-fatal if API unreachable)
    if (statusRes && statusRes.status && statusRes.status !== 'COMPLETE') {
      return res.status(400).json({ error: `eSewa status API returned: ${statusRes.status}` });
    }

    // Find booking by transaction_uuid
    const result = await pool.query(
      `SELECT * FROM bookings WHERE transaction_uuid = $1`,
      [payload.transaction_uuid]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No booking found for this transaction.' });
    }

    const booking = result.rows[0];
    if (booking.payment_status === 'paid') {
      // Idempotent — already marked paid (duplicate callback)
      return res.json({ success: true, booking_id: booking.id, already_paid: true });
    }

    // Mark booking as paid
    await pool.query(
      `UPDATE bookings SET payment_status = 'paid' WHERE id = $1`,
      [booking.id]
    );

    res.json({
      success:          true,
      booking_id:       booking.id,
      transaction_code: payload.transaction_code,
      total_amount:     payload.total_amount,
    });
  } catch (err) {
    console.error('[payment/verify]', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

module.exports = router;
