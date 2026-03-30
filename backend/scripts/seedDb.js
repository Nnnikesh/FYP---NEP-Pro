const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Helper: get or create a user, return id
async function upsertUser(client, { name, email, password, role, phone }) {
  const hashed = await bcrypt.hash(password, 10);
  await client.query(
    `INSERT INTO users (name, email, password, role, phone)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO NOTHING`,
    [name, email, hashed, role, phone || null]
  );
  const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
  return res.rows[0].id;
}

// Helper: get or create a vendor profile, always update image_url
async function upsertVendor(client, userId, { business_name, description, location, price_range, image_url, is_verified = false, status = 'approved', rating = 0, total_reviews = 0 }) {
  const res = await client.query(
    `INSERT INTO vendors (user_id, business_name, description, location, price_range, image_url, is_verified, status, rating, total_reviews)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (user_id) DO UPDATE
       SET image_url = EXCLUDED.image_url,
           business_name = EXCLUDED.business_name,
           description = EXCLUDED.description,
           location = EXCLUDED.location,
           price_range = EXCLUDED.price_range,
           is_verified = EXCLUDED.is_verified,
           status = EXCLUDED.status,
           rating = EXCLUDED.rating,
           total_reviews = EXCLUDED.total_reviews
     RETURNING id`,
    [userId, business_name, description, location, price_range, image_url, is_verified, status, rating, total_reviews]
  );
  return res.rows[0].id;
}

async function addSpecializations(client, vendorId, specs) {
  await client.query('DELETE FROM vendor_specializations WHERE vendor_id = $1', [vendorId]);
  for (const s of specs) {
    await client.query(
      'INSERT INTO vendor_specializations (vendor_id, specialization) VALUES ($1,$2)',
      [vendorId, s]
    );
  }
}

async function addServices(client, vendorId, services) {
  await client.query('DELETE FROM vendor_services WHERE vendor_id = $1', [vendorId]);
  for (const svc of services) {
    await client.query(
      'INSERT INTO vendor_services (vendor_id, service) VALUES ($1,$2)',
      [vendorId, svc]
    );
  }
}

