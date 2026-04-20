require('dotenv').config();
const pool = require('../db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_status   VARCHAR(20) DEFAULT 'unpaid'
          CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
        ADD COLUMN IF NOT EXISTS transaction_uuid VARCHAR(100) UNIQUE;
    `);
    console.log('Migration complete: payment_status and transaction_uuid added to bookings.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
