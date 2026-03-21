const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDb() {
  // First connect to 'postgres' default DB to create our database if needed
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  const dbName = process.env.DB_NAME || 'NEP-Pro';

  try {
    await adminClient.connect();

    // Create the database if it doesn't exist
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    await adminClient.end();
  }

  // Now connect to our database and run the schema
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
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