async function addPhotos(client, vendorId, photos) {
  await client.query('DELETE FROM vendor_photos WHERE vendor_id = $1', [vendorId]);
  for (const p of photos) {
    await client.query(
      `INSERT INTO vendor_photos (vendor_id, photo_url, caption, event_type, subcategory)
       VALUES ($1,$2,$3,$4,$5)`,
      [vendorId, p.photo_url, p.caption || null, p.event_type || null, p.subcategory || null]
    );
  }
}

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    console.log('Seeding database...\n');

    // ── Admin ───────────────────────────────────────────────────────────────
    await upsertUser(client, {
      name: 'Admin User', email: 'admin@nepalplanner.com',
      password: 'Admin@1234', role: 'admin',
    });
    console.log('✓ Admin  (admin@nepalplanner.com / Admin@1234)');

    // ── Host ────────────────────────────────────────────────────────────────
    await upsertUser(client, {
      name: 'Ramesh Sharma', email: 'ramesh@gmail.com',
      password: 'Host@1234', role: 'host', phone: '9841000002',
    });
    console.log('✓ Host   (ramesh@gmail.com / Host@1234)');

    // ── Vendors ─────────────────────────────────────────────────────────────
    const vendors = [
      {
        user: { name: 'Shiva Decorations', email: 'shiva@decorations.com', password: 'Vendor@1234', role: 'vendor', phone: '9841000001' },
        profile: {
          business_name: 'Kathmandu Mandap Masters',
          description: 'Specializing in authentic Newari wedding mandaps with 15+ years of experience.',
          location: 'Patan, Kathmandu',
          price_range: 'Rs. 1,25,000',
          image_url: '/vendor-mandap-workshop-traditional.jpg',
          is_verified: true, status: 'approved',
          rating: 4.5, total_reviews: 12,
        },
        specializations: ['Newari', 'Traditional'],
        services: ['Mandap Construction', 'Traditional Decor', 'Pooja Setup'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-mandap-1.jpg', caption: 'Newari Mandap Setup', event_type: 'Wedding', subcategory: 'Mandap Setup' },
          { photo_url: '/uploads/vendor-photos/sample-mandap-2.jpg', caption: 'Stage Decoration', event_type: 'Wedding', subcategory: 'Stage Decoration' },
          { photo_url: '/uploads/vendor-photos/sample-entrance-1.jpg', caption: 'Floral Entrance', event_type: 'Wedding', subcategory: 'Entrance Decor' },
          { photo_url: '/uploads/vendor-photos/sample-pooja-1.jpg', caption: 'Pooja Altar Setup', event_type: 'Pooja', subcategory: 'Altar Decoration' },
          { photo_url: '/uploads/vendor-photos/sample-bratabandha-1.jpg', caption: 'Bratabandha Mandap', event_type: 'Bratabandha', subcategory: 'Bratabandha Mandap' },
        ],
      },
      {
        user: { name: 'Floral Dreams', email: 'contact@floraldreams.com.np', password: 'Vendor@1234', role: 'vendor', phone: '9841000003' },
        profile: {
          business_name: 'Floral Dreams Nepal',
          description: 'Premium floral arrangements and modern decor for all occasions.',
          location: 'Thamel, Kathmandu',
          price_range: 'NPR 20,000 - 1,00,000',
          image_url: '/vendor-floral-shop-arrangements.jpg',
          is_verified: true, status: 'approved',
        },
        specializations: ['Floral', 'Modern'],
        services: ['Floral Arches', 'Bouquets', 'Venue Decoration'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-floral-1.jpg', caption: 'Floral Arrangements', event_type: 'Wedding', subcategory: 'Floral Arrangements' },
          { photo_url: '/uploads/vendor-photos/sample-floral-2.jpg', caption: 'Entrance Flower Arch', event_type: 'Wedding', subcategory: 'Entrance Decor' },
          { photo_url: '/uploads/vendor-photos/sample-birthday-1.jpg', caption: 'Birthday Balloon Decor', event_type: 'Birthday Party', subcategory: 'Balloon Decoration' },
          { photo_url: '/uploads/vendor-photos/sample-engagement-1.jpg', caption: 'Engagement Flowers', event_type: 'Engagement', subcategory: 'Floral Arrangements' },
        ],
      },
      {
        user: { name: 'Brahmin Events', email: 'brahminevents@gmail.com', password: 'Vendor@1234', role: 'vendor', phone: '9841000004' },
        profile: {
          business_name: 'Brahmin Event Specialists',
          description: 'Complete Brahmin ceremony setups with traditional purity and authenticity.',
          location: 'Bhaktapur',
          price_range: 'NPR 15,000 - 80,000',
          image_url: '/vendor-religious-ceremony-setup.jpg',
          is_verified: true, status: 'approved',
        },
        specializations: ['Brahmin', 'Traditional'],
        services: ['Bratabandha Setup', 'Wedding Ceremonies', 'Pooja Materials'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-bratabandha-2.jpg', caption: 'Traditional Bratabandha', event_type: 'Bratabandha', subcategory: 'Bratabandha Mandap' },
          { photo_url: '/uploads/vendor-photos/sample-bratabandha-3.jpg', caption: 'Pooja Setup', event_type: 'Bratabandha', subcategory: 'Pooja Setup' },
          { photo_url: '/uploads/vendor-photos/sample-pasni-1.jpg', caption: 'Pasni Ceremony', event_type: 'Pasni', subcategory: 'Traditional Setup' },
          { photo_url: '/uploads/vendor-photos/sample-pooja-2.jpg', caption: 'Diyo & Lighting', event_type: 'Pooja', subcategory: 'Lighting & Diyo Setup' },
        ],
      },
      {
        user: { name: 'Grand Stage', email: 'info@grandstage.com.np', password: 'Vendor@1234', role: 'vendor', phone: '9841000005' },
        profile: {
          business_name: 'Grand Stage Productions',
          description: 'Professional stage and backdrop design for corporate and modern events.',
          location: 'New Baneshwor, Kathmandu',
          price_range: 'NPR 60,000 - 2,00,000',
          image_url: '/vendor-stage-production-setup.jpg',
          is_verified: true, status: 'approved',
        },
        specializations: ['Corporate', 'Modern'],
        services: ['Stage Design', 'Lighting', 'Sound System'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-corporate-1.jpg', caption: 'Corporate Stage', event_type: 'Corporate Event', subcategory: 'Stage Setup' },
          { photo_url: '/uploads/vendor-photos/sample-corporate-2.jpg', caption: 'Banner & Backdrop', event_type: 'Corporate Event', subcategory: 'Banner & Backdrop' },
          { photo_url: '/uploads/vendor-photos/sample-birthday-2.jpg', caption: 'Birthday Stage', event_type: 'Birthday Party', subcategory: 'Stage & Backdrop' },
          { photo_url: '/uploads/vendor-photos/sample-wedding-lighting.jpg', caption: 'Wedding Lighting', event_type: 'Wedding', subcategory: 'Lighting Setup' },
        ],
      },
      {
        user: { name: 'Thakuri Decor', email: 'thakuridecor@yahoo.com', password: 'Vendor@1234', role: 'vendor', phone: '9841000006' },
        profile: {
          business_name: 'Traditional Thakuri Decor',
          description: 'Authentic Thakuri cultural decorations and ceremony management.',
          location: 'Lalitpur',
          price_range: 'NPR 30,000 - 1,20,000',
          image_url: '/vendor-traditional-decor-display.jpg',
          is_verified: false, status: 'approved',
        },
        specializations: ['Thakuri', 'Traditional'],
        services: ['Cultural Decor', 'Traditional Attire', 'Ceremony Planning'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-osai-1.jpg', caption: 'Osai Ceremony Decor', event_type: 'Osai Ceremony', subcategory: 'Traditional Setup' },
          { photo_url: '/uploads/vendor-photos/sample-osai-2.jpg', caption: 'Seating Arrangement', event_type: 'Osai Ceremony', subcategory: 'Seating Arrangement' },
          { photo_url: '/uploads/vendor-photos/sample-wedding-chairs.jpg', caption: 'Wedding Chair Setup', event_type: 'Wedding', subcategory: 'Chair & Table Setup' },
        ],
      },
      {
        user: { name: 'Royal Weddings', email: 'royal@weddingplannersnepal.com', password: 'Vendor@1234', role: 'vendor', phone: '9841000007' },
        profile: {
          business_name: 'Royal Wedding Planners',
          description: 'Comprehensive luxury wedding planning with end-to-end services.',
          location: 'Durbar Marg, Kathmandu',
          price_range: 'NPR 2,00,000 - 10,00,000',
          image_url: '/vendor-luxury-wedding-setup.jpg',
          is_verified: true, status: 'approved',
        },
        specializations: ['Luxury', 'Modern'],
        services: ['Full Event Planning', 'Venue Booking', 'Catering', 'Decor'],
        photos: [
          { photo_url: '/uploads/vendor-photos/sample-wedding-ceremony.jpg', caption: 'Wedding Ceremony Area', event_type: 'Wedding', subcategory: 'Wedding Ceremony Area' },
          { photo_url: '/uploads/vendor-photos/sample-wedding-stage.jpg', caption: 'Luxury Stage', event_type: 'Wedding', subcategory: 'Stage Decoration' },
          { photo_url: '/uploads/vendor-photos/sample-engagement-stage.jpg', caption: 'Engagement Stage', event_type: 'Engagement', subcategory: 'Stage Decoration' },
          { photo_url: '/uploads/vendor-photos/sample-engagement-table.jpg', caption: 'Engagement Table', event_type: 'Engagement', subcategory: 'Table Setup' },
        ],
      },
    ];

    for (const v of vendors) {
      const userId   = await upsertUser(client, v.user);
      const vendorId = await upsertVendor(client, userId, v.profile);
      await addSpecializations(client, vendorId, v.specializations);
      await addServices(client, vendorId, v.services);
      if (v.photos) await addPhotos(client, vendorId, v.photos);
      console.log(`✓ Vendor: ${v.profile.business_name} (${(v.photos || []).length} photos)`);
    }

    console.log('\nSeeding complete!');
    console.log('\nAll vendor passwords: Vendor@1234');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
