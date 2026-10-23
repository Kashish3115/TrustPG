// server.js - TrustPG Full-Stack Server
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, initSchema, hashPassword, verifyPassword, logAudit } = require('./db.js');
const { seedDatabase } = require('./seed.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Session authentication helper
function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies['trustpg_session'];
  }

  if (!token) return null;

  const now = Date.now();
  const session = db.prepare(`
    SELECT s.token, u.id, u.email, u.full_name, u.phone, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now);

  return session || null;
}

// Platform settings helper
function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

// Create HTTP server handler function (exported for Vercel Serverless Function support)
async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const user = getAuthenticatedUser(req);

  try {
    // ==========================================
    // API: AUTHENTICATION
    // ==========================================
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { email, password, full_name, phone, role } = body;

      if (!email || !password || !full_name || !role) {
        return sendJson(res, 400, { error: 'Please provide email, password, full name, and role' });
      }

      if (!['student', 'owner', 'inspector'].includes(role)) {
        return sendJson(res, 400, { error: 'Invalid role for public registration' });
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (existing) {
        return sendJson(res, 400, { error: 'An account with this email already exists' });
      }

      const { hash, salt } = hashPassword(password);
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, salt, full_name, phone, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(email.toLowerCase().trim(), hash, salt, full_name.trim(), phone || '', role, new Date().toISOString());

      const userId = Number(result.lastInsertRowid);
      const token = crypto.randomUUID();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

      db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
      logAudit(userId, 'USER_REGISTERED', 'users', userId, `New ${role} registered`);

      return sendJson(res, 201, {
        token,
        user: { id: userId, email: email.toLowerCase().trim(), full_name: full_name.trim(), phone: phone || '', role }
      });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Email and password are required' });
      }

      const account = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (!account || !verifyPassword(password, account.salt, account.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid email or password' });
      }

      const token = crypto.randomUUID();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, account.id, expiresAt);
      logAudit(account.id, 'USER_LOGIN', 'users', account.id, 'User logged in');

      return sendJson(res, 200, {
        token,
        user: { id: account.id, email: account.email, full_name: account.full_name, phone: account.phone, role: account.role }
      });
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'Not authenticated' });
      return sendJson(res, 200, { user });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'];
      let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
      if (token) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      }
      return sendJson(res, 200, { message: 'Logged out successfully' });
    }

    // ==========================================
    // API: LISTINGS & DISCOVERY
    // ==========================================
    if (pathname === '/api/listings' && req.method === 'GET') {
      const locality = urlObj.searchParams.get('locality');
      const minBudget = parseInt(urlObj.searchParams.get('min_budget')) || 0;
      const maxBudget = parseInt(urlObj.searchParams.get('max_budget')) || 100000;
      const gender = urlObj.searchParams.get('gender');
      const roomType = urlObj.searchParams.get('room_type');
      const food = urlObj.searchParams.get('food');
      const verifiedOnly = urlObj.searchParams.get('verified_only') === '1';
      const sort = urlObj.searchParams.get('sort') || 'lowest_total';

      // Amenities filters
      const wifi = urlObj.searchParams.get('wifi') === '1';
      const laundry = urlObj.searchParams.get('laundry') === '1';
      const housekeeping = urlObj.searchParams.get('housekeeping') === '1';
      const ac = urlObj.searchParams.get('ac') === '1';
      const power_backup = urlObj.searchParams.get('power_backup') === '1';
      const drinking_water = urlObj.searchParams.get('drinking_water') === '1';
      const security = urlObj.searchParams.get('security') === '1';
      const study_area = urlObj.searchParams.get('study_area') === '1';
      const parking = urlObj.searchParams.get('parking') === '1';

      let sql = `
        SELECT p.*, f.wifi, f.laundry, f.housekeeping, f.ac, f.power_backup,
               f.drinking_water, f.security, f.study_area, f.parking, f.cctv,
               f.attached_bathroom, f.geyser,
               (SELECT url FROM pg_photos WHERE pg_id = p.id AND is_primary = 1 LIMIT 1) as primary_photo,
               (SELECT AVG(overall_rating) FROM reviews WHERE pg_id = p.id AND status = 'published') as avg_rating,
               (SELECT COUNT(id) FROM reviews WHERE pg_id = p.id AND status = 'published') as review_count
        FROM pg_listings p
        JOIN pg_facilities f ON p.id = f.pg_id
        WHERE p.status = 'active'
      `;
      const params = [];

      if (locality && locality !== 'all') {
        sql += ` AND LOWER(p.locality) = LOWER(?)`;
        params.push(locality);
      }

      if (gender && gender !== 'any') {
        sql += ` AND (p.gender_preference = ? OR p.gender_preference = 'coliving')`;
        params.push(gender);
      }

      if (roomType && roomType !== 'any') {
        sql += ` AND p.room_sharing_types LIKE ?`;
        params.push(`%"${roomType}"%`);
      }

      if (food === 'with_food') {
        sql += ` AND (p.food_included = 1 OR p.food_charges > 0)`;
      } else if (food === 'without_food') {
        sql += ` AND (p.food_included = 0 AND (p.food_charges IS NULL OR p.food_charges = 0))`;
      }

      if (verifiedOnly) {
        sql += ` AND p.verification_status = 'verified'`;
      }

      // Check amenities
      if (wifi) sql += ` AND f.wifi = 1`;
      if (laundry) sql += ` AND f.laundry = 1`;
      if (housekeeping) sql += ` AND f.housekeeping = 1`;
      if (ac) sql += ` AND f.ac = 1`;
      if (power_backup) sql += ` AND f.power_backup = 1`;
      if (drinking_water) sql += ` AND f.drinking_water = 1`;
      if (security) sql += ` AND f.security = 1`;
      if (study_area) sql += ` AND f.study_area = 1`;
      if (parking) sql += ` AND f.parking = 1`;

      const rows = db.prepare(sql).all(...params);

      // Process transparent cost calculation & budget filtering
      const processed = rows.map(item => {
        let roomTypes = [];
        try {
          roomTypes = JSON.parse(item.room_sharing_types);
        } catch (e) {
          roomTypes = ['single'];
        }

        const baseRent = Number(item.base_rent) || 0;
        const foodCost = item.food_included === 1 ? 0 : (item.food_charges !== null ? Number(item.food_charges) : null);
        const elecMaint = item.electricity_maintenance !== null ? Number(item.electricity_maintenance) : null;
        const otherCost = item.other_charges !== null ? Number(item.other_charges) : null;

        // An estimated monthly total can only be calculated if all mandatory charges are disclosed
        const hasMissingCharges = elecMaint === null || (item.food_included === 0 && foodCost === null);

        let estimatedMonthlyTotal = baseRent;
        if (foodCost !== null) estimatedMonthlyTotal += foodCost;
        if (elecMaint !== null) estimatedMonthlyTotal += elecMaint;
        if (otherCost !== null) estimatedMonthlyTotal += otherCost;

        // Check if verified badge has expired
        let isVerified = item.verification_status === 'verified';
        if (isVerified && item.verification_expires_at) {
          if (new Date(item.verification_expires_at).getTime() < Date.now()) {
            isVerified = false;
            // update in db to verification_expired
            db.prepare("UPDATE pg_listings SET verification_status = 'verification_expired' WHERE id = ?").run(item.id);
          }
        }

        return {
          ...item,
          room_sharing_types: roomTypes,
          has_incomplete_cost: hasMissingCharges,
          estimated_monthly_total: estimatedMonthlyTotal,
          avg_rating: item.avg_rating ? Number(Number(item.avg_rating).toFixed(1)) : null,
          review_count: Number(item.review_count) || 0,
          is_currently_verified: isVerified
        };
      }).filter(item => {
        return item.estimated_monthly_total >= minBudget && item.estimated_monthly_total <= maxBudget;
      });

      // Sorting
      if (sort === 'lowest_total') {
        processed.sort((a, b) => a.estimated_monthly_total - b.estimated_monthly_total);
      } else if (sort === 'lowest_rent') {
        processed.sort((a, b) => a.base_rent - b.base_rent);
      } else if (sort === 'highest_rating') {
        processed.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      } else if (sort === 'recently_verified') {
        processed.sort((a, b) => {
          const timeA = a.verified_at ? new Date(a.verified_at).getTime() : 0;
          const timeB = b.verified_at ? new Date(b.verified_at).getTime() : 0;
          return timeB - timeA;
        });
      } else {
        // recently_updated
        processed.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }

      return sendJson(res, 200, { count: processed.length, listings: processed });
    }

    // Specific Listing Details
    const listingMatch = pathname.match(/^\/api\/listings\/(\d+)$/);
    if (listingMatch && req.method === 'GET') {
      const pgId = parseInt(listingMatch[1]);
      const listing = db.prepare(`
        SELECT p.*, u.full_name as owner_name, u.phone as owner_phone, u.email as owner_email
        FROM pg_listings p
        JOIN users u ON p.owner_id = u.id
        WHERE p.id = ?
      `).get(pgId);

      if (!listing) return sendJson(res, 404, { error: 'PG listing not found' });

      const facilities = db.prepare('SELECT * FROM pg_facilities WHERE pg_id = ?').get(pgId);
      const photos = db.prepare('SELECT * FROM pg_photos WHERE pg_id = ? ORDER BY is_primary DESC').all(pgId);
      const reviews = db.prepare(`
        SELECT r.*, u.full_name as author_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.pg_id = ? AND r.status = 'published'
        ORDER BY r.created_at DESC
      `).all(pgId);

      // Latest completed inspection certificate details if any
      const inspection = db.prepare(`
        SELECT i.*, u.full_name as inspector_name
        FROM inspection_requests i
        LEFT JOIN users u ON i.inspector_id = u.id
        WHERE i.pg_id = ? AND i.result = 'passed'
        ORDER BY i.completed_at DESC LIMIT 1
      `).get(pgId);

      let checklist = [];
      if (inspection && inspection.checklist_data) {
        try {
          checklist = JSON.parse(inspection.checklist_data);
        } catch (e) {}
      }

      // Cost calculation
      const baseRent = Number(listing.base_rent) || 0;
      const foodCost = listing.food_included === 1 ? 0 : (listing.food_charges !== null ? Number(listing.food_charges) : null);
      const elecMaint = listing.electricity_maintenance !== null ? Number(listing.electricity_maintenance) : null;
      const otherCost = listing.other_charges !== null ? Number(listing.other_charges) : null;
      const hasMissingCharges = elecMaint === null || (listing.food_included === 0 && foodCost === null);

      let estimatedMonthlyTotal = baseRent;
      if (foodCost !== null) estimatedMonthlyTotal += foodCost;
      if (elecMaint !== null) estimatedMonthlyTotal += elecMaint;
      if (otherCost !== null) estimatedMonthlyTotal += otherCost;

      let isVerified = listing.verification_status === 'verified';
      if (isVerified && listing.verification_expires_at) {
        if (new Date(listing.verification_expires_at).getTime() < Date.now()) {
          isVerified = false;
        }
      }

      // Check if current user favorited this
      let isFavourite = false;
      if (user) {
        const fav = db.prepare('SELECT id FROM favourites WHERE user_id = ? AND pg_id = ?').get(user.id, pgId);
        isFavourite = Boolean(fav);
      }

      return sendJson(res, 200, {
        listing: {
          ...listing,
          room_sharing_types: JSON.parse(listing.room_sharing_types || '["single"]'),
          facilities: facilities || {},
          photos: photos || [],
          reviews: reviews || [],
          has_incomplete_cost: hasMissingCharges,
          estimated_monthly_total: estimatedMonthlyTotal,
          is_currently_verified: isVerified,
          is_favourite: isFavourite,
          inspection_certificate: inspection ? {
            inspection_date: inspection.completed_at,
            inspector_name: inspection.inspector_name || 'Authorized Inspector',
            payment_ref: inspection.payment_ref,
            checklist: checklist,
            expiry_date: listing.verification_expires_at,
            admin_notes: inspection.admin_notes
          } : null
        }
      });
    }

    // Compare Listings Side-by-Side
    if (pathname === '/api/listings/compare' && req.method === 'GET') {
      const idsParam = urlObj.searchParams.get('ids') || '';
      const ids = idsParam.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).slice(0, 4);

      if (ids.length === 0) {
        return sendJson(res, 200, { listings: [] });
      }

      const placeholders = ids.map(() => '?').join(',');
      const rows = db.prepare(`
        SELECT p.*, f.wifi, f.laundry, f.housekeeping, f.ac, f.power_backup,
               f.drinking_water, f.security, f.study_area, f.parking, f.cctv,
               f.attached_bathroom, f.geyser,
               (SELECT url FROM pg_photos WHERE pg_id = p.id AND is_primary = 1 LIMIT 1) as primary_photo,
               (SELECT AVG(overall_rating) FROM reviews WHERE pg_id = p.id AND status = 'published') as avg_rating,
               (SELECT COUNT(id) FROM reviews WHERE pg_id = p.id AND status = 'published') as review_count
        FROM pg_listings p
        JOIN pg_facilities f ON p.id = f.pg_id
        WHERE p.id IN (${placeholders})
      `).all(...ids);

      const comparison = rows.map(item => {
        const baseRent = Number(item.base_rent) || 0;
        const foodCost = item.food_included === 1 ? 0 : (item.food_charges !== null ? Number(item.food_charges) : null);
        const elecMaint = item.electricity_maintenance !== null ? Number(item.electricity_maintenance) : null;
        const otherCost = item.other_charges !== null ? Number(item.other_charges) : null;
        const hasMissingCharges = elecMaint === null || (item.food_included === 0 && foodCost === null);

        let estimatedTotal = baseRent;
        if (foodCost !== null) estimatedTotal += foodCost;
        if (elecMaint !== null) estimatedTotal += elecMaint;
        if (otherCost !== null) estimatedTotal += otherCost;

        return {
          ...item,
          room_sharing_types: JSON.parse(item.room_sharing_types || '[]'),
          food_charges_display: item.food_included === 1 ? 'Included in Rent' : (item.food_charges !== null ? `₹${item.food_charges}/mo` : 'Not provided'),
          electricity_display: item.electricity_maintenance !== null ? `₹${item.electricity_maintenance}/mo` : 'Not provided',
          other_charges_display: item.other_charges !== null ? `₹${item.other_charges}/mo (${item.other_charges_description || 'Charges'})` : 'Not provided',
          deposit_display: item.deposit !== null ? `₹${item.deposit}` : 'Not provided',
          one_time_fees_display: item.one_time_fees !== null ? `₹${item.one_time_fees}` : 'Not provided',
          estimated_monthly_total: estimatedTotal,
          has_incomplete_cost: hasMissingCharges,
          avg_rating: item.avg_rating ? Number(Number(item.avg_rating).toFixed(1)) : 'No reviews',
          review_count: item.review_count || 0
        };
      });

      return sendJson(res, 200, { listings: comparison });
    }

    // ==========================================
    // API: STUDENT WORKFLOWS (FAVOURITES, ENQUIRIES, VISITS)
    // ==========================================
    if (pathname === '/api/favourites' && req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });
      const favs = db.prepare(`
        SELECT f.id as fav_id, f.created_at as saved_at, p.*,
               (SELECT url FROM pg_photos WHERE pg_id = p.id AND is_primary = 1 LIMIT 1) as primary_photo,
               (SELECT AVG(overall_rating) FROM reviews WHERE pg_id = p.id AND status = 'published') as avg_rating
        FROM favourites f
        JOIN pg_listings p ON f.pg_id = p.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `).all(user.id);
      return sendJson(res, 200, { favourites: favs });
    }

    if (pathname === '/api/favourites/toggle' && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });
      const { pg_id } = await parseBody(req);
      if (!pg_id) return sendJson(res, 400, { error: 'PG ID required' });

      const existing = db.prepare('SELECT id FROM favourites WHERE user_id = ? AND pg_id = ?').get(user.id, pg_id);
      if (existing) {
        db.prepare('DELETE FROM favourites WHERE id = ?').run(existing.id);
        return sendJson(res, 200, { saved: false });
      } else {
        db.prepare('INSERT INTO favourites (user_id, pg_id, created_at) VALUES (?, ?, ?)').run(user.id, pg_id, new Date().toISOString());
        return sendJson(res, 200, { saved: true });
      }
    }

    if (pathname === '/api/enquiries' && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Please login as a student to send enquiries' });
      const { pg_id, message, move_in_date } = await parseBody(req);
      if (!pg_id || !message) {
        return sendJson(res, 400, { error: 'PG ID and message are required' });
      }

      const resInsert = db.prepare(`
        INSERT INTO enquiries (user_id, pg_id, message, move_in_date, status, created_at)
        VALUES (?, ?, ?, ?, 'new', ?)
      `).run(user.id, pg_id, message.trim(), move_in_date || '', new Date().toISOString());

      logAudit(user.id, 'ENQUIRY_CREATED', 'enquiries', Number(resInsert.lastInsertRowid), `Enquiry sent to PG #${pg_id}`);

      return sendJson(res, 201, {
        message: 'Your enquiry has been sent to the PG owner. They will review it in their dashboard.',
        enquiry_id: Number(resInsert.lastInsertRowid)
      });
    }

    if (pathname === '/api/student/enquiries' && req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });
      const enquiries = db.prepare(`
        SELECT e.*, p.title as pg_title, p.locality, p.address,
               u.full_name as owner_name, u.phone as owner_phone
        FROM enquiries e
        JOIN pg_listings p ON e.pg_id = p.id
        JOIN users u ON p.owner_id = u.id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
      `).all(user.id);
      return sendJson(res, 200, { enquiries });
    }

    if (pathname === '/api/visits' && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Please login to schedule a visit' });
      const { pg_id, preferred_date, preferred_time, notes } = await parseBody(req);
      if (!pg_id || !preferred_date || !preferred_time) {
        return sendJson(res, 400, { error: 'PG ID, preferred date, and time are required' });
      }

      const resVisit = db.prepare(`
        INSERT INTO visit_requests (user_id, pg_id, preferred_date, preferred_time, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).run(user.id, pg_id, preferred_date, preferred_time, notes || '', new Date().toISOString());

      logAudit(user.id, 'VISIT_REQUESTED', 'visit_requests', Number(resVisit.lastInsertRowid), `Visit scheduled for PG #${pg_id}`);

      return sendJson(res, 201, {
        message: 'Visit request submitted successfully. The PG owner will confirm your appointment.',
        visit_id: Number(resVisit.lastInsertRowid)
      });
    }

    if (pathname === '/api/student/visits' && req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });
      const visits = db.prepare(`
        SELECT v.*, p.title as pg_title, p.locality, p.address,
               u.full_name as owner_name, u.phone as owner_phone
        FROM visit_requests v
        JOIN pg_listings p ON v.pg_id = p.id
        JOIN users u ON p.owner_id = u.id
        WHERE v.user_id = ?
        ORDER BY v.created_at DESC
      `).all(user.id);
      return sendJson(res, 200, { visits });
    }

    // ==========================================
    // API: REVIEWS & REPUTATION INTEGRITY
    // ==========================================
    if (pathname === '/api/reviews' && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required to submit a review' });
      const {
        pg_id, cleanliness, food_quality, facilities, responsiveness,
        value_for_money, accuracy, review_text
      } = await parseBody(req);

      if (!pg_id || !review_text) {
        return sendJson(res, 400, { error: 'PG ID and written feedback are required' });
      }

      const dims = [cleanliness, food_quality, facilities, responsiveness, value_for_money, accuracy];
      for (const d of dims) {
        const val = parseFloat(d);
        if (isNaN(val) || val < 1 || val > 5) {
          return sendJson(res, 400, { error: 'All 6 rating categories must be scored between 1 and 5' });
        }
      }

      const overall = Number((dims.reduce((a, b) => a + parseFloat(b), 0) / 6).toFixed(1));

      // Check if user had a confirmed enquiry / move-in to confirm residency
      const confirmedStay = db.prepare(`
        SELECT id FROM confirmed_move_ins WHERE student_id = ? AND pg_id = ?
      `).get(user.id, pg_id);

      const isResidentVerified = Boolean(confirmedStay) ? 1 : 0;

      const resReview = db.prepare(`
        INSERT INTO reviews (
          user_id, pg_id, cleanliness, food_quality, facilities, responsiveness,
          value_for_money, accuracy, overall_rating, review_text, is_resident_verified,
          status, is_demo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?)
      `).run(
        user.id, pg_id, cleanliness, food_quality, facilities, responsiveness,
        value_for_money, accuracy, overall, review_text.trim(), isResidentVerified,
        new Date().toISOString()
      );

      logAudit(user.id, 'REVIEW_SUBMITTED', 'reviews', Number(resReview.lastInsertRowid), `Score: ${overall}`);

      return sendJson(res, 201, {
        message: 'Thank you! Your genuine review has been published.',
        review_id: Number(resReview.lastInsertRowid),
        overall_rating: overall
      });
    }

    if (pathname.match(/^\/api\/reviews\/(\d+)\/report$/) && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required to report a review' });
      const reviewId = parseInt(pathname.match(/^\/api\/reviews\/(\d+)\/report$/)[1]);
      const { reason } = await parseBody(req);

      if (!reason) return sendJson(res, 400, { error: 'Please provide a reason for reporting' });

      db.prepare(`
        INSERT INTO review_reports (review_id, reported_by_user_id, reason, status, created_at)
        VALUES (?, ?, ?, 'pending', ?)
      `).run(reviewId, user.id, reason.trim(), new Date().toISOString());

      // Update review status to reported
      db.prepare("UPDATE reviews SET status = 'reported' WHERE id = ?").run(reviewId);
      logAudit(user.id, 'REVIEW_REPORTED', 'reviews', reviewId, reason);

      return sendJson(res, 200, { message: 'Report submitted. Platform administrators will investigate.' });
    }

    // ==========================================
    // API: PG OWNER WORKFLOWS
    // ==========================================
    if (pathname === '/api/owner/listings' && req.method === 'GET') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const listings = db.prepare(`
        SELECT p.*,
               (SELECT url FROM pg_photos WHERE pg_id = p.id AND is_primary = 1 LIMIT 1) as primary_photo,
               (SELECT COUNT(id) FROM enquiries WHERE pg_id = p.id) as enquiry_count,
               (SELECT COUNT(id) FROM confirmed_move_ins WHERE pg_id = p.id) as move_in_count
        FROM pg_listings p
        WHERE p.owner_id = ?
        ORDER BY p.created_at DESC
      `).all(user.id);

      return sendJson(res, 200, { listings });
    }

    if (pathname === '/api/owner/listings' && req.method === 'POST') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const body = await parseBody(req);
      const {
        title, description, locality, address, gender_preference,
        room_sharing_types, food_included, food_charges, base_rent,
        electricity_maintenance, other_charges, other_charges_description,
        deposit, deposit_terms, one_time_fees, furnishing, facilities,
        photos, accuracy_declaration
      } = body;

      // Mandatory accuracy declaration requirement
      if (!accuracy_declaration) {
        return sendJson(res, 400, {
          error: 'You must confirm the listing accuracy declaration before publishing.'
        });
      }

      if (!title || !description || !locality || !address || !base_rent) {
        return sendJson(res, 400, { error: 'Please fill in all mandatory listing fields.' });
      }

      const now = new Date().toISOString();
      const resPg = db.prepare(`
        INSERT INTO pg_listings (
          owner_id, title, description, locality, address, gender_preference,
          room_sharing_types, food_included, food_charges, base_rent, electricity_maintenance,
          other_charges, other_charges_description, deposit, deposit_terms, one_time_fees,
          furnishing, is_available, verification_status, status, is_demo, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'not_requested', 'active', 0, ?, ?
        )
      `).run(
        user.id, title.trim(), description.trim(), locality, address.trim(),
        gender_preference || 'coliving',
        JSON.stringify(room_sharing_types || ['double']),
        food_included ? 1 : 0,
        food_charges !== undefined && food_charges !== null ? Number(food_charges) : null,
        Number(base_rent),
        electricity_maintenance !== undefined && electricity_maintenance !== null ? Number(electricity_maintenance) : null,
        other_charges !== undefined && other_charges !== null ? Number(other_charges) : null,
        other_charges_description || '',
        deposit !== undefined && deposit !== null ? Number(deposit) : null,
        deposit_terms || '',
        one_time_fees !== undefined && one_time_fees !== null ? Number(one_time_fees) : null,
        furnishing || 'fully_furnished',
        now, now
      );

      const pgId = Number(resPg.lastInsertRowid);

      // Save facilities
      const f = facilities || {};
      db.prepare(`
        INSERT INTO pg_facilities (
          pg_id, wifi, laundry, housekeeping, ac, power_backup, drinking_water,
          security, study_area, parking, cctv, attached_bathroom, geyser
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        pgId,
        f.wifi ? 1 : 0, f.laundry ? 1 : 0, f.housekeeping ? 1 : 0,
        f.ac ? 1 : 0, f.power_backup ? 1 : 0, f.drinking_water ? 1 : 0,
        f.security ? 1 : 0, f.study_area ? 1 : 0, f.parking ? 1 : 0,
        f.cctv ? 1 : 0, f.attached_bathroom ? 1 : 0, f.geyser ? 1 : 0
      );

      // Save photos
      const photoUrls = Array.isArray(photos) && photos.length > 0 ? photos : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
      ];
      photoUrls.forEach((url, i) => {
        db.prepare('INSERT INTO pg_photos (pg_id, url, caption, is_primary) VALUES (?, ?, ?, ?)').run(
          pgId, url, `${title} photo`, i === 0 ? 1 : 0
        );
      });

      logAudit(user.id, 'LISTING_CREATED', 'pg_listings', pgId, `Created "${title}"`);

      return sendJson(res, 201, {
        message: 'PG listing published successfully with transparent pricing!',
        pg_id: pgId
      });
    }

    if (pathname === '/api/owner/enquiries' && req.method === 'GET') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const enquiries = db.prepare(`
        SELECT e.*, p.title as pg_title, p.locality, u.full_name as student_name,
               u.phone as student_phone, u.email as student_email,
               (SELECT id FROM confirmed_move_ins WHERE enquiry_id = e.id) as move_in_confirmed_id
        FROM enquiries e
        JOIN pg_listings p ON e.pg_id = p.id
        JOIN users u ON e.user_id = u.id
        WHERE p.owner_id = ?
        ORDER BY e.created_at DESC
      `).all(user.id);

      return sendJson(res, 200, { enquiries });
    }

    // Owner confirms move-in & calculates ₹1,500 platform fee with strict deduplication!
    if (pathname === '/api/owner/move-ins/confirm' && req.method === 'POST') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const { enquiry_id, move_in_date } = await parseBody(req);
      if (!enquiry_id) return sendJson(res, 400, { error: 'Enquiry ID required' });

      const enquiry = db.prepare(`
        SELECT e.*, p.owner_id FROM enquiries e
        JOIN pg_listings p ON e.pg_id = p.id
        WHERE e.id = ?
      `).get(enquiry_id);

      if (!enquiry || (enquiry.owner_id !== user.id && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Enquiry not found or not your listing' });
      }

      // Check deduplication
      const existing = db.prepare('SELECT id FROM confirmed_move_ins WHERE enquiry_id = ?').get(enquiry_id);
      if (existing) {
        return sendJson(res, 400, { error: 'This move-in has already been confirmed and fee registered. Duplicate fee prevented.' });
      }

      const fee = parseInt(getSetting('move_in_fee', '1500'));
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO confirmed_move_ins (
          enquiry_id, pg_id, student_id, owner_id, move_in_date, platform_fee, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(enquiry_id, enquiry.pg_id, enquiry.user_id, enquiry.owner_id, move_in_date || now.split('T')[0], fee, now);

      db.prepare("UPDATE enquiries SET status = 'move_in_confirmed' WHERE id = ?").run(enquiry_id);

      logAudit(user.id, 'MOVE_IN_CONFIRMED', 'confirmed_move_ins', enquiry_id, `Fee ₹${fee} applied`);

      return sendJson(res, 200, {
        message: `Move-in confirmed! Standard platform success fee of ₹${fee} recorded.`,
        platform_fee: fee
      });
    }

    if (pathname === '/api/owner/move-ins' && req.method === 'GET') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const moveIns = db.prepare(`
        SELECT c.*, p.title as pg_title, u.full_name as student_name, u.phone as student_phone
        FROM confirmed_move_ins c
        JOIN pg_listings p ON c.pg_id = p.id
        JOIN users u ON c.student_id = u.id
        WHERE c.owner_id = ?
        ORDER BY c.created_at DESC
      `).all(user.id);

      return sendJson(res, 200, { moveIns });
    }

    // ==========================================
    // API: INSPECTION & VERIFICATION WORKFLOW
    // ==========================================
    // 1. Owner requests inspection
    if (pathname === '/api/inspections/request' && req.method === 'POST') {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Owner access required' });
      }

      const { pg_id } = await parseBody(req);
      if (!pg_id) return sendJson(res, 400, { error: 'PG ID required' });

      const pg = db.prepare('SELECT * FROM pg_listings WHERE id = ? AND owner_id = ?').get(pg_id, user.id);
      if (!pg && user.role !== 'admin') {
        return sendJson(res, 404, { error: 'PG listing not found or not owned by you' });
      }

      const fee = parseInt(getSetting('inspection_fee', '999'));

      // Create inspection request record
      const now = new Date().toISOString();
      const resReq = db.prepare(`
        INSERT INTO inspection_requests (
          pg_id, owner_id, fee_amount, payment_status, payment_mode, result, created_at
        ) VALUES (?, ?, ?, 'pending', 'demo', 'pending', ?)
      `).run(pg_id, user.id, fee, now);

      db.prepare("UPDATE pg_listings SET verification_status = 'payment_pending' WHERE id = ?").run(pg_id);
      logAudit(user.id, 'INSPECTION_REQUESTED', 'inspection_requests', Number(resReq.lastInsertRowid), `Fee ₹${fee}`);

      return sendJson(res, 201, {
        message: 'Inspection requested. Please proceed to payment.',
        inspection_id: Number(resReq.lastInsertRowid),
        fee_amount: fee
      });
    }

    // 2. Process inspection payment (Demo Mode or Gateway)
    if (pathname === '/api/inspections/pay' && req.method === 'POST') {
      if (!user) return sendJson(res, 401, { error: 'Authentication required' });
      const { inspection_id } = await parseBody(req);
      if (!inspection_id) return sendJson(res, 400, { error: 'Inspection request ID required' });

      const reqRow = db.prepare('SELECT * FROM inspection_requests WHERE id = ?').get(inspection_id);
      if (!reqRow) return sendJson(res, 404, { error: 'Inspection request not found' });

      const paymentRef = `DEMO_PAY_${Date.now()}`;
      db.prepare(`
        UPDATE inspection_requests
        SET payment_status = 'completed', payment_ref = ?, payment_mode = 'demo'
        WHERE id = ?
      `).run(paymentRef, inspection_id);

      db.prepare(`
        UPDATE pg_listings
        SET verification_status = 'inspection_requested'
        WHERE id = ?
      `).run(reqRow.pg_id);

      logAudit(user.id, 'INSPECTION_PAYMENT_DEMO', 'inspection_requests', inspection_id, `Paid ₹${reqRow.fee_amount} (Demo Mode)`);

      return sendJson(res, 200, {
        message: 'Payment received (Demo Mode Simulation). TrustPG Admin will now assign an authorised inspector.',
        payment_ref: paymentRef,
        status: 'inspection_requested'
      });
    }

    // 3. Inspector views assigned inspections
    if (pathname === '/api/inspector/assigned' && req.method === 'GET') {
      if (!user || (user.role !== 'inspector' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Inspector access required' });
      }

      let sql = `
        SELECT i.*, p.title as pg_title, p.locality, p.address, p.verification_status,
               u.full_name as owner_name, u.phone as owner_phone
        FROM inspection_requests i
        JOIN pg_listings p ON i.pg_id = p.id
        JOIN users u ON i.owner_id = u.id
      `;
      const params = [];
      if (user.role === 'inspector') {
        sql += ` WHERE i.inspector_id = ?`;
        params.push(user.id);
      }
      sql += ` ORDER BY i.created_at DESC`;

      const list = db.prepare(sql).all(...params);
      return sendJson(res, 200, { inspections: list });
    }

    // 4. Inspector records & submits 12-point checklist
    if (pathname.match(/^\/api\/inspector\/inspections\/(\d+)\/submit$/) && req.method === 'POST') {
      if (!user || (user.role !== 'inspector' && user.role !== 'admin')) {
        return sendJson(res, 403, { error: 'Inspector access required' });
      }

      const inspectionId = parseInt(pathname.match(/^\/api\/inspector\/inspections\/(\d+)\/submit$/)[1]);
      const { checklist_data, inspector_notes, is_draft } = await parseBody(req);

      const inspection = db.prepare('SELECT * FROM inspection_requests WHERE id = ?').get(inspectionId);
      if (!inspection) return sendJson(res, 404, { error: 'Inspection record not found' });

      const now = new Date().toISOString();
      const checklistJson = typeof checklist_data === 'string' ? checklist_data : JSON.stringify(checklist_data || []);

      // Calculate preliminary result
      let preliminaryResult = 'passed';
      try {
        const parsed = JSON.parse(checklistJson);
        const hasFailures = parsed.some(item => item.status === 'fail');
        if (hasFailures) preliminaryResult = 'failed';
      } catch (e) {}

      if (is_draft) {
        db.prepare(`
          UPDATE inspection_requests
          SET checklist_data = ?, inspector_notes = ?
          WHERE id = ?
        `).run(checklistJson, inspector_notes || '', inspectionId);

        return sendJson(res, 200, { message: 'Draft checklist saved successfully.' });
      }

      // Submit completed inspection for Admin final approval
      db.prepare(`
        UPDATE inspection_requests
        SET checklist_data = ?, inspector_notes = ?, result = ?, completed_at = ?
        WHERE id = ?
      `).run(checklistJson, inspector_notes || '', preliminaryResult, now, inspectionId);

      db.prepare(`
        UPDATE pg_listings
        SET verification_status = 'inspection_completed'
        WHERE id = ?
      `).run(inspection.pg_id);

      logAudit(user.id, 'INSPECTOR_SUBMITTED_CHECKLIST', 'inspection_requests', inspectionId, `Result: ${preliminaryResult}`);

      return sendJson(res, 200, {
        message: 'Inspection checklist submitted! Now pending Admin final approval.',
        result: preliminaryResult
      });
    }

    // ==========================================
    // API: ADMIN DASHBOARD & GOVERNANCE
    // ==========================================
    if (pathname === '/api/admin/metrics' && req.method === 'GET') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });

      const activeListings = db.prepare("SELECT COUNT(id) as count FROM pg_listings WHERE status = 'active'").get().count;
      const totalStudents = db.prepare("SELECT COUNT(id) as count FROM users WHERE role = 'student'").get().count;
      const totalOwners = db.prepare("SELECT COUNT(id) as count FROM users WHERE role = 'owner'").get().count;
      const totalEnquiries = db.prepare("SELECT COUNT(id) as count FROM enquiries").get().count;
      const confirmedMoveIns = db.prepare("SELECT COUNT(id) as count FROM confirmed_move_ins").get().count;
      const verifiedProperties = db.prepare("SELECT COUNT(id) as count FROM pg_listings WHERE verification_status = 'verified'").get().count;
      const pendingInspections = db.prepare("SELECT COUNT(id) as count FROM inspection_requests WHERE result = 'pending'").get().count;
      const failedInspections = db.prepare("SELECT COUNT(id) as count FROM inspection_requests WHERE result IN ('failed', 'reinspection')").get().count;
      const reportedReviews = db.prepare("SELECT COUNT(id) as count FROM review_reports WHERE status = 'pending'").get().count;
      const totalMoveInRevenue = db.prepare("SELECT SUM(platform_fee) as sum FROM confirmed_move_ins").get().sum || 0;

      return sendJson(res, 200, {
        metrics: {
          active_listings: activeListings,
          total_students: totalStudents,
          total_owners: totalOwners,
          total_enquiries: totalEnquiries,
          confirmed_move_ins: confirmedMoveIns,
          verified_properties: verifiedProperties,
          pending_inspections: pendingInspections,
          failed_inspections: failedInspections,
          reported_reviews: reportedReviews,
          move_in_revenue_inr: totalMoveInRevenue
        }
      });
    }

    if (pathname === '/api/admin/inspections' && req.method === 'GET') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });

      const inspections = db.prepare(`
        SELECT i.*, p.title as pg_title, p.locality, p.address, p.verification_status as pg_status,
               u_owner.full_name as owner_name, u_owner.phone as owner_phone,
               u_insp.full_name as inspector_name
        FROM inspection_requests i
        JOIN pg_listings p ON i.pg_id = p.id
        JOIN users u_owner ON i.owner_id = u_owner.id
        LEFT JOIN users u_insp ON i.inspector_id = u_insp.id
        ORDER BY i.created_at DESC
      `).all();

      const inspectors = db.prepare("SELECT id, full_name, email FROM users WHERE role = 'inspector'").all();

      return sendJson(res, 200, { inspections, inspectors });
    }

    if (pathname.match(/^\/api\/admin\/inspections\/(\d+)\/assign$/) && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const inspectionId = parseInt(pathname.match(/^\/api\/admin\/inspections\/(\d+)\/assign$/)[1]);
      const { inspector_id, scheduled_date } = await parseBody(req);

      if (!inspector_id) return sendJson(res, 400, { error: 'Inspector ID required' });

      const inspRow = db.prepare('SELECT pg_id FROM inspection_requests WHERE id = ?').get(inspectionId);
      if (!inspRow) return sendJson(res, 404, { error: 'Inspection request not found' });

      db.prepare(`
        UPDATE inspection_requests
        SET inspector_id = ?, scheduled_date = ?
        WHERE id = ?
      `).run(inspector_id, scheduled_date || new Date().toISOString().split('T')[0], inspectionId);

      db.prepare("UPDATE pg_listings SET verification_status = 'inspection_scheduled' WHERE id = ?").run(inspRow.pg_id);
      logAudit(user.id, 'INSPECTOR_ASSIGNED', 'inspection_requests', inspectionId, `Assigned to inspector #${inspector_id}`);

      return sendJson(res, 200, { message: 'Inspector assigned successfully' });
    }

    // Admin decision: APPROVE OR REJECT VERIFICATION
    if (pathname.match(/^\/api\/admin\/inspections\/(\d+)\/decision$/) && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const inspectionId = parseInt(pathname.match(/^\/api\/admin\/inspections\/(\d+)\/decision$/)[1]);
      const { decision, admin_notes } = await parseBody(req); // decision: 'approve' | 'reject' | 'reinspection'

      const inspRow = db.prepare('SELECT * FROM inspection_requests WHERE id = ?').get(inspectionId);
      if (!inspRow) return sendJson(res, 404, { error: 'Inspection request not found' });

      const validityDays = parseInt(getSetting('verification_validity_days', '180'));
      const now = new Date();
      const verifiedAt = now.toISOString();
      const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      if (decision === 'approve') {
        db.prepare(`
          UPDATE inspection_requests
          SET result = 'passed', admin_notes = ?, completed_at = ?
          WHERE id = ?
        `).run(admin_notes || 'Approved by TrustPG Admin', verifiedAt, inspectionId);

        db.prepare(`
          UPDATE pg_listings
          SET verification_status = 'verified',
              verified_at = ?,
              verification_expires_at = ?,
              inspector_id = ?,
              inspection_notes = ?
          WHERE id = ?
        `).run(verifiedAt, expiresAt, inspRow.inspector_id, admin_notes || 'All requirements passed', inspRow.pg_id);

        logAudit(user.id, 'VERIFICATION_APPROVED', 'pg_listings', inspRow.pg_id, `Valid for ${validityDays} days`);

        return sendJson(res, 200, {
          message: `TrustPG Verified badge awarded! Valid until ${expiresAt.split('T')[0]}.`,
          status: 'verified'
        });
      } else if (decision === 'reinspection') {
        db.prepare(`
          UPDATE inspection_requests
          SET result = 'reinspection', admin_notes = ?
          WHERE id = ?
        `).run(admin_notes || 'Reinspection required', inspectionId);

        db.prepare("UPDATE pg_listings SET verification_status = 'reinspection_required' WHERE id = ?").run(inspRow.pg_id);
        logAudit(user.id, 'REINSPECTION_REQUIRED', 'pg_listings', inspRow.pg_id, admin_notes);

        return sendJson(res, 200, { message: 'Marked as Reinspection Required', status: 'reinspection_required' });
      } else {
        // reject
        db.prepare(`
          UPDATE inspection_requests
          SET result = 'failed', admin_notes = ?
          WHERE id = ?
        `).run(admin_notes || 'Failed required criteria', inspectionId);

        db.prepare("UPDATE pg_listings SET verification_status = 'not_requested' WHERE id = ?").run(inspRow.pg_id);
        logAudit(user.id, 'VERIFICATION_REJECTED', 'pg_listings', inspRow.pg_id, admin_notes);

        return sendJson(res, 200, { message: 'Verification rejected', status: 'not_requested' });
      }
    }

    // Admin Reports & Reviews moderation
    if (pathname === '/api/admin/reports' && req.method === 'GET') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });

      const reports = db.prepare(`
        SELECT rep.*, r.review_text, r.overall_rating, p.title as pg_title,
               u_rep.full_name as reported_by_name, u_author.full_name as author_name
        FROM review_reports rep
        JOIN reviews r ON rep.review_id = r.id
        JOIN pg_listings p ON r.pg_id = p.id
        JOIN users u_rep ON rep.reported_by_user_id = u_rep.id
        JOIN users u_author ON r.user_id = u_author.id
        ORDER BY rep.created_at DESC
      `).all();

      return sendJson(res, 200, { reports });
    }

    if (pathname.match(/^\/api\/admin\/reports\/(\d+)\/action$/) && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const reportId = parseInt(pathname.match(/^\/api\/admin\/reports\/(\d+)\/action$/)[1]);
      const { action } = await parseBody(req); // 'dismiss' | 'hide_review'

      const rep = db.prepare('SELECT review_id FROM review_reports WHERE id = ?').get(reportId);
      if (!rep) return sendJson(res, 404, { error: 'Report not found' });

      if (action === 'hide_review') {
        db.prepare("UPDATE reviews SET status = 'hidden' WHERE id = ?").run(rep.review_id);
        db.prepare("UPDATE review_reports SET status = 'actioned' WHERE id = ?").run(reportId);
        logAudit(user.id, 'REVIEW_HIDDEN', 'reviews', rep.review_id, 'Actioned report');
      } else {
        db.prepare("UPDATE reviews SET status = 'published' WHERE id = ?").run(rep.review_id);
        db.prepare("UPDATE review_reports SET status = 'dismissed' WHERE id = ?").run(reportId);
        logAudit(user.id, 'REPORT_DISMISSED', 'review_reports', reportId, 'Dismissed by admin');
      }

      return sendJson(res, 200, { message: `Report ${action} processed successfully` });
    }

    // Admin Settings Configuration (Fees & Validity)
    if (pathname === '/api/admin/settings' && req.method === 'GET') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const settings = db.prepare('SELECT * FROM platform_settings').all();
      return sendJson(res, 200, { settings });
    }

    if (pathname === '/api/admin/settings' && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const { inspection_fee, move_in_fee, verification_validity_days } = await parseBody(req);
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO platform_settings (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `);

      if (inspection_fee) stmt.run('inspection_fee', String(inspection_fee), now);
      if (move_in_fee) stmt.run('move_in_fee', String(move_in_fee), now);
      if (verification_validity_days) stmt.run('verification_validity_days', String(verification_validity_days), now);

      logAudit(user.id, 'SETTINGS_UPDATED', 'platform_settings', 0, 'Configured fee/validity parameters');

      return sendJson(res, 200, { message: 'Platform settings updated successfully' });
    }

    // Admin Audit Logs
    if (pathname === '/api/admin/audit-logs' && req.method === 'GET') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      const logs = db.prepare(`
        SELECT a.*, u.full_name as user_name, u.role as user_role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC LIMIT 50
      `).all();
      return sendJson(res, 200, { logs });
    }

    // Admin Demo Data Management
    if (pathname === '/api/admin/demo-data/reseed' && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      seedDatabase();
      return sendJson(res, 200, { message: 'Demo listings and accounts reseeded successfully' });
    }

    if (pathname === '/api/admin/demo-data/purge' && req.method === 'POST') {
      if (!user || user.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });
      db.exec("DELETE FROM pg_listings WHERE is_demo = 1; DELETE FROM reviews WHERE is_demo = 1;");
      logAudit(user.id, 'DEMO_DATA_PURGED', 'pg_listings', 0, 'Removed all demo entries');
      return sendJson(res, 200, { message: 'All demo listings and sample reviews purged successfully' });
    }

    // ==========================================
    // STATIC FILE SERVING / SPA FALLBACK
    // ==========================================
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });

  } catch (err) {
    console.error('Server internal error:', err);
    sendJson(res, 500, { error: 'Internal Server Error', details: err.message });
  }
}

// Create HTTP server using the handler
const server = http.createServer(handleRequest);

// Start Server locally
if (require.main === module) {
  initSchema();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustPG production-ready server running at http://127.0.0.1:${PORT}`);
  });
}

module.exports = { server, handleRequest, PORT };
