const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDb() {
  // Neon: the database already exists — connect directly via DATABASE_URL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Neon PostgreSQL');

    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Schema applied successfully.');
  } finally {
    await client.end();
  }
}

initDb().catch((err) => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});
