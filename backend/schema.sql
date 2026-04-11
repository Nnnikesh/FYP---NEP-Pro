-- NEP-Pro - PostgreSQL Schema
-- Run this file to initialize the database structure

-- Create database (run separately if needed)
-- CREATE DATABASE "NEP-Pro";

-- ============================================================
-- USERS TABLE
-- Stores all users: admins, event hosts, and vendors
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'host'
                    CHECK (role IN ('admin', 'host', 'vendor')),
    avatar_url  VARCHAR(500),
    phone       VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- VENDORS TABLE
-- Extended profile for users with role = 'vendor'
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name   VARCHAR(150) NOT NULL,
    description     TEXT,
    location        VARCHAR(200),
    price_range     VARCHAR(50),         -- e.g. "NPR 50,000 - 2,00,000"
    rating          DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews   INTEGER DEFAULT 0,
    is_verified     BOOLEAN DEFAULT FALSE,
    image_url       VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at     TIMESTAMP
);

-- ============================================================
-- VENDOR_SPECIALIZATIONS TABLE
-- Cultural/event type specializations a vendor offers
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_specializations (
    id              SERIAL PRIMARY KEY,
    vendor_id       INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    specialization  VARCHAR(100) NOT NULL  -- e.g. 'Newari', 'Brahmin', 'Corporate'
);

-- ============================================================
-- VENDOR_SERVICES TABLE
-- Individual services each vendor provides
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_services (
    id          SERIAL PRIMARY KEY,
    vendor_id   INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    service     VARCHAR(200) NOT NULL    -- e.g. 'Mandap Setup', 'Catering', 'Photography'
);

-- ============================================================
-- VENDOR_PHOTOS TABLE
-- Portfolio photos uploaded by vendors showcasing past events
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_photos (
    id          SERIAL PRIMARY KEY,
    vendor_id   INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    photo_url   VARCHAR(500) NOT NULL,
    caption     VARCHAR(300),
    event_type  VARCHAR(100),           -- e.g. 'Wedding', 'Bratabandha'
    subcategory VARCHAR(100),           -- e.g. 'Mandap Setup', 'Stage Decoration'
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BOOKINGS TABLE
-- Event host books a vendor for their event
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id              SERIAL PRIMARY KEY,
    vendor_id       INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    host_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_date      DATE NOT NULL,
    event_location  VARCHAR(300),
    status          VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes           TEXT,
    agreed_amount   DECIMAL(12,2),
    payment_status  VARCHAR(20) DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
    transaction_uuid VARCHAR(100) UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BUDGET_ITEMS TABLE
-- Budget entries attached to a booking
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_items (
    id          SERIAL PRIMARY KEY,
    booking_id  INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    category    VARCHAR(100),               -- e.g. 'Catering', 'Decor', 'Photography'
    description VARCHAR(300),
    amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_paid     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- REVIEWS TABLE
-- Hosts can review vendors after events
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    vendor_id   INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, user_id)  -- one review per user per vendor
);

-- ============================================================
-- SUPPORT_MESSAGES TABLE
-- Help/contact messages submitted by users or visitors
-- ============================================================
CREATE TABLE IF NOT EXISTS support_messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    subject     VARCHAR(300) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    admin_reply TEXT,
    replied_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MIGRATION: Multi-date event support & event type
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_dates TEXT[];
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_type VARCHAR(50);

-- ============================================================
-- MIGRATION: Payment method & 20/80 split tracking
-- Run these ALTER statements on an existing database:
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(10) DEFAULT 'online'
    CHECK (payment_method IN ('online', 'cash'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(20) DEFAULT 'unpaid'
    CHECK (deposit_status IN ('unpaid', 'paid', 'failed'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_transaction_uuid VARCHAR(100);

-- ============================================================
-- MIGRATION: Selected portfolio services per booking
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS selected_services TEXT;

-- Extend payment_status to support 'partial' (deposit paid, balance pending)
DO $$
BEGIN
  -- drop old constraint if it doesn't include 'partial'
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_payment_status_check'
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_payment_status_check;
  END IF;
  ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check
    CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'failed'));
END $$;

-- ============================================================
-- MIGRATION: Design package name for portfolio photos
-- ============================================================
ALTER TABLE vendor_photos ADD COLUMN IF NOT EXISTS design_name VARCHAR(100);

-- ============================================================
-- MIGRATION: Design name on bookings (from portfolio selection)
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS design_name VARCHAR(100);

-- ============================================================
-- MIGRATION: Optional description field on portfolio photos
-- ============================================================
ALTER TABLE vendor_photos ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_booking_id ON budget_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_email ON support_messages(email);
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read ON support_messages(is_read);

-- ============================================================
-- TRIGGER: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: auto-update vendor rating on review insert/update/delete
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors
    SET
        rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id))
    WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vendor_rating ON reviews;
CREATE TRIGGER trg_vendor_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION refresh_vendor_rating();
