// seed.js - Seeds realistic Bengaluru PG listings, demo accounts, and inspection records
const { db, initSchema, hashPassword } = require('./db.js');

function seedDatabase() {
  initSchema();

  console.log('Seeding TrustPG database with demo data...');

  // Clear existing data safely
  db.exec(`
    DELETE FROM sessions;
    DELETE FROM audit_logs;
    DELETE FROM confirmed_move_ins;
    DELETE FROM inspection_requests;
    DELETE FROM review_reports;
    DELETE FROM reviews;
    DELETE FROM visit_requests;
    DELETE FROM enquiries;
    DELETE FROM favourites;
    DELETE FROM pg_photos;
    DELETE FROM pg_facilities;
    DELETE FROM pg_listings;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('users', 'pg_listings', 'enquiries', 'reviews', 'inspection_requests', 'confirmed_move_ins', 'favourites', 'visit_requests', 'pg_photos');
  `);

  const now = new Date();
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const next150Days = new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Seed Users
  const userInsert = db.prepare(`
    INSERT INTO users (email, password_hash, salt, full_name, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const pass123 = hashPassword('Password@123');

  const studentUser = userInsert.run(
    'student@trustpg.com',
    pass123.hash,
    pass123.salt,
    'Priya Sharma',
    '+91 98765 43210',
    'student',
    past30Days
  );

  const ownerUser = userInsert.run(
    'owner@trustpg.com',
    pass123.hash,
    pass123.salt,
    'Rajesh Gowda',
    '+91 98450 12345',
    'owner',
    past30Days
  );

  const inspectorUser = userInsert.run(
    'inspector@trustpg.com',
    pass123.hash,
    pass123.salt,
    'Anand Kumar',
    '+91 98111 22334',
    'inspector',
    past30Days
  );

  const adminUser = userInsert.run(
    'admin@trustpg.com',
    pass123.hash,
    pass123.salt,
    'TrustPG Admin Team',
    '+91 80 4000 9000',
    'admin',
    past30Days
  );

  const studentId = Number(studentUser.lastInsertRowid);
  const ownerId = Number(ownerUser.lastInsertRowid);
  const inspectorId = Number(inspectorUser.lastInsertRowid);
  const adminId = Number(adminUser.lastInsertRowid);

  // 2. Realistic 10 Seed PGs in Bengaluru
  const demoListings = [
    {
      title: 'Greenview Luxury Executive PG for Men & Women',
      description: 'Well-ventilated, newly constructed co-living space near Sony World Signal. High-speed Wi-Fi (300 Mbps), three nutritious home-cooked meals every day, bi-weekly linen change, and biometric entry.',
      locality: 'Koramangala',
      address: '14, 4th Cross, 5th Block, Near Jyoti Nivas College & Sony World Signal, Koramangala, Bengaluru 560095',
      gender_preference: 'coliving',
      room_sharing_types: JSON.stringify(['single', 'double']),
      food_included: 1,
      food_charges: 0,
      base_rent: 12500,
      electricity_maintenance: 800,
      other_charges: 200,
      other_charges_description: 'Monthly water filter & common area maintenance',
      deposit: 20000,
      deposit_terms: '100% refundable upon 30 days notice minus ₹1,000 deep cleaning fee',
      one_time_fees: 1000,
      furnishing: 'fully_furnished',
      verification_status: 'verified',
      verified_at: past30Days,
      verification_expires_at: next150Days,
      inspector_id: inspectorId,
      inspection_notes: 'All 12 advertised parameters verified on-site. Wi-Fi tested at 310 Mbps. Clean kitchen, commercial RO unit operational, functioning biometric access.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 1, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Sai Comforts Women PG near Christ University',
      description: 'Safe and secure residence exclusively for female students and interns. 5 minutes walk from Christ University Main Gate. 24/7 female warden on premise, fingerprint lock, North & South Indian meals included.',
      locality: 'BTM Layout',
      address: 'Plot 42, 7th Main, 2nd Stage, Near Christ University & Forum Mall, BTM Layout, Bengaluru 560076',
      gender_preference: 'women',
      room_sharing_types: JSON.stringify(['double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 9500,
      electricity_maintenance: 500,
      other_charges: null, // "Not provided" demonstration
      other_charges_description: null,
      deposit: 15000,
      deposit_terms: 'Refundable within 7 banking days after room inspection',
      one_time_fees: 500,
      furnishing: 'fully_furnished',
      verification_status: 'verified',
      verified_at: past30Days,
      verification_expires_at: next150Days,
      inspector_id: inspectorId,
      inspection_notes: 'Physical address, rooms, and security verified. Resident warden verified. Clean water dispenser checked.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 0, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 0, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'HSR Silicon Residency for Tech Interns & Students',
      description: 'Ideal for students interning in HSR Layout startups. Dedicated ergonomic study desks, fiber optic Wi-Fi with dual ISP failover, laundry machines, and quiet hours after 10 PM.',
      locality: 'HSR Layout',
      address: '88, 27th Main Road, Sector 1, HSR Layout, Bengaluru 560102',
      gender_preference: 'coliving',
      room_sharing_types: JSON.stringify(['single', 'double']),
      food_included: 0,
      food_charges: 2500, // Optional food plan
      base_rent: 14000,
      electricity_maintenance: 1000,
      other_charges: 300,
      other_charges_description: 'High-speed internet surcharge',
      deposit: 25000,
      deposit_terms: 'Refundable security deposit against 1 month notice',
      one_time_fees: 1500,
      furnishing: 'fully_furnished',
      verification_status: 'verified',
      verified_at: past30Days,
      verification_expires_at: next150Days,
      inspector_id: inspectorId,
      inspection_notes: 'High-speed fiber connection confirmed. Power backup tested with full load. Study area in pristine condition.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 1, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'CyberNest Men PG Electronic City Phase 1',
      description: 'Affordable, reliable men PG located directly behind Infosys gate. Easy walk to Wipro, PES University EC Campus, and tech parks. Self-cooking kitchen facility available.',
      locality: 'Electronic City',
      address: '23, Neeladri Road, Electronic City Phase 1, Bengaluru 560100',
      gender_preference: 'men',
      room_sharing_types: JSON.stringify(['double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 7500,
      electricity_maintenance: 400,
      other_charges: null, // "Not provided"
      other_charges_description: null,
      deposit: 10000,
      deposit_terms: 'Refundable deposit upon 30 days departure notice',
      one_time_fees: 500,
      furnishing: 'semi_furnished',
      verification_status: 'not_requested',
      verified_at: null,
      verification_expires_at: null,
      inspector_id: null,
      inspection_notes: null,
      facilities: { wifi: 1, laundry: 0, housekeeping: 1, ac: 0, power_backup: 1, drinking_water: 1, security: 1, study_area: 0, parking: 1, cctv: 1, attached_bathroom: 0, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'ITPL Metro Student Haven Women PG',
      description: 'Situated within 400m of ITPL Metro Station. Spacious balconies, natural ventilation, 3 times pure vegetarian meals, strict gate timings at 10 PM, CCTV surveillance on all common floors.',
      locality: 'Whitefield',
      address: '102, Pattandur Agrahara, Near ITPL Metro, Whitefield, Bengaluru 560066',
      gender_preference: 'women',
      room_sharing_types: JSON.stringify(['single', 'double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 11000,
      electricity_maintenance: 600,
      other_charges: 150,
      other_charges_description: 'Drinking water dispenser sanitisation charge',
      deposit: 18000,
      deposit_terms: '100% refundable with 45-day notice',
      one_time_fees: 1000,
      furnishing: 'fully_furnished',
      verification_status: 'inspection_requested',
      verified_at: null,
      verification_expires_at: null,
      inspector_id: null,
      inspection_notes: 'Owner has requested verification and paid inspection fee. Waiting for inspector assignment.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 0, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 0, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Sri Balaji Coliving PG Marathahalli Bridge',
      description: 'Budget-friendly PG right on the Outer Ring Road service road. Great bus connectivity to Bellandur, Embassy Tech Village, and Marathahalli market. South Indian & North Indian food.',
      locality: 'Marathahalli',
      address: '5, Outer Ring Road, Near Kalamandir, Marathahalli, Bengaluru 560037',
      gender_preference: 'coliving',
      room_sharing_types: JSON.stringify(['double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 8000,
      electricity_maintenance: 500,
      other_charges: 100,
      other_charges_description: 'Common garbage collection fee',
      deposit: 12000,
      deposit_terms: 'Deduction of ₹1,000 painting charges on exit',
      one_time_fees: null, // "Not provided"
      furnishing: 'semi_furnished',
      verification_status: 'reinspection_required',
      verified_at: null,
      verification_expires_at: null,
      inspector_id: inspectorId,
      inspection_notes: 'Wi-Fi router on 3rd floor was non-functional during first inspection. Power backup battery required replacement. Reinspection pending.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 0, power_backup: 0, drinking_water: 1, security: 1, study_area: 0, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: '100ft Road Elite Coliving Indiranagar',
      description: 'Chic, premium accommodation in the heart of Indiranagar. Rooftop cafeteria, gym equipment, weekly movie nights, individual work stations, and proximity to Indiranagar Metro.',
      locality: 'Indiranagar',
      address: '77, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      gender_preference: 'coliving',
      room_sharing_types: JSON.stringify(['single', 'double']),
      food_included: 0,
      food_charges: 3500, // Gourmet kitchen
      base_rent: 18000,
      electricity_maintenance: 1200,
      other_charges: 500,
      other_charges_description: 'Gym & Rooftop recreation maintenance',
      deposit: 35000,
      deposit_terms: 'Full refund after 1 month notice via NEFT',
      one_time_fees: 2000,
      furnishing: 'fully_furnished',
      verification_status: 'verified',
      verified_at: past30Days,
      verification_expires_at: next150Days,
      inspector_id: inspectorId,
      inspection_notes: 'Inspected on-site. Gym, elevator, fire extinguishers, water filtration plant, and all individual air conditioners in excellent order.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 1, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Ashoka Heritage PG for Women Jayanagar 4th Block',
      description: 'Quiet, residential locality close to RV College and NMKRV College. Homely atmosphere, strictly non-commercial, fresh vegetarian breakfast and dinner, rooftop solar water heater.',
      locality: 'Jayanagar',
      address: '320, 9th Main Road, 4th Block, Jayanagar, Bengaluru 560011',
      gender_preference: 'women',
      room_sharing_types: JSON.stringify(['single', 'double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 10500,
      electricity_maintenance: 400,
      other_charges: null, // "Not provided"
      other_charges_description: null,
      deposit: 16000,
      deposit_terms: 'Refundable with 30-day notice',
      one_time_fees: 750,
      furnishing: 'fully_furnished',
      verification_status: 'verified',
      verified_at: past30Days,
      verification_expires_at: next150Days,
      inspector_id: inspectorId,
      inspection_notes: 'Property and facilities verified. Resident warden verified. Solar water heaters and backup power checked.',
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 0, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'St. John’s Medical Student Lodge Koramangala',
      description: 'Dedicated quiet accommodation tailor-made for medical, nursing, and dental students. 300 meters from St. John’s Medical College Hospital. 24-hour library room with power backup.',
      locality: 'Koramangala',
      address: '19, 8th Main Road, 3rd Block, Koramangala, Bengaluru 560034',
      gender_preference: 'coliving',
      room_sharing_types: JSON.stringify(['single', 'double']),
      food_included: 1,
      food_charges: 0,
      base_rent: 13500,
      electricity_maintenance: 750,
      other_charges: 250,
      other_charges_description: 'Library & study room air-conditioning fee',
      deposit: 22000,
      deposit_terms: '100% refundable upon 1 month notice',
      one_time_fees: 1000,
      furnishing: 'fully_furnished',
      verification_status: 'not_requested',
      verified_at: null,
      verification_expires_at: null,
      inspector_id: null,
      inspection_notes: null,
      facilities: { wifi: 1, laundry: 1, housekeeping: 1, ac: 1, power_backup: 1, drinking_water: 1, security: 1, study_area: 1, parking: 1, cctv: 1, attached_bathroom: 1, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'TechZone Budget Men PG Marathahalli ORR',
      description: 'Ultra-economical sharing accommodation for interns and job seekers. Basic amenities, clean beds, daily cleaning, hot water in mornings, food included.',
      locality: 'Marathahalli',
      address: '12, Munnekollal, Near Kundalahalli Gate, Marathahalli, Bengaluru 560037',
      gender_preference: 'men',
      room_sharing_types: JSON.stringify(['double', 'triple']),
      food_included: 1,
      food_charges: 0,
      base_rent: 6800,
      electricity_maintenance: 350,
      other_charges: null, // "Not provided"
      other_charges_description: null,
      deposit: 8000,
      deposit_terms: 'Refundable upon 30 days notice',
      one_time_fees: 500,
      furnishing: 'semi_furnished',
      verification_status: 'not_requested',
      verified_at: null,
      verification_expires_at: null,
      inspector_id: null,
      inspection_notes: null,
      facilities: { wifi: 1, laundry: 0, housekeeping: 1, ac: 0, power_backup: 1, drinking_water: 1, security: 1, study_area: 0, parking: 1, cctv: 1, attached_bathroom: 0, geyser: 1 },
      photos: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  const pgInsert = db.prepare(`
    INSERT INTO pg_listings (
      owner_id, title, description, locality, address, gender_preference,
      room_sharing_types, food_included, food_charges, base_rent, electricity_maintenance,
      other_charges, other_charges_description, deposit, deposit_terms, one_time_fees,
      furnishing, is_available, verification_status, verified_at, verification_expires_at,
      inspector_id, inspection_notes, status, is_demo, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 'active', 1, ?, ?
    )
  `);

  const facInsert = db.prepare(`
    INSERT INTO pg_facilities (
      pg_id, wifi, laundry, housekeeping, ac, power_backup, drinking_water,
      security, study_area, parking, cctv, attached_bathroom, geyser
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const photoInsert = db.prepare(`
    INSERT INTO pg_photos (pg_id, url, caption, is_primary)
    VALUES (?, ?, ?, ?)
  `);

  const pgIds = [];

  for (const item of demoListings) {
    const res = pgInsert.run(
      ownerId,
      item.title,
      item.description,
      item.locality,
      item.address,
      item.gender_preference,
      item.room_sharing_types,
      item.food_included,
      item.food_charges,
      item.base_rent,
      item.electricity_maintenance,
      item.other_charges,
      item.other_charges_description,
      item.deposit,
      item.deposit_terms,
      item.one_time_fees,
      item.furnishing,
      item.verification_status,
      item.verified_at,
      item.verification_expires_at,
      item.inspector_id,
      item.inspection_notes,
      past30Days,
      now.toISOString()
    );

    const pgId = Number(res.lastInsertRowid);
    pgIds.push(pgId);

    // Facilities
    const f = item.facilities;
    facInsert.run(
      pgId,
      f.wifi, f.laundry, f.housekeeping, f.ac, f.power_backup,
      f.drinking_water, f.security, f.study_area, f.parking,
      f.cctv, f.attached_bathroom, f.geyser
    );

    // Photos
    item.photos.forEach((url, idx) => {
      photoInsert.run(pgId, url, `${item.title} - Photo ${idx + 1}`, idx === 0 ? 1 : 0);
    });
  }

  // 3. Seed Realistic Inspection Checklist for Verified PG #1 (Greenview Luxury PG)
  const checklist12 = [
    { id: 1, title: 'Property Address & Locality Match', status: 'pass', notes: 'Matches listing: 14, 4th Cross, 5th Block Koramangala' },
    { id: 2, title: 'Advertised Room Types & Bed Count', status: 'pass', notes: 'Single and double sharing rooms verified as advertised' },
    { id: 3, title: 'Room Cleanliness & Ventilation', status: 'pass', notes: 'Spacious windows, clean mattresses, spotless flooring' },
    { id: 4, title: 'Wi-Fi Speed & Connectivity', status: 'pass', notes: 'Speed test clocked 310 Mbps on 5GHz band' },
    { id: 5, title: 'Food Hygiene & Arrangements', status: 'pass', notes: 'Separate dining hall, stainless steel kitchen, clean cooking area' },
    { id: 6, title: 'Laundry Facilities', status: 'pass', notes: '3 operational front-load washing machines in terrace area' },
    { id: 7, title: 'Housekeeping Schedule', status: 'pass', notes: 'Daily logbook inspected, trash bins cleared daily' },
    { id: 8, title: 'Drinking Water Purity (RO/Filter)', status: 'pass', notes: 'Commercial 50 LPH RO water purifier with TDS meter reading 85 ppm' },
    { id: 9, title: 'Advertised Common Facilities', status: 'pass', notes: 'Lounge area, refrigerator, microwave in common pantry present' },
    { id: 10, title: 'Stated Security & CCTV Coverage', status: 'pass', notes: 'Biometric gate entry active, 16 CCTV cameras operational' },
    { id: 11, title: 'Accuracy of Listing Photographs', status: 'pass', notes: 'Room layout and furnishings faithfully represent the photographs' },
    { id: 12, title: 'Disclosure of Rent, Deposit & House Rules', status: 'pass', notes: 'Notice board displays full fee schedule and refund terms' }
  ];

  db.prepare(`
    INSERT INTO inspection_requests (
      pg_id, owner_id, fee_amount, payment_status, payment_ref, payment_mode,
      inspector_id, scheduled_date, checklist_data, inspector_notes, result,
      admin_notes, created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    pgIds[0],
    ownerId,
    999,
    'completed',
    'DEMO_PAY_KOR_001',
    'demo',
    inspectorId,
    past30Days,
    JSON.stringify(checklist12),
    'Excellent accommodation standards. Well maintained and transparent management.',
    'passed',
    'Approved by Admin Team following thorough verification check.',
    past30Days,
    past30Days
  );

  // 4. Seed Demo Reviews (Clearly marked is_demo: 1)
  const reviewInsert = db.prepare(`
    INSERT INTO reviews (
      user_id, pg_id, cleanliness, food_quality, facilities, responsiveness,
      value_for_money, accuracy, overall_rating, review_text, is_resident_verified,
      status, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  reviewInsert.run(
    studentId,
    pgIds[0],
    4.5, 4.0, 5.0, 4.5, 4.0, 5.0, 4.5,
    'Sample Review — Demo Only: Stayed here during my 6-month internship. The internet connection is genuinely fast and power backup never failed during monsoon power cuts.',
    1,
    'published',
    past30Days
  );

  reviewInsert.run(
    studentId,
    pgIds[1],
    4.0, 4.5, 4.0, 4.0, 4.5, 4.5, 4.3,
    'Sample Review — Demo Only: Very convenient for Christ University students. Food is homely and the warden is very cooperative.',
    1,
    'published',
    past30Days
  );

  // 5. Seed Demo Enquiry & Confirmed Move-in to demonstrate ₹1,500 platform fee
  const enqRes = db.prepare(`
    INSERT INTO enquiries (user_id, pg_id, message, move_in_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    pgIds[0],
    'Hi, I am starting college next month. Is a double sharing room available on 2nd floor?',
    '2026-11-01',
    'move_in_confirmed',
    past30Days
  );
  const enquiryId = Number(enqRes.lastInsertRowid);

  db.prepare(`
    INSERT INTO confirmed_move_ins (
      enquiry_id, pg_id, student_id, owner_id, move_in_date, platform_fee, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    enquiryId,
    pgIds[0],
    studentId,
    ownerId,
    '2026-11-01',
    1500,
    'collected',
    past30Days
  );

  // 6. Seed Demo Visit Request
  db.prepare(`
    INSERT INTO visit_requests (user_id, pg_id, preferred_date, preferred_time, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    pgIds[1],
    '2026-10-25',
    '11:00 AM',
    'Would like to inspect the double sharing room with my parents',
    'confirmed',
    past30Days
  );

  // 7. Seed Demo Favourite
  db.prepare(`
    INSERT INTO favourites (user_id, pg_id, created_at)
    VALUES (?, ?, ?)
  `).run(studentId, pgIds[0], past30Days);

  console.log('TrustPG database seeded successfully with 10 PGs, demo accounts, and inspection records.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
