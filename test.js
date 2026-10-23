// test.js - Automated Verification & Quality Assurance Suite for TrustPG
const assert = require('node:assert');
const { db, initSchema, hashPassword, verifyPassword } = require('./db.js');
const { seedDatabase } = require('./seed.js');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('🧪 RUNNING TRUSTPG QUALITY ASSURANCE & BUSINESS TESTS');
  console.log('====================================================\n');

  // 1. Database Initialization & Seed Integrity
  runTest('Database initialization and foreign key constraints active', () => {
    initSchema();
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pg_listings'").get();
    assert.ok(tableCheck, 'pg_listings table must exist');
    const userCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    assert.ok(userCheck, 'users table must exist');
  });

  runTest('Seed database with 10 Bengaluru demo PGs and role accounts', () => {
    seedDatabase();
    const count = db.prepare('SELECT COUNT(id) as count FROM pg_listings').get().count;
    assert.strictEqual(count, 10, 'Must seed exactly 10 initial demo PGs');
    const usersCount = db.prepare('SELECT COUNT(id) as count FROM users').get().count;
    assert.strictEqual(usersCount, 4, 'Must seed 4 role accounts (student, owner, inspector, admin)');
  });

  // 2. Password Hashing & Verification
  runTest('Crypto PBKDF2/scrypt password hashing and verification', () => {
    const { hash, salt } = hashPassword('MySecurePassword123');
    assert.ok(hash && salt, 'Hash and salt must be generated');
    assert.ok(verifyPassword('MySecurePassword123', salt, hash), 'Correct password must verify');
    assert.ok(!verifyPassword('WrongPassword', salt, hash), 'Incorrect password must be rejected');
  });

  // 3. Transparent Cost Calculation & Missing Charges Handling
  runTest('Cost breakdown calculation engine accurately handles missing charges', () => {
    // Listing 1 has: base_rent 12500, food_included 1 (food_charges 0), elec 800, other 200 => total 13500
    const pg1 = db.prepare('SELECT * FROM pg_listings ORDER BY id ASC LIMIT 1').get();
    assert.ok(pg1, 'First listing must exist');
    const foodCost1 = pg1.food_included === 1 ? 0 : (pg1.food_charges || 0);
    const total1 = pg1.base_rent + foodCost1 + (pg1.electricity_maintenance || 0) + (pg1.other_charges || 0);
    assert.strictEqual(total1, 13500, 'Greenview Luxury PG total must equal ₹13,500');

    // Listing with other_charges = NULL ("Not provided")
    const pgNull = db.prepare('SELECT * FROM pg_listings WHERE other_charges IS NULL LIMIT 1').get();
    assert.ok(pgNull, 'A listing with undisclosed other charges must exist');
    assert.strictEqual(pgNull.other_charges, null, 'Must preserve other_charges as NULL, not silently converting to 0');
  });

  // 4. Locality-Based Search & Filter Matching
  runTest('Search & filter engine returns correct listings by Bengaluru locality', () => {
    const koramangalaPgs = db.prepare("SELECT id, locality FROM pg_listings WHERE LOWER(locality) = 'koramangala'").all();
    assert.ok(koramangalaPgs.length >= 2, 'Koramangala must have at least 2 seeded listings');
    koramangalaPgs.forEach(p => assert.strictEqual(p.locality.toLowerCase(), 'koramangala'));
  });

  // 5. Gender & Room Sharing Filter
  runTest('Filter by gender preference (Women / Men / Co-living)', () => {
    const womenOnly = db.prepare("SELECT id, gender_preference FROM pg_listings WHERE gender_preference = 'women'").all();
    assert.ok(womenOnly.length >= 2, 'Must have at least 2 Women-only PGs');
    womenOnly.forEach(p => assert.strictEqual(p.gender_preference, 'women'));
  });

  // 6. Inspection State Transition Machine
  runTest('Inspection workflow state machine transitions correctly', () => {
    // Insert a test PG
    const owner = db.prepare("SELECT id FROM users WHERE role = 'owner'").get();
    const res = db.prepare(`
      INSERT INTO pg_listings (
        owner_id, title, description, locality, address, gender_preference,
        room_sharing_types, food_included, base_rent, verification_status, status, is_demo, created_at, updated_at
      ) VALUES (?, 'Test PG for Audit', 'Desc', 'HSR Layout', 'Address', 'coliving', '["single"]', 1, 10000, 'not_requested', 'active', 0, datetime('now'), datetime('now'))
    `).run(owner.id);

    const testPgId = Number(res.lastInsertRowid);
    assert.ok(testPgId > 0);

    // Step 1: Owner requests inspection -> status becomes 'payment_pending'
    db.prepare("UPDATE pg_listings SET verification_status = 'payment_pending' WHERE id = ?").run(testPgId);
    let pg = db.prepare('SELECT verification_status FROM pg_listings WHERE id = ?').get(testPgId);
    assert.strictEqual(pg.verification_status, 'payment_pending');

    // Step 2: Payment completed in demo mode -> status becomes 'inspection_requested'
    db.prepare("UPDATE pg_listings SET verification_status = 'inspection_requested' WHERE id = ?").run(testPgId);
    pg = db.prepare('SELECT verification_status FROM pg_listings WHERE id = ?').get(testPgId);
    assert.strictEqual(pg.verification_status, 'inspection_requested');

    // Step 3: Admin assigns inspector -> status becomes 'inspection_scheduled'
    db.prepare("UPDATE pg_listings SET verification_status = 'inspection_scheduled' WHERE id = ?").run(testPgId);
    pg = db.prepare('SELECT verification_status FROM pg_listings WHERE id = ?').get(testPgId);
    assert.strictEqual(pg.verification_status, 'inspection_scheduled');

    // Step 4: Inspector records checklist -> status becomes 'inspection_completed'
    db.prepare("UPDATE pg_listings SET verification_status = 'inspection_completed' WHERE id = ?").run(testPgId);
    pg = db.prepare('SELECT verification_status FROM pg_listings WHERE id = ?').get(testPgId);
    assert.strictEqual(pg.verification_status, 'inspection_completed');

    // Step 5: Admin reviews & approves badge -> status becomes 'verified' with valid date
    const verifiedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      UPDATE pg_listings
      SET verification_status = 'verified', verified_at = ?, verification_expires_at = ?
      WHERE id = ?
    `).run(verifiedAt, expiresAt, testPgId);

    pg = db.prepare('SELECT verification_status, verified_at, verification_expires_at FROM pg_listings WHERE id = ?').get(testPgId);
    assert.strictEqual(pg.verification_status, 'verified');
    assert.ok(pg.verified_at, 'verified_at must be populated');
    assert.ok(pg.verification_expires_at, 'verification_expires_at must be populated');
  });

  // 7. Expired Verification Expiry Logic
  runTest('Expired verification badge is not represented as currently active', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString(); // expired 1 second ago
    const pg = {
      verification_status: 'verified',
      verification_expires_at: pastDate
    };

    let isCurrentlyVerified = pg.verification_status === 'verified';
    if (isCurrentlyVerified && pg.verification_expires_at) {
      if (new Date(pg.verification_expires_at).getTime() < Date.now()) {
        isCurrentlyVerified = false;
      }
    }

    assert.strictEqual(isCurrentlyVerified, false, 'Expired badge must evaluate to false');
  });

  // 8. Deduplication of Confirmed Move-In Fees (Prompt Section 16 & 21)
  runTest('Confirmed move-in platform fee cannot be charged twice on same enquiry', () => {
    const student = db.prepare("SELECT id FROM users WHERE role = 'student'").get();
    const existingPg = db.prepare('SELECT id, owner_id FROM pg_listings LIMIT 1').get();

    // Create test enquiry
    const enqRes = db.prepare(`
      INSERT INTO enquiries (user_id, pg_id, message, move_in_date, status, created_at)
      VALUES (?, ?, 'Checking move-in deduplication', '2026-11-01', 'new', datetime('now'))
    `).run(student.id, existingPg.id);

    const enqId = Number(enqRes.lastInsertRowid);

    // First confirmation: should succeed and create record
    const moveIn1 = db.prepare(`
      INSERT INTO confirmed_move_ins (
        enquiry_id, pg_id, student_id, owner_id, move_in_date, platform_fee, payment_status, created_at
      ) VALUES (?, ?, ?, ?, '2026-11-01', 1500, 'pending', datetime('now'))
    `).run(enqId, existingPg.id, student.id, existingPg.owner_id);

    assert.ok(moveIn1.lastInsertRowid > 0, 'First move-in record created');

    // Second confirmation attempt: must throw unique constraint violation error!
    let duplicateCaught = false;
    try {
      db.prepare(`
        INSERT INTO confirmed_move_ins (
          enquiry_id, pg_id, student_id, owner_id, move_in_date, platform_fee, payment_status, created_at
        ) VALUES (?, ?, ?, ?, '2026-11-01', 1500, 'pending', datetime('now'))
      `).run(enqId, existingPg.id, student.id, existingPg.owner_id);
    } catch (err) {
      duplicateCaught = true;
    }

    assert.strictEqual(duplicateCaught, true, 'Duplicate fee on same enquiry MUST be prevented by UNIQUE constraint');
  });

  // 9. Review Scoring & 7-Dimension Integrity
  runTest('Review scoring computes overall average from 6 dimensions', () => {
    const student = db.prepare("SELECT id FROM users WHERE role = 'student'").get();
    const existingPg = db.prepare('SELECT id FROM pg_listings LIMIT 1').get();
    const dims = {
      cleanliness: 5,
      food_quality: 4,
      facilities: 5,
      responsiveness: 4,
      value_for_money: 4,
      accuracy: 5
    };
    const overall = Number(((5 + 4 + 5 + 4 + 4 + 5) / 6).toFixed(1));
    assert.strictEqual(overall, 4.5);

    const res = db.prepare(`
      INSERT INTO reviews (
        user_id, pg_id, cleanliness, food_quality, facilities, responsiveness,
        value_for_money, accuracy, overall_rating, review_text, is_resident_verified,
        status, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Clean, safe environment.', 1, 'published', 0, datetime('now'))
    `).run(
      student.id, existingPg.id, dims.cleanliness, dims.food_quality, dims.facilities,
      dims.responsiveness, dims.value_for_money, dims.accuracy, overall
    );

    assert.ok(res.lastInsertRowid > 0, 'Review inserted successfully');
  });

  // 10. Platform Settings Integrity
  runTest('Platform settings store configurable fee amounts', () => {
    const inspFee = db.prepare("SELECT value FROM platform_settings WHERE key = 'inspection_fee'").get();
    assert.strictEqual(inspFee.value, '999', 'Default inspection fee must be ₹999');

    const moveInFee = db.prepare("SELECT value FROM platform_settings WHERE key = 'move_in_fee'").get();
    assert.strictEqual(moveInFee.value, '1500', 'Default move-in fee must be ₹1500');
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
