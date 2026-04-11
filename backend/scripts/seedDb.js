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
      `INSERT INTO vendor_photos (vendor_id, photo_url, caption, event_type, subcategory, design_name)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [vendorId, p.photo_url, p.caption || null, p.event_type || null, p.subcategory || null, p.design_name || null]
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
          // Wedding — Design 1: Floral Elegance
          { photo_url: '/uploads/vendor-photos/FE_ Mandap_Setup.jpg',     caption: 'Mandap Setup',     event_type: 'Wedding', subcategory: 'Mandap Setup',     design_name: 'Floral Elegance' },
          { photo_url: '/uploads/vendor-photos/FE_Entrance Decor.jpg',    caption: 'Entrance Decor',   event_type: 'Wedding', subcategory: 'Entrance Decor',   design_name: 'Floral Elegance' },
          { photo_url: '/uploads/vendor-photos/FE_Stage Decoration.jpg',  caption: 'Stage Decoration', event_type: 'Wedding', subcategory: 'Stage Decoration', design_name: 'Floral Elegance' },
          { photo_url: '/uploads/vendor-photos/FE_Photo Booth.png',       caption: 'Photo Booth',      event_type: 'Wedding', subcategory: 'Photo Booth',      design_name: 'Floral Elegance' },
          // Wedding — Design 2: Traditional Newari (uploaded via dashboard)
          { photo_url: '/uploads/vendor-photos/vendor-1775894182457.jpeg', caption: 'Mandap Setup',     event_type: 'Wedding', subcategory: 'Mandap Setup',     design_name: 'Traditional Newari' },
          { photo_url: '/uploads/vendor-photos/vendor-1775894345092.jpeg', caption: 'Entrance Decor',   event_type: 'Wedding', subcategory: 'Entrance Decor',   design_name: 'Traditional Newari' },
          { photo_url: '/uploads/vendor-photos/vendor-1775894480815.jpeg', caption: 'Stage Decoration', event_type: 'Wedding', subcategory: 'Stage Decoration', design_name: 'Traditional Newari' },
          { photo_url: '/uploads/vendor-photos/vendor-1775894534997.jpg',  caption: 'Photo Booth',      event_type: 'Wedding', subcategory: 'Photo Booth',      design_name: 'Traditional Newari' },
          // Wedding — Design 3: Royal Classic — no photos yet
          // Bratabandha — no photos yet
          // Pooja — no photos yet
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
        photos: [],
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
        photos: [],
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
        photos: [],
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
        photos: [],
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
        photos: [],
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
