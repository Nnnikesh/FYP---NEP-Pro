/**
 * eSewa EPay v2 — HMAC-SHA256 signature helpers
 */
const crypto = require('crypto');

/**
 * Generate signature for payment initiation.
 * Message format: "total_amount=X,transaction_uuid=Y,product_code=Z"
 */
function generateSignature({ total_amount, transaction_uuid, product_code }) {
  const secret  = process.env.ESEWA_SECRET;
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

/**
 * Verify the signature returned in eSewa's callback payload.
 * Uses signed_field_names to build the message in the correct order.
 */
function verifySignature(payload) {
  const secret   = process.env.ESEWA_SECRET;
  const fields   = payload.signed_field_names.split(',');
  const message  = fields.map((f) => `${f}=${payload[f]}`).join(',');
  const expected = crypto.createHmac('sha256', secret).update(message).digest('base64');
  return expected === payload.signature;
}

module.exports = { generateSignature, verifySignature };
