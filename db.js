// db.js - TrustPG Relational Database Layer via Node native node:sqlite
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// On Vercel serverless, root filesystem is read-only, so use /tmp for SQLite
const isVercel = Boolean(process.env.VERCEL);
const DB_PATH = isVercel ? path.join('/tmp', 'trustpg.db') : path.join(__dirname, 'trustpg.db');

// If on Vercel, copy pre-seeded database to /tmp if it doesn't already exist
if (isVercel && !fs.existsSync(DB_PATH)) {
  const localDb = path.join(__dirname, 'trustpg.db');
  if (fs.existsSync(localDb)) {
    try {
      fs.copyFileSync(localDb, DB_PATH);
    } catch (e) {
      console.error('Failed to copy db to /tmp:', e);
    }
  }
}

const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT CHECK(role IN ('student', 'owner', 'inspector', 'admin')) NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pg_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      locality TEXT NOT NULL,
      address TEXT NOT NULL,
      gender_preference TEXT CHECK(gender_preference IN ('women', 'men', 'coliving', 'any')) NOT NULL,
      room_sharing_types TEXT NOT NULL, -- JSON string: ["single", "double", "triple"]
      food_included INTEGER DEFAULT 0, -- 1=yes, 0=no
      food_charges INTEGER, -- NULL if included or not provided
      base_rent INTEGER NOT NULL,
      electricity_maintenance INTEGER, -- NULL if not provided
      other_charges INTEGER, -- NULL if not provided
      other_charges_description TEXT,
      deposit INTEGER, -- NULL if not provided
      deposit_terms TEXT,
      one_time_fees INTEGER, -- NULL if not provided
      furnishing TEXT CHECK(furnishing IN ('fully_furnished', 'semi_furnished', 'unfurnished')) DEFAULT 'fully_furnished',
      is_available INTEGER DEFAULT 1,
      verification_status TEXT CHECK(verification_status IN (
        'not_requested',
        'payment_pending',
        'inspection_requested',
        'inspection_scheduled',
        'inspection_completed',
        'verified',
        'reinspection_required',
        'verification_expired'
      )) DEFAULT 'not_requested',
      verified_at TEXT,
      verification_expires_at TEXT,
      inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      inspection_notes TEXT,
      status TEXT CHECK(status IN ('active', 'pending_approval', 'suspended')) DEFAULT 'active',
      is_demo INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pg_facilities (
      pg_id INTEGER PRIMARY KEY REFERENCES pg_listings(id) ON DELETE CASCADE,
      wifi INTEGER DEFAULT 1,
      laundry INTEGER DEFAULT 1,
      housekeeping INTEGER DEFAULT 1,
      ac INTEGER DEFAULT 0,
      power_backup INTEGER DEFAULT 1,
      drinking_water INTEGER DEFAULT 1,
      security INTEGER DEFAULT 1,
      study_area INTEGER DEFAULT 0,
      parking INTEGER DEFAULT 0,
      cctv INTEGER DEFAULT 1,
      attached_bathroom INTEGER DEFAULT 1,
      geyser INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pg_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      caption TEXT,
      is_primary INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS favourites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, pg_id)
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      move_in_date TEXT,
      status TEXT CHECK(status IN ('new', 'contacted', 'visit_scheduled', 'move_in_confirmed', 'closed')) DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      notes TEXT,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      cleanliness REAL CHECK(cleanliness BETWEEN 1 AND 5) NOT NULL,
      food_quality REAL CHECK(food_quality BETWEEN 1 AND 5) NOT NULL,
      facilities REAL CHECK(facilities BETWEEN 1 AND 5) NOT NULL,
      responsiveness REAL CHECK(responsiveness BETWEEN 1 AND 5) NOT NULL,
      value_for_money REAL CHECK(value_for_money BETWEEN 1 AND 5) NOT NULL,
      accuracy REAL CHECK(accuracy BETWEEN 1 AND 5) NOT NULL,
      overall_rating REAL CHECK(overall_rating BETWEEN 1 AND 5) NOT NULL,
      review_text TEXT NOT NULL,
      is_resident_verified INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('published', 'reported', 'hidden')) DEFAULT 'published',
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
      reported_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'dismissed', 'actioned')) DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inspection_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fee_amount INTEGER NOT NULL DEFAULT 999,
      payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
      payment_ref TEXT,
      payment_mode TEXT CHECK(payment_mode IN ('demo', 'razorpay')) DEFAULT 'demo',
      inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      scheduled_date TEXT,
      checklist_data TEXT, -- JSON structure of 12 items
      inspector_notes TEXT,
      result TEXT CHECK(result IN ('pending', 'passed', 'failed', 'reinspection')) DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS confirmed_move_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id INTEGER UNIQUE REFERENCES enquiries(id) ON DELETE CASCADE,
      pg_id INTEGER NOT NULL REFERENCES pg_listings(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      move_in_date TEXT NOT NULL,
      platform_fee INTEGER NOT NULL DEFAULT 1500,
      payment_status TEXT CHECK(payment_status IN ('pending', 'collected')) DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);

  // Default settings if not already present
  const defaultSettings = [
    { key: 'inspection_fee', value: '999' },
    { key: 'move_in_fee', value: '1500' },
    { key: 'verification_validity_days', value: '180' }
  ];

  const checkStmt = db.prepare('SELECT key FROM platform_settings WHERE key = ?');
  const insertStmt = db.prepare('INSERT INTO platform_settings (key, value, updated_at) VALUES (?, ?, ?)');
  const now = new Date().toISOString();

  for (const s of defaultSettings) {
    const existing = checkStmt.get(s.key);
    if (!existing) {
      insertStmt.run(s.key, s.value, now);
    }
  }
}

// Password hashing helper
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, salt, hash) {
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return check === hash;
}

// Audit logger helper
function logAudit(userId, action, targetType, targetId, details = '') {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, action, targetType, targetId, String(details), new Date().toISOString());
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = {
  db,
  initSchema,
  hashPassword,
  verifyPassword,
  logAudit
};
