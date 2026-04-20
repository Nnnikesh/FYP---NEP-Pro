require('dotenv').config();
const pool = require('../db');

const updates = [
  { name: 'Kathmandu Mandap Masters', image_url: '/vendor-mandap-workshop-traditional.jpg' },
  { name: 'Floral Dreams Nepal',       image_url: '/vendor-floral-shop-arrangements.jpg' },
  { name: 'Brahmin Event Specialists', image_url: '/vendor-religious-ceremony-setup.jpg' },
  { name: 'Grand Stage Productions',   image_url: '/vendor-stage-production-setup.jpg' },
  { name: 'Traditional Thakuri Decor', image_url: '/vendor-traditional-decor-display.jpg' },
  { name: 'Royal Wedding Planners',    image_url: '/vendor-luxury-wedding-setup.jpg' },
];

async function run() {
  for (const { name, image_url } of updates) {
    const res = await pool.query(
      `UPDATE vendors SET image_url = $1 WHERE business_name = $2 RETURNING id, business_name`,
      [image_url, name]
    );
    if (res.rowCount > 0) {
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ Not found: ${name}`);
    }
  }
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
