const crypto = require('crypto');

function generateSignature({ total_amount, transaction_uuid, product_code }) {
  const secret  = process.env.ESEWA_SECRET;
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

function verifySignature(payload) {
  const secret   = process.env.ESEWA_SECRET;
  const fields   = payload.signed_field_names.split(',');
  const message  = fields.map((f) => `${f}=${payload[f]}`).join(',');
  const expected = crypto.createHmac('sha256', secret).update(message).digest('base64');
  return expected === payload.signature;
}

module.exports = { generateSignature, verifySignature };
