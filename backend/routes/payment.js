/**
 * eSewa EPay v2 — Payment Routes
 *
 * POST /api/payment/initiate  — build & return the signed form payload
 * GET  /api/payment/verify    — verify eSewa callback, mark booking deposit or balance as paid
 *
 * Payment model: 20% deposit on confirmation, 80% balance after event.
 * payment_type in the request body: 'deposit' | 'balance'
 *
 * UAT credentials are read from .env.
 */

const express   = require('express');
const crypto    = require('crypto');
const https     = require('https');
const { v4: uuidv4 } = require('uuid');
const pool      = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateSignature({ total_amount, transaction_uuid, product_code }) {
  const secret  = process.env.ESEWA_SECRET;
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

function verifySignature(payload) {
  const secret = process.env.ESEWA_SECRET;
  const fields = payload.signed_field_names.split(',');
  const message = fields.map((f) => `${f}=${payload[f]}`).join(',');
  const expected = crypto.createHmac('sha256', secret).update(message).digest('base64');
  return expected === payload.signature;
}

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
 * Body: { booking_id, payment_type }
 *   payment_type: 'deposit' (20%) | 'balance' (80%)
 *
 * Returns the complete signed form payload the frontend must POST to eSewa.
 */
router.post('/initiate', authenticate, requireRole('host'), async (req, res) => {
  const { booking_id, payment_type } = req.body;
  if (!booking_id) return res.status(400).json({ error: 'booking_id is required.' });

  const pType = payment_type === 'balance' ? 'balance' : 'deposit';

  try {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND host_id = $2`,
      [booking_id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Booking not found.' });

    const booking = result.rows[0];

    if (!booking.agreed_amount || Number(booking.agreed_amount) <= 0) {
      return res.status(400).json({ error: 'Booking has no agreed amount to pay.' });
    }
    if (booking.payment_method === 'cash') {
      return res.status(400).json({ error: 'This booking uses cash payment.' });
    }

    const fullAmount = Number(booking.agreed_amount);
    let chargeAmount;

    if (pType === 'deposit') {
      if (booking.deposit_status === 'paid') {
        return res.status(400).json({ error: 'Deposit has already been paid.' });
      }
      if (booking.status !== 'confirmed') {
        return res.status(400).json({ error: 'Deposit can only be paid after vendor confirms the booking.' });
      }
      chargeAmount = (fullAmount * 0.20).toFixed(2);
    } else {
      // balance (80%)
      if (booking.deposit_status !== 'paid') {
        return res.status(400).json({ error: 'Please pay the 20% deposit first.' });
      }
      if (booking.payment_status === 'paid') {
        return res.status(400).json({ error: 'Balance has already been paid.' });
      }
      if (booking.status !== 'completed') {
        return res.status(400).json({ error: 'Balance payment is available after the event is marked completed.' });
      }
      chargeAmount = (fullAmount * 0.80).toFixed(2);
    }

    const total_amount     = chargeAmount;
    const transaction_uuid = uuidv4();
    const product_code     = process.env.ESEWA_MERCHANT_ID;
    const clientUrl        = process.env.CLIENT_URL || 'http://localhost:5173';

    const signature = generateSignature({ total_amount, transaction_uuid, product_code });

    // Store UUID in the right column so verify knows which payment this is
    if (pType === 'deposit') {
      await pool.query(
        `UPDATE bookings SET deposit_transaction_uuid = $1 WHERE id = $2`,
        [transaction_uuid, booking_id]
      );
    } else {
      await pool.query(
        `UPDATE bookings SET transaction_uuid = $1 WHERE id = $2`,
        [transaction_uuid, booking_id]
      );
    }

    res.json({
      payment_url: process.env.ESEWA_PAYMENT_URL,
      payment_type: pType,
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
 * Detects deposit vs balance by checking which UUID column matches.
 */
router.get('/verify', async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ error: 'Missing data parameter.' });

  try {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    if (!verifySignature(payload)) {
      return res.status(400).json({ error: 'Signature mismatch. Payment not verified.' });
    }

    if (payload.status !== 'COMPLETE') {
      return res.status(400).json({ error: `Payment status is ${payload.status}, not COMPLETE.` });
    }

    // Secondary confirmation
    const statusRes = await checkEsewaStatus({
      product_code:     payload.product_code,
      total_amount:     payload.total_amount,
      transaction_uuid: payload.transaction_uuid,
    });
    if (statusRes && statusRes.status && statusRes.status !== 'COMPLETE') {
      return res.status(400).json({ error: `eSewa status API returned: ${statusRes.status}` });
    }

    // Check deposit UUID first, then balance UUID
    let booking = null;
    let pType   = null;

    const depositRes = await pool.query(
      `SELECT * FROM bookings WHERE deposit_transaction_uuid = $1`,
      [payload.transaction_uuid]
    );
    if (depositRes.rowCount > 0) {
      booking = depositRes.rows[0];
      pType   = 'deposit';
    } else {
      const balanceRes = await pool.query(
        `SELECT * FROM bookings WHERE transaction_uuid = $1`,
        [payload.transaction_uuid]
      );
      if (balanceRes.rowCount > 0) {
        booking = balanceRes.rows[0];
        pType   = 'balance';
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'No booking found for this transaction.' });
    }

    if (pType === 'deposit') {
      if (booking.deposit_status === 'paid') {
        return res.json({ success: true, booking_id: booking.id, payment_type: 'deposit', already_paid: true });
      }
      await pool.query(
        `UPDATE bookings SET deposit_status = 'paid', payment_status = 'partial' WHERE id = $1`,
        [booking.id]
      );
      return res.json({
        success:          true,
        booking_id:       booking.id,
        payment_type:     'deposit',
        transaction_code: payload.transaction_code,
        total_amount:     payload.total_amount,
      });
    } else {
      // balance
      if (booking.payment_status === 'paid') {
        return res.json({ success: true, booking_id: booking.id, payment_type: 'balance', already_paid: true });
      }
      await pool.query(
        `UPDATE bookings SET payment_status = 'paid' WHERE id = $1`,
        [booking.id]
      );
      return res.json({
        success:          true,
        booking_id:       booking.id,
        payment_type:     'balance',
        transaction_code: payload.transaction_code,
        total_amount:     payload.total_amount,
      });
    }
  } catch (err) {
    console.error('[payment/verify]', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

module.exports = router;
