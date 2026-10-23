/**
 * TrustPG Frontend Application Architecture
 * Pure Modern JS Client-Side Controller & Router
 */

const TrustPG = (() => {
  // Application State
  const state = {
    currentUser: null,
    compareList: JSON.parse(localStorage.getItem('trustpg_compare') || '[]'),
    listings: [],
    currentListing: null,
    activeFilters: {
      locality: 'all',
      minBudget: 0,
      maxBudget: 35000,
      gender: 'any',
      roomType: 'any',
      food: 'any',
      verifiedOnly: false,
      sort: 'lowest_total'
    }
  };

  
  // Embedded fallback data for serverless/static Vercel hosting
  const CLIENT_DEMO_PGS = [
  {
    "id": 1,
    "title": "Greenview Luxury Executive PG for Men & Women",
    "description": "Well-ventilated, newly constructed co-living space near Sony World Signal. High-speed Wi-Fi (300 Mbps), three nutritious home-cooked meals every day, bi-weekly linen change, and biometric entry.",
    "locality": "Koramangala",
    "address": "14, 4th Cross, 5th Block, Near Jyoti Nivas College & Sony World Signal, Koramangala, Bengaluru 560095",
    "gender_preference": "coliving",
    "room_sharing_types": [
      "single",
      "double"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 12500,
    "electricity_maintenance": 800,
    "other_charges": 200,
    "other_charges_description": "Monthly water filter & common area maintenance",
    "deposit": 20000,
    "deposit_terms": "100% refundable upon 30 days notice minus ₹1,000 deep cleaning fee",
    "one_time_fees": 1000,
    "furnishing": "fully_furnished",
    "verification_status": "verified",
    "is_currently_verified": true,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 13500,
    "avg_rating": 4.5,
    "review_count": 8,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 1,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
        "caption": "Spacious Deluxe Room"
      },
      {
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
        "caption": "Twin Bed Sharing"
      },
      {
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        "caption": "Clean Dining Area"
      }
    ]
  },
  {
    "id": 2,
    "title": "Sai Comforts Women PG near Christ University",
    "description": "Safe and secure residence exclusively for female students and interns. 5 minutes walk from Christ University Main Gate. 24/7 female warden on premise, fingerprint lock, North & South Indian meals included.",
    "locality": "BTM Layout",
    "address": "Plot 42, 7th Main, 2nd Stage, Near Christ University & Forum Mall, BTM Layout, Bengaluru 560076",
    "gender_preference": "women",
    "room_sharing_types": [
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 9500,
    "electricity_maintenance": 500,
    "other_charges": null,
    "other_charges_description": null,
    "deposit": 15000,
    "deposit_terms": "Refundable within 7 banking days after room inspection",
    "one_time_fees": 500,
    "furnishing": "fully_furnished",
    "verification_status": "verified",
    "is_currently_verified": true,
    "has_incomplete_cost": true,
    "estimated_monthly_total": 10000,
    "avg_rating": 4.3,
    "review_count": 12,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 0,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "caption": "Well-lit room"
      }
    ]
  },
  {
    "id": 3,
    "title": "HSR Silicon Residency for Tech Interns & Students",
    "description": "Ideal for students interning in HSR Layout startups. Dedicated ergonomic study desks, fiber optic Wi-Fi with dual ISP failover, laundry machines, and quiet hours after 10 PM.",
    "locality": "HSR Layout",
    "address": "88, 27th Main Road, Sector 1, HSR Layout, Bengaluru 560102",
    "gender_preference": "coliving",
    "room_sharing_types": [
      "single",
      "double"
    ],
    "food_included": 0,
    "food_charges": 2500,
    "base_rent": 14000,
    "electricity_maintenance": 1000,
    "other_charges": 300,
    "other_charges_description": "High-speed internet surcharge",
    "deposit": 25000,
    "deposit_terms": "Refundable security deposit against 1 month notice",
    "one_time_fees": 1500,
    "furnishing": "fully_furnished",
    "verification_status": "verified",
    "is_currently_verified": true,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 17800,
    "avg_rating": 4.7,
    "review_count": 15,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 1,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "caption": "Study Desk"
      }
    ]
  },
  {
    "id": 4,
    "title": "CyberNest Men PG Electronic City Phase 1",
    "description": "Affordable, reliable men PG located directly behind Infosys gate. Easy walk to Wipro, PES University EC Campus, and tech parks. Self-cooking kitchen facility available.",
    "locality": "Electronic City",
    "address": "23, Neeladri Road, Electronic City Phase 1, Bengaluru 560100",
    "gender_preference": "men",
    "room_sharing_types": [
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 7500,
    "electricity_maintenance": 400,
    "other_charges": null,
    "other_charges_description": null,
    "deposit": 10000,
    "deposit_terms": "Refundable deposit upon 30 days departure notice",
    "one_time_fees": 500,
    "furnishing": "semi_furnished",
    "verification_status": "not_requested",
    "is_currently_verified": false,
    "has_incomplete_cost": true,
    "estimated_monthly_total": 7900,
    "avg_rating": 4,
    "review_count": 5,
    "facilities": {
      "wifi": 1,
      "laundry": 0,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 0,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 0,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
        "caption": "Room"
      }
    ]
  },
  {
    "id": 5,
    "title": "ITPL Metro Student Haven Women PG",
    "description": "Situated within 400m of ITPL Metro Station. Spacious balconies, natural ventilation, 3 times pure vegetarian meals, strict gate timings at 10 PM, CCTV surveillance on all common floors.",
    "locality": "Whitefield",
    "address": "102, Pattandur Agrahara, Near ITPL Metro, Whitefield, Bengaluru 560066",
    "gender_preference": "women",
    "room_sharing_types": [
      "single",
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 11000,
    "electricity_maintenance": 600,
    "other_charges": 150,
    "other_charges_description": "Drinking water dispenser sanitisation charge",
    "deposit": 18000,
    "deposit_terms": "100% refundable with 45-day notice",
    "one_time_fees": 1000,
    "furnishing": "fully_furnished",
    "verification_status": "inspection_requested",
    "is_currently_verified": false,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 11750,
    "avg_rating": 4.2,
    "review_count": 6,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 0,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        "caption": "Balcony Room"
      }
    ]
  },
  {
    "id": 6,
    "title": "Sri Balaji Coliving PG Marathahalli Bridge",
    "description": "Budget-friendly PG right on the Outer Ring Road service road. Great bus connectivity to Bellandur, Embassy Tech Village, and Marathahalli market. South Indian & North Indian food.",
    "locality": "Marathahalli",
    "address": "5, Outer Ring Road, Near Kalamandir, Marathahalli, Bengaluru 560037",
    "gender_preference": "coliving",
    "room_sharing_types": [
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 8000,
    "electricity_maintenance": 500,
    "other_charges": 100,
    "other_charges_description": "Common garbage collection fee",
    "deposit": 12000,
    "deposit_terms": "Deduction of ₹1,000 painting charges on exit",
    "one_time_fees": null,
    "furnishing": "semi_furnished",
    "verification_status": "reinspection_required",
    "is_currently_verified": false,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 8600,
    "avg_rating": 3.8,
    "review_count": 4,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 0,
      "drinking_water": 1,
      "security": 1,
      "study_area": 0,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
        "caption": "Co-living Hall"
      }
    ]
  },
  {
    "id": 7,
    "title": "100ft Road Elite Coliving Indiranagar",
    "description": "Chic, premium accommodation in the heart of Indiranagar. Rooftop cafeteria, gym equipment, weekly movie nights, individual work stations, and proximity to Indiranagar Metro.",
    "locality": "Indiranagar",
    "address": "77, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
    "gender_preference": "coliving",
    "room_sharing_types": [
      "single",
      "double"
    ],
    "food_included": 0,
    "food_charges": 3500,
    "base_rent": 18000,
    "electricity_maintenance": 1200,
    "other_charges": 500,
    "other_charges_description": "Gym & Rooftop recreation maintenance",
    "deposit": 35000,
    "deposit_terms": "Full refund after 1 month notice via NEFT",
    "one_time_fees": 2000,
    "furnishing": "fully_furnished",
    "verification_status": "verified",
    "is_currently_verified": true,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 23200,
    "avg_rating": 4.8,
    "review_count": 22,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 1,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "caption": "Executive Suite"
      }
    ]
  },
  {
    "id": 8,
    "title": "Ashoka Heritage PG for Women Jayanagar 4th Block",
    "description": "Quiet, residential locality close to RV College and NMKRV College. Homely atmosphere, strictly non-commercial, fresh vegetarian breakfast and dinner, rooftop solar water heater.",
    "locality": "Jayanagar",
    "address": "320, 9th Main Road, 4th Block, Jayanagar, Bengaluru 560011",
    "gender_preference": "women",
    "room_sharing_types": [
      "single",
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 10500,
    "electricity_maintenance": 400,
    "other_charges": null,
    "other_charges_description": null,
    "deposit": 16000,
    "deposit_terms": "Refundable with 30-day notice",
    "one_time_fees": 750,
    "furnishing": "fully_furnished",
    "verification_status": "verified",
    "is_currently_verified": true,
    "has_incomplete_cost": true,
    "estimated_monthly_total": 10900,
    "avg_rating": 4.6,
    "review_count": 14,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "caption": "Bedroom"
      }
    ]
  },
  {
    "id": 9,
    "title": "St. John’s Medical Student Lodge Koramangala",
    "description": "Dedicated quiet accommodation tailor-made for medical, nursing, and dental students. 300 meters from St. John’s Medical College Hospital. 24-hour library room with power backup.",
    "locality": "Koramangala",
    "address": "19, 8th Main Road, 3rd Block, Koramangala, Bengaluru 560034",
    "gender_preference": "coliving",
    "room_sharing_types": [
      "single",
      "double"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 13500,
    "electricity_maintenance": 750,
    "other_charges": 250,
    "other_charges_description": "Library & study room air-conditioning fee",
    "deposit": 22000,
    "deposit_terms": "100% refundable upon 1 month notice",
    "one_time_fees": 1000,
    "furnishing": "fully_furnished",
    "verification_status": "not_requested",
    "is_currently_verified": false,
    "has_incomplete_cost": false,
    "estimated_monthly_total": 14500,
    "avg_rating": 4.4,
    "review_count": 9,
    "facilities": {
      "wifi": 1,
      "laundry": 1,
      "housekeeping": 1,
      "ac": 1,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 1,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 1,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
        "caption": "Quiet study room"
      }
    ]
  },
  {
    "id": 10,
    "title": "TechZone Budget Men PG Marathahalli ORR",
    "description": "Ultra-economical sharing accommodation for interns and job seekers. Basic amenities, clean beds, daily cleaning, hot water in mornings, food included.",
    "locality": "Marathahalli",
    "address": "12, Munnekollal, Near Kundalahalli Gate, Marathahalli, Bengaluru 560037",
    "gender_preference": "men",
    "room_sharing_types": [
      "double",
      "triple"
    ],
    "food_included": 1,
    "food_charges": 0,
    "base_rent": 6800,
    "electricity_maintenance": 350,
    "other_charges": null,
    "other_charges_description": null,
    "deposit": 8000,
    "deposit_terms": "Refundable upon 30 days notice",
    "one_time_fees": 500,
    "furnishing": "semi_furnished",
    "verification_status": "not_requested",
    "is_currently_verified": false,
    "has_incomplete_cost": true,
    "estimated_monthly_total": 7150,
    "avg_rating": 3.9,
    "review_count": 7,
    "facilities": {
      "wifi": 1,
      "laundry": 0,
      "housekeeping": 1,
      "ac": 0,
      "power_backup": 1,
      "drinking_water": 1,
      "security": 1,
      "study_area": 0,
      "parking": 1,
      "cctv": 1,
      "attached_bathroom": 0,
      "geyser": 1
    },
    "primary_photo": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
        "caption": "Sharing Room"
      }
    ]
  }
];

  function clientFallbackApi(endpoint, options = {}) {
    const url = new URL(endpoint, 'http://localhost');
    const path = url.pathname;

    if (path === '/api/auth/me') {
      const u = JSON.parse(localStorage.getItem('trustpg_user') || 'null');
      if (!u) throw new Error('Not authenticated');
      return { user: u };
    }

    if (path === '/api/auth/login') {
      const body = JSON.parse(options.body || '{}');
      const email = (body.email || '').toLowerCase();
      let role = 'student';
      let name = 'Priya Sharma';
      if (email.includes('owner')) { role = 'owner'; name = 'Rajesh Gowda'; }
      else if (email.includes('inspector')) { role = 'inspector'; name = 'Anand Kumar'; }
      else if (email.includes('admin')) { role = 'admin'; name = 'Platform Admin'; }

      const user = { id: 1, email: body.email, full_name: name, role };
      localStorage.setItem('trustpg_user', JSON.stringify(user));
      return { token: 'demo-token-' + Date.now(), user };
    }

    if (path === '/api/auth/logout') {
      localStorage.removeItem('trustpg_user');
      return { message: 'Logged out' };
    }

    if (path === '/api/listings') {
      let filtered = [...CLIENT_DEMO_PGS];
      const loc = url.searchParams.get('locality');
      if (loc && loc !== 'all') filtered = filtered.filter(p => p.locality.toLowerCase() === loc.toLowerCase());
      const maxB = parseInt(url.searchParams.get('max_budget'));
      if (maxB) filtered = filtered.filter(p => p.estimated_monthly_total <= maxB);
      const gender = url.searchParams.get('gender');
      if (gender && gender !== 'any') filtered = filtered.filter(p => p.gender_preference === gender || p.gender_preference === 'coliving');
      const verified = url.searchParams.get('verified_only') === '1';
      if (verified) filtered = filtered.filter(p => p.verification_status === 'verified');

      return { count: filtered.length, listings: filtered };
    }

    const matchId = path.match(/\/api\/listings\/(\d+)/);
    if (matchId) {
      const id = parseInt(matchId[1]);
      const pg = CLIENT_DEMO_PGS.find(p => p.id === id) || CLIENT_DEMO_PGS[0];
      return {
        listing: {
          ...pg,
          reviews: [
            {
              author_name: 'Priya Sharma',
              cleanliness: 5,
              food_quality: 4,
              facilities: 5,
              responsiveness: 4,
              value_for_money: 4,
              accuracy: 5,
              overall_rating: 4.5,
              review_text: 'Sample Review — Demo Only: Excellent PG in Bengaluru. Truly transparent pricing as advertised.',
              is_resident_verified: 1,
              is_demo: 1
            }
          ],
          inspection_certificate: pg.is_currently_verified ? {
            inspection_date: '2026-10-01',
            inspector_name: 'Anand Kumar (Authorized Field Inspector)',
            payment_ref: 'DEMO_PAY_001',
            expiry_date: '2027-04-01',
            checklist: [
              { title: 'Property Address Matching', status: 'pass', notes: 'Verified on-site' },
              { title: 'Advertised Bed Count', status: 'pass', notes: 'Matches listing' },
              { title: 'Wi-Fi Speed Clocked', status: 'pass', notes: 'Tested 310 Mbps' },
              { title: 'Food Hygiene & RO Water', status: 'pass', notes: 'Clean kitchen, RO operational' },
              { title: 'Security Arrangements', status: 'pass', notes: 'CCTV and warden present' }
            ]
          } : null
        }
      };
    }

    if (path === '/api/listings/compare') {
      const ids = (url.searchParams.get('ids') || '').split(',').map(n => parseInt(n)).filter(Boolean);
      const items = CLIENT_DEMO_PGS.filter(p => ids.includes(p.id));
      return {
        listings: items.map(p => ({
          ...p,
          food_charges_display: p.food_included ? 'Included in Rent' : (p.food_charges ? '₹' + p.food_charges + '/mo' : 'Not provided'),
          electricity_display: p.electricity_maintenance ? '₹' + p.electricity_maintenance + '/mo' : 'Not provided',
          deposit_display: p.deposit ? '₹' + p.deposit : 'Not provided',
          one_time_fees_display: p.one_time_fees ? '₹' + p.one_time_fees : 'Not provided'
        }))
      };
    }

    if (path === '/api/favourites') {
      const favIds = JSON.parse(localStorage.getItem('trustpg_favs') || '[]');
      return { favourites: CLIENT_DEMO_PGS.filter(p => favIds.includes(p.id)) };
    }

    if (path === '/api/favourites/toggle') {
      const body = JSON.parse(options.body || '{}');
      let favIds = JSON.parse(localStorage.getItem('trustpg_favs') || '[]');
      const id = Number(body.pg_id);
      const idx = favIds.indexOf(id);
      let saved = false;
      if (idx >= 0) { favIds.splice(idx, 1); }
      else { favIds.push(id); saved = true; }
      localStorage.setItem('trustpg_favs', JSON.stringify(favIds));
      return { saved };
    }

    if (path === '/api/student/enquiries' || path === '/api/owner/enquiries') {
      return {
        enquiries: [
          {
            id: 1,
            pg_id: 1,
            pg_title: 'Greenview Luxury Executive PG',
            locality: 'Koramangala',
            student_name: 'Priya Sharma',
            student_phone: '+91 98765 43210',
            student_email: 'student@trustpg.com',
            owner_name: 'Rajesh Gowda',
            owner_phone: '+91 98450 12345',
            message: 'Inquiring about double sharing availability next month.',
            status: 'move_in_confirmed',
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    if (path === '/api/owner/listings') {
      return { listings: CLIENT_DEMO_PGS.slice(0, 3) };
    }

    if (path === '/api/owner/move-ins') {
      return {
        moveIns: [
          {
            id: 1,
            pg_title: 'Greenview Luxury Executive PG',
            student_name: 'Priya Sharma',
            student_phone: '+91 98765 43210',
            move_in_date: '2026-11-01',
            platform_fee: 1500,
            payment_status: 'collected',
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    if (path === '/api/admin/metrics') {
      return {
        metrics: {
          active_listings: 10,
          total_students: 145,
          total_owners: 28,
          total_enquiries: 64,
          confirmed_move_ins: 18,
          verified_properties: 6,
          pending_inspections: 2,
          failed_inspections: 1,
          reported_reviews: 0,
          move_in_revenue_inr: 27000
        }
      };
    }

    if (path === '/api/admin/inspections') {
      return {
        inspections: [
          {
            id: 1,
            pg_title: 'Greenview Luxury Executive PG',
            locality: 'Koramangala',
            owner_name: 'Rajesh Gowda',
            inspector_name: 'Anand Kumar',
            payment_status: 'completed',
            result: 'passed'
          }
        ],
        inspectors: [{ id: 3, full_name: 'Anand Kumar', email: 'inspector@trustpg.com' }]
      };
    }

    if (path === '/api/admin/reports') {
      return { reports: [] };
    }

    if (path === '/api/admin/settings') {
      return {
        settings: [
          { key: 'inspection_fee', value: '999' },
          { key: 'move_in_fee', value: '1500' },
          { key: 'verification_validity_days', value: '180' }
        ]
      };
    }

    if (path === '/api/admin/audit-logs') {
      return { logs: [] };
    }

    if (path === '/api/student/visits') {
      return { visits: [] };
    }

    return { message: 'Operation processed successfully in demo mode' };
  }


  // API Client Helper (With graceful serverless/static Vercel fallback)
  async function api(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = localStorage.getItem('trustpg_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    try {
      const res = await fetch(endpoint, { credentials: 'same-origin', ...options, headers });
      if (res.ok) {
        return await res.json();
      }
      throw new Error('Server returned ' + res.status);
    } catch (err) {
      // Graceful fallback to client demo dataset on Vercel or when offline
      return clientFallbackApi(endpoint, options);
    }
  }

  // Toast Notification Helper
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-lg">${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅'}</span>
        <p class="text-sm font-medium text-slate-800">${message}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-sm ml-3">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  }

  // Authentication State Management
  async function checkAuth() {
    const token = localStorage.getItem('trustpg_token');
    if (!token) {
      state.currentUser = null;
      renderNavAuth();
      return null;
    }
    try {
      const res = await api('/api/auth/me');
      state.currentUser = res.user;
    } catch (err) {
      localStorage.removeItem('trustpg_token');
      state.currentUser = null;
    }
    renderNavAuth();
    return state.currentUser;
  }

  function renderNavAuth() {
    const navAuth = document.getElementById('nav-auth-container');
    const mobileAuth = document.getElementById('mobile-auth-container');
    if (!navAuth) return;

    if (state.currentUser) {
      const user = state.currentUser;
      const roleLabel = {
        student: 'Student',
        owner: 'PG Owner',
        inspector: 'Inspector',
        admin: 'Admin'
      }[user.role] || user.role;

      const dashboardRoute = `#/dashboard/${user.role}`;

      const authHtml = `
        <div class="flex items-center gap-2">
          <a href="${dashboardRoute}" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all">
            <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] uppercase font-bold">
              ${user.full_name.charAt(0)}
            </span>
            <span>${user.full_name.split(' ')[0]} (${roleLabel})</span>
          </a>
          <button onclick="TrustPG.logout()" title="Logout" class="p-2 text-slate-400 hover:text-red-600 transition-colors">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      `;

      navAuth.innerHTML = authHtml;
      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <a href="${dashboardRoute}" class="block py-2 text-emerald-600 font-bold">${user.full_name} (${roleLabel} Dashboard)</a>
          <button onclick="TrustPG.logout()" class="block text-left py-1 text-red-600 font-semibold">Logout</button>
        `;
      }
    } else {
      const publicHtml = `
        <a href="#/login?role=student" class="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
          Student Login
        </a>
        <a href="#/login?role=owner" class="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
          Owner Login
        </a>
      `;
      navAuth.innerHTML = publicHtml;
      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <a href="#/login?role=student" class="block py-1 text-slate-800 font-semibold">Student Sign In</a>
          <a href="#/login?role=owner" class="block py-1 text-slate-800 font-semibold">Owner Sign In</a>
        `;
      }
    }

    if (window.lucide) lucide.createIcons();
    updateCompareBadge();
  }

  function updateCompareBadge() {
    const badge = document.getElementById('compare-badge');
    if (!badge) return;
    if (state.compareList.length > 0) {
      badge.textContent = state.compareList.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  async function login(email, password) {
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('trustpg_token', res.token);
      state.currentUser = res.user;
      renderNavAuth();
      showToast(`Welcome back, ${res.user.full_name}!`);
      window.location.hash = `#/dashboard/${res.user.role}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function register(data) {
    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      localStorage.setItem('trustpg_token', res.token);
      state.currentUser = res.user;
      renderNavAuth();
      showToast('Registration successful! Welcome to TrustPG.');
      window.location.hash = `#/dashboard/${res.user.role}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('trustpg_token');
    state.currentUser = null;
    renderNavAuth();
    showToast('Logged out successfully');
    window.location.hash = '#/';
  }

  // Comparison Management
  function toggleCompare(pgId, e) {
    if (e) e.stopPropagation();
    pgId = Number(pgId);
    const index = state.compareList.indexOf(pgId);
    if (index >= 0) {
      state.compareList.splice(index, 1);
      showToast('Removed from comparison');
    } else {
      if (state.compareList.length >= 4) {
        showToast('You can compare a maximum of 4 PGs side-by-side', 'warning');
        return;
      }
      state.compareList.push(pgId);
      showToast('Added to comparison! Open Compare PGs to view.');
    }
    localStorage.setItem('trustpg_compare', JSON.stringify(state.compareList));
    updateCompareBadge();
    // If currently on compare page, refresh view
    if (window.location.hash.startsWith('#/compare')) {
      navigate();
    }
  }

  // Quick Login Modal (1-Click Presets for immediate testing)
  function openQuickLoginModal() {
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚡</span>
            <h3 class="text-xl font-bold text-slate-900">Instant Demo Login Presets</h3>
          </div>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <p class="text-sm text-slate-600 mt-3 mb-6">
          Click any role below to instantly log in and test all workflows across students, owners, inspectors, and platform administrators.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Student Preset -->
          <button onclick="TrustPG.quickLogin('student@trustpg.com', 'Password@123')" class="text-left p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all group">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-900 group-hover:text-emerald-700">🎓 Student User</span>
              <span class="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Priya</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">student@trustpg.com</p>
            <p class="text-xs text-emerald-700 mt-1">Test favourites, enquiries, visits, and reviews.</p>
          </button>

          <!-- Owner Preset -->
          <button onclick="TrustPG.quickLogin('owner@trustpg.com', 'Password@123')" class="text-left p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-all group">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-900 group-hover:text-blue-700">🏠 PG Owner</span>
              <span class="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Rajesh</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">owner@trustpg.com</p>
            <p class="text-xs text-blue-700 mt-1">Test listing creation, enquiries, & inspection requests.</p>
          </button>

          <!-- Inspector Preset -->
          <button onclick="TrustPG.quickLogin('inspector@trustpg.com', 'Password@123')" class="text-left p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-all group">
            <div class="flex items-center justify-between">
              <span class="font-bold text-purple-900 group-hover:text-purple-700">📋 Authorised Inspector</span>
              <span class="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-semibold">Anand</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">inspector@trustpg.com</p>
            <p class="text-xs text-purple-700 mt-1">Fill out 12-point inspection checklists on-site.</p>
          </button>

          <!-- Admin Preset -->
          <button onclick="TrustPG.quickLogin('admin@trustpg.com', 'Password@123')" class="text-left p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-all group">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-900 group-hover:text-amber-700">🛡️ Platform Admin</span>
              <span class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Admin</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">admin@trustpg.com</p>
            <p class="text-xs text-amber-700 mt-1">Assign inspectors, approve badges, configure platform fees.</p>
          </button>
        </div>
      </div>
    `;
  }

  async function quickLogin(email, password) {
    closeModal();
    await login(email, password);
  }

  function closeModal() {
    const container = document.getElementById('modal-container');
    container.className = 'hidden';
    container.innerHTML = '';
  }

  function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    drawer.classList.toggle('hidden');
  }

  // Verification Certificate Modal (Displays scope, date, inspector, checks passed vs not checked)
  function showVerificationCertificate(certData) {
    if (!certData) return;
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';

    const checklistRows = (certData.checklist || []).map(item => `
      <div class="flex items-start gap-3 p-3 rounded-lg ${item.status === 'pass' ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-slate-50 border border-slate-200'}">
        <span class="mt-0.5 text-sm">${item.status === 'pass' ? '✅' : item.status === 'fail' ? '❌' : '⚪'}</span>
        <div class="flex-1">
          <p class="text-xs font-bold text-slate-800">${item.title}</p>
          <p class="text-xs text-slate-600 mt-0.5">${item.notes || 'Status: ' + item.status.toUpperCase()}</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">TrustPG On-Site Verification Certificate</h3>
              <p class="text-xs text-emerald-700 font-medium">Specified property parameters independently verified</p>
            </div>
          </div>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <div class="my-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
          <p class="font-bold text-sm">Official Inspection Record</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-emerald-700 font-semibold">Inspection Date:</span> ${certData.inspection_date ? new Date(certData.inspection_date).toLocaleDateString() : 'Recent'}</div>
            <div><span class="text-emerald-700 font-semibold">Inspector Ref:</span> ${certData.inspector_name || 'Authorized Field Auditor'}</div>
            <div><span class="text-emerald-700 font-semibold">Payment Audit:</span> ${certData.payment_ref || 'Verified (Demo Fee Paid)'}</div>
            <div><span class="text-emerald-700 font-semibold">Badge Expiry:</span> ${certData.expiry_date ? new Date(certData.expiry_date).toLocaleDateString() : '180 Days'}</div>
          </div>
        </div>

        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">12-Point Inspection Checklist Results</h4>
        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          ${checklistRows || '<p class="text-xs text-slate-500">Checklist records available in system.</p>'}
        </div>

        <div class="mt-5 p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 leading-normal">
          <strong>Mandatory Verification Scope Notice:</strong> Specified property details and selected facilities were checked by TrustPG on the date shown. Verification is strictly limited to the recorded inspection scope and does not guarantee future conditions, management behaviour, or eliminate all risks. Students should independently confirm all terms prior to signing agreements or paying deposits.
        </div>

        <div class="mt-6 flex justify-end">
          <button onclick="TrustPG.closeModal()" class="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
            Close Certificate
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ROUTING & VIEW CONTROLLERS
  // ==========================================
  async function navigate() {
    const hash = window.location.hash || '#/';
    const container = document.getElementById('view-container');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ensure Auth is synchronized
    await checkAuth();

    // 1. Home Page
    if (hash === '#/' || hash === '') {
      renderHomePage(container);
    }
    // 2. Find a PG
    else if (hash.startsWith('#/find')) {
      renderFindPage(container, hash);
    }
    // 3. PG Details
    else if (hash.startsWith('#/pg/')) {
      const id = hash.replace('#/pg/', '').split('?')[0];
      renderDetailsPage(container, id);
    }
    // 4. Compare PGs
    else if (hash.startsWith('#/compare')) {
      renderComparePage(container);
    }
    // 5. How It Works
    else if (hash === '#/how-it-works') {
      renderHowItWorksPage(container);
    }
    // 6. How Verification Works / Get Your PG Verified
    else if (hash === '#/verification') {
      renderVerificationPage(container);
    }
    // 7. List Your PG
    else if (hash === '#/list-pg') {
      renderListPgPage(container);
    }
    // 8 & 9. Login / Register
    else if (hash.startsWith('#/login')) {
      renderAuthPage(container, hash);
    }
    // 10. Student Dashboard
    else if (hash.startsWith('#/dashboard/student')) {
      renderStudentDashboard(container);
    }
    // 11. PG Owner Dashboard
    else if (hash.startsWith('#/dashboard/owner')) {
      renderOwnerDashboard(container);
    }
    // 12. Inspector Dashboard
    else if (hash.startsWith('#/dashboard/inspector')) {
      renderInspectorDashboard(container);
    }
    // 13. Admin Dashboard
    else if (hash.startsWith('#/dashboard/admin')) {
      renderAdminDashboard(container);
    }
    // 14. Submit Review
    else if (hash.startsWith('#/submit-review')) {
      renderSubmitReviewPage(container, hash);
    }
    // 15. About Us
    else if (hash === '#/about') {
      renderAboutPage(container);
    }
    // 16. Contact Us
    else if (hash === '#/contact') {
      renderContactPage(container);
    }
    // 17. FAQ
    else if (hash === '#/faq') {
      renderFaqPage(container);
    }
    // 18. Privacy Policy
    else if (hash === '#/privacy') {
      renderPrivacyPage(container);
    }
    // 19. Terms & Conditions
    else if (hash === '#/terms') {
      renderTermsPage(container);
    }
    // Fallback 404
    else {
      container.innerHTML = `
        <div class="max-w-xl mx-auto py-24 text-center px-4">
          <h2 class="text-4xl font-extrabold text-slate-900 mb-4">Page Not Found</h2>
          <p class="text-slate-600 mb-6">The page you're looking for doesn't exist or has moved.</p>
          <a href="#/" class="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Back to Home</a>
        </div>
      `;
    }

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // VIEW: 1. HOME PAGE
  // ==========================================
  async function renderHomePage(container) {
    container.innerHTML = `
      <!-- HERO SECTION -->
      <section class="relative bg-gradient-to-b from-white via-slate-50 to-[#FBFBF9] pt-12 pb-20 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto space-y-4">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Built Specifically For College Students in Bengaluru
            </span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your College Journey Deserves a <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Better Place to Stay.</span>
            </h1>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover PGs in Bengaluru, compare the real cost of living, explore facilities, and make a more informed decision before moving in.
            </p>
          </div>

          <!-- SEARCH FILTER PANEL -->
          <div class="mt-10 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80">
            <form id="hero-search-form" onsubmit="TrustPG.handleHeroSearch(event)" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <!-- Locality -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bengaluru Locality</label>
                  <select id="hero-locality" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium">
                    <option value="all">All Localities</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="BTM Layout">BTM Layout</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Electronic City">Electronic City</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="Marathahalli">Marathahalli</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Jayanagar">Jayanagar</option>
                  </select>
                </div>

                <!-- Budget Range -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Max Monthly Budget (₹)</label>
                  <select id="hero-budget" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium">
                    <option value="35000">Any Budget</option>
                    <option value="8000">Under ₹8,000 / mo</option>
                    <option value="12000">Under ₹12,000 / mo</option>
                    <option value="16000">Under ₹16,000 / mo</option>
                    <option value="20000">Under ₹20,000 / mo</option>
                  </select>
                </div>

                <!-- Room Sharing -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Room Sharing</label>
                  <select id="hero-sharing" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium">
                    <option value="any">Any Sharing</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                  </select>
                </div>

                <!-- Food Preference -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Food Arrangement</label>
                  <select id="hero-food" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium">
                    <option value="any">Either (Food or No Food)</option>
                    <option value="with_food">With Food Included</option>
                    <option value="without_food">Without Food</option>
                  </select>
                </div>

                <!-- Gender Preference -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property Type</label>
                  <select id="hero-gender" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium">
                    <option value="any">Any (Women / Men / Co-living)</option>
                    <option value="women">Women's PG Only</option>
                    <option value="men">Men's PG Only</option>
                    <option value="coliving">Co-living Space</option>
                  </select>
                </div>

                <!-- Submit Button -->
                <div class="flex items-end">
                  <button type="submit" class="w-full py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 h-[42px]">
                    <i data-lucide="search" class="w-4 h-4"></i>
                    <span>Find PGs</span>
                  </button>
                </div>

              </div>

              <!-- Secondary Link -->
              <div class="pt-2 text-center text-xs text-slate-500">
                Need help understanding our inspection badge?
                <a href="#/how-it-works" class="text-emerald-700 font-bold hover:underline ml-1">
                  Learn How TrustPG Works &rarr;
                </a>
              </div>
            </form>
          </div>

          <!-- THREE TRUST HIGHLIGHTS -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <i data-lucide="calculator" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-base">Transparent Pricing</h4>
                <p class="text-xs text-slate-600 mt-1">
                  We show the full estimated monthly cost including food, electricity, maintenance, and hidden fees.
                </p>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <i data-lucide="message-square-heart" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-base">Genuine Resident Reviews</h4>
                <p class="text-xs text-slate-600 mt-1">
                  Multi-dimensional ratings verified with actual resident move-in records. No fake paid testimonials.
                </p>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <i data-lucide="shield-check" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-base">Optional On-Site Verification</h4>
                <p class="text-xs text-slate-600 mt-1">
                  Independent 12-point physical inspection checks. Trust is earned through audits, never bought.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- LOCALITY DISCOVERY SECTION -->
      <section class="py-16 bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Popular Student Hubs in Bengaluru
            </h2>
            <p class="text-sm text-slate-600 mt-2">
              Filter student stays close to top colleges, tech parks, and metro lines.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            ${[
              { name: 'Koramangala', desc: 'Christ, St. Johns, Tech Cafes', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80' },
              { name: 'BTM Layout', desc: 'Christ, Silk Board, Coaching', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80' },
              { name: 'HSR Layout', desc: 'NIFT, Startup Hub, Tree-lined', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' },
              { name: 'Electronic City', desc: 'PES EC, Infosys, Wipro Tech', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80' },
              { name: 'Whitefield', desc: 'ITPL, Vydehi, Metro connected', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
              { name: 'Marathahalli', desc: 'Outer Ring Road, Budget PGs', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80' },
              { name: 'Indiranagar', desc: '100ft Road, Metro, Premium PGs', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
              { name: 'Jayanagar', desc: 'RV College, Homely, Peaceful', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80' },
            ].map(loc => `
              <a href="#/find?locality=${encodeURIComponent(loc.name)}" class="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 block h-40">
                <img src="${loc.img}" alt="${loc.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent p-4 flex flex-col justify-end text-white">
                  <h3 class="font-bold text-base group-hover:text-emerald-300 transition-colors">${loc.name}</h3>
                  <p class="text-[11px] text-slate-300 line-clamp-1">${loc.desc}</p>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- FEATURED PGS SECTION -->
      <section class="py-16 bg-[#FBFBF9] border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="demo-badge">Demo Listings &bull; Details Not Independently Verified</span>
              </div>
              <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Verified & Curated PGs
              </h2>
              <p class="text-sm text-slate-600 mt-1">
                Explore real cost structures and side-by-side facility transparency.
              </p>
            </div>
            <a href="#/find" class="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
              <span>View All Listings</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div id="featured-listings-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="col-span-full py-12 text-center text-slate-500">
              <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading Bengaluru PG listings...
            </div>
          </div>
        </div>
      </section>

      <!-- SIGNATURE FEATURE: THE TRUSTPG DIFFERENCE & COST/TRUST CARD -->
      <section class="py-20 bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div class="space-y-6">
              <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Signature Feature: Transparent Outflow
              </span>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                “A Lower Rent Is Not Always a Lower Cost.”
              </h2>
              <p class="text-slate-600 text-sm leading-relaxed">
                Many PG listings in Bengaluru advertise a low headline rent like ₹8,000/month. But once you move in, you discover mandatory food surcharges (₹2,500), electricity meters billed at commercial rates (₹1,000), unannounced maintenance fees (₹500), and huge non-refundable deductions from your deposit.
              </p>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p class="text-xs text-slate-700"><strong>Full Estimated Monthly Outflow:</strong> We calculate base rent + mandatory food + electricity & maintenance before you sign.</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p class="text-xs text-slate-700"><strong>Deposit & Refund Terms Disclosed:</strong> See exact security deposit amounts and exit notice periods up front.</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p class="text-xs text-slate-700"><strong>Missing Data Highlighted:</strong> If an owner leaves mandatory charges undisclosed, we never pretend it is ₹0. We clearly mark it as “Not Provided”.</p>
                </div>
              </div>
            </div>

            <!-- TrustPG Cost & Trust Card Demo UI -->
            <div class="cost-trust-card p-6 bg-slate-50 border border-slate-300">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <span class="text-xs font-bold text-emerald-800 tracking-wider uppercase">Sample Comparison Model</span>
                <span class="demo-badge">Demonstration Example</span>
              </div>

              <div class="mt-4 space-y-4">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex justify-between items-center text-sm font-bold text-slate-900 mb-2">
                    <span>Advertised Headline Rent</span>
                    <span class="text-slate-500 line-through">₹8,000 / mo</span>
                  </div>
                  <div class="space-y-1.5 text-xs text-slate-600 pl-2 border-l-2 border-amber-400">
                    <div class="flex justify-between"><span>+ Food (3 Meals)</span><span class="font-semibold text-slate-800">₹2,000 / mo</span></div>
                    <div class="flex justify-between"><span>+ Electricity & Maintenance</span><span class="font-semibold text-slate-800">₹500 / mo</span></div>
                    <div class="flex justify-between"><span>+ High-Speed Wi-Fi Fee</span><span class="font-semibold text-slate-800">₹200 / mo</span></div>
                  </div>
                  <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-base font-extrabold text-emerald-800">
                    <span>True Estimated Monthly Cost</span>
                    <span>₹10,700 / mo</span>
                  </div>
                </div>

                <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                  <i data-lucide="shield-alert" class="w-5 h-5 text-emerald-700 shrink-0"></i>
                  <span>TrustPG ensures you know the ₹10,700 figure <em>before</em> paying any deposit.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- TRUST SECTION: TRUST CAN NEVER BE PURCHASED -->
      <section class="py-16 bg-[#FBFBF9] border-b border-slate-200">
        <div class="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span class="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
            Our Core Integrity Pledge
          </span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            “Trust Should Never Be for Sale.”
          </h2>
          <p class="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
            At TrustPG, our platform integrity is sacred. Unlike generic portals where brokers pay for top spots and fake star ratings, we adhere to strict non-negotiable rules:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs text-slate-700 mt-8">
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">1. 100% Free For Students</span>
              Searching, comparing full cost breakdowns, and contacting PG owners is completely free for students.
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">2. Zero Paid Organic Rankings</span>
              Owners cannot purchase better positions in search results. Results are sorted solely by student preference.
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">3. Inspections Do Not Guarantee Badges</span>
              Paying the ₹999 on-site inspection fee covers the field audit service only. It never guarantees a positive badge.
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">4. Genuine Resident Reviews</span>
              Owners cannot purchase positive reviews or delete honest negative feedback. Every report is audited.
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">5. Clear Audit Expiry Dates</span>
              Verification badges expire after 180 days. Expired listings lose their active badge until a recheck is approved.
            </div>
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span class="font-bold text-slate-900 block text-sm">6. Disclosed Verification Scope</span>
              We clearly disclose which exact 12 parameters were checked and remind students to verify on move-in day.
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CALL TO ACTION -->
      <section class="py-16 bg-slate-900 text-white text-center">
        <div class="max-w-3xl mx-auto px-4 space-y-6">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your Next Chapter Starts With the Right Stay.
          </h2>
          <p class="text-slate-300 text-sm max-w-xl mx-auto">
            Discover verified PGs across Bengaluru with transparent pricing, genuine resident reviews, and zero hidden charges.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a href="#/find" class="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all">
              Find Your PG
            </a>
            <a href="#/list-pg" class="px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all">
              List Your PG
            </a>
          </div>
        </div>
      </section>
    `;

    // Fetch and render 6 featured listings
    try {
      const res = await api('/api/listings?sort=recently_verified');
      const grid = document.getElementById('featured-listings-grid');
      if (grid && res.listings) {
        const featured = res.listings.slice(0, 6);
        grid.innerHTML = featured.map(pg => renderPropertyCardHtml(pg)).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Helper to render a reusable property card HTML
  function renderPropertyCardHtml(pg) {
    const isComparing = state.compareList.includes(pg.id);
    const photo = pg.primary_photo || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <!-- Photo & Badges -->
          <div class="relative h-48 w-full overflow-hidden bg-slate-100">
            <img src="${photo}" alt="${pg.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <div class="absolute top-3 left-3 flex flex-col gap-1 items-start">
              <span class="demo-badge">Demo Listing</span>
              ${pg.is_currently_verified ? `
                <span onclick="TrustPG.viewCertificate(${pg.id})" class="verified-pill shadow">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  TrustPG Verified
                </span>
              ` : `
                <span class="px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[11px] font-medium backdrop-blur-sm">
                  Unverified
                </span>
              `}
            </div>
            <div class="absolute bottom-3 right-3 bg-slate-950/80 text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
              ${pg.gender_preference === 'women' ? "Women's PG" : pg.gender_preference === 'men' ? "Men's PG" : "Co-living"}
            </div>
          </div>

          <!-- Content Details -->
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-semibold text-emerald-700 flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                ${pg.locality}
              </span>
              <span>
                ${pg.avg_rating ? `⭐ <strong>${pg.avg_rating}</strong> (${pg.review_count})` : 'No reviews yet'}
              </span>
            </div>

            <h3 class="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
              <a href="#/pg/${pg.id}">${pg.title}</a>
            </h3>

            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              ${pg.description}
            </p>

            <!-- Pricing Box -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-slate-500">Base Rent:</span>
                <span class="font-bold text-slate-900">₹${pg.base_rent.toLocaleString('en-IN')}/mo</span>
              </div>
              <div class="flex justify-between items-center font-bold text-emerald-900 pt-1 border-t border-slate-200">
                <span>Est. Monthly Total:</span>
                <span>₹${pg.estimated_monthly_total.toLocaleString('en-IN')}/mo ${pg.has_incomplete_cost ? '<span class="text-[10px] text-amber-700 font-normal">(*incomplete)</span>' : ''}</span>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-500">
                <span>Deposit:</span>
                <span>${pg.deposit ? `₹${pg.deposit.toLocaleString('en-IN')}` : 'Not provided'}</span>
              </div>
            </div>

            <!-- Facilities Chips -->
            <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
              ${pg.wifi ? '<span class="px-2 py-0.5 rounded bg-slate-100">Wi-Fi</span>' : ''}
              ${pg.laundry ? '<span class="px-2 py-0.5 rounded bg-slate-100">Laundry</span>' : ''}
              ${pg.ac ? '<span class="px-2 py-0.5 rounded bg-slate-100">AC</span>' : ''}
              ${pg.food_included ? '<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">Food Incl.</span>' : ''}
            </div>

          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="p-5 pt-0 flex items-center gap-2">
          <a href="#/pg/${pg.id}" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors">
            View Details
          </a>
          <button onclick="TrustPG.toggleCompare(${pg.id}, event)" class="py-2 px-3 rounded-xl border text-xs font-bold transition-all ${isComparing ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}">
            ${isComparing ? '✓ Comparing' : '+ Compare'}
          </button>
        </div>

      </div>
    `;
  }

  // Handle Hero Search Submission
  function handleHeroSearch(e) {
    e.preventDefault();
    const locality = document.getElementById('hero-locality').value;
    const maxBudget = document.getElementById('hero-budget').value;
    const sharing = document.getElementById('hero-sharing').value;
    const food = document.getElementById('hero-food').value;
    const gender = document.getElementById('hero-gender').value;

    const params = new URLSearchParams();
    if (locality && locality !== 'all') params.set('locality', locality);
    if (maxBudget) params.set('max_budget', maxBudget);
    if (sharing && sharing !== 'any') params.set('room_type', sharing);
    if (food && food !== 'any') params.set('food', food);
    if (gender && gender !== 'any') params.set('gender', gender);

    window.location.hash = `#/find?${params.toString()}`;
  }

  // ==========================================
  // VIEW: 2. FIND A PG (SEARCH & FILTERS)
  // ==========================================
  async function renderFindPage(container, hash) {
    const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    const currentLocality = searchParams.get('locality') || 'all';
    const currentMaxBudget = searchParams.get('max_budget') || '35000';
    const currentGender = searchParams.get('gender') || 'any';
    const currentRoomType = searchParams.get('room_type') || 'any';
    const currentFood = searchParams.get('food') || 'any';
    const currentVerified = searchParams.get('verified_only') === '1';
    const currentSort = searchParams.get('sort') || 'lowest_total';

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Breadcrumbs & Header -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="text-xs text-slate-500 mb-1">
              <a href="#/" class="hover:underline">Home</a> &gt; <span>Find a PG in Bengaluru</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Accommodation Discovery
            </h1>
          </div>
          <span class="demo-badge self-start sm:self-auto">Demo Listing Environment</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- FILTERS SIDEBAR -->
          <div class="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
                <i data-lucide="sliders-horizontal" class="w-4 h-4 text-emerald-600"></i>
                Filters
              </h3>
              <button onclick="TrustPG.clearAllFilters()" class="text-xs font-semibold text-emerald-700 hover:underline">
                Clear All
              </button>
            </div>

            <!-- Locality Filter -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Locality</label>
              <select id="filter-locality" onchange="TrustPG.applyFilters()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50">
                <option value="all" ${currentLocality === 'all' ? 'selected' : ''}>All Bengaluru Localities</option>
                <option value="Koramangala" ${currentLocality === 'Koramangala' ? 'selected' : ''}>Koramangala</option>
                <option value="BTM Layout" ${currentLocality === 'BTM Layout' ? 'selected' : ''}>BTM Layout</option>
                <option value="HSR Layout" ${currentLocality === 'HSR Layout' ? 'selected' : ''}>HSR Layout</option>
                <option value="Electronic City" ${currentLocality === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
                <option value="Whitefield" ${currentLocality === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
                <option value="Marathahalli" ${currentLocality === 'Marathahalli' ? 'selected' : ''}>Marathahalli</option>
                <option value="Indiranagar" ${currentLocality === 'Indiranagar' ? 'selected' : ''}>Indiranagar</option>
                <option value="Jayanagar" ${currentLocality === 'Jayanagar' ? 'selected' : ''}>Jayanagar</option>
              </select>
            </div>

            <!-- Max Monthly Budget Filter -->
            <div>
              <div class="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>Max Budget:</span>
                <span id="budget-value" class="text-emerald-700">₹${parseInt(currentMaxBudget).toLocaleString('en-IN')}</span>
              </div>
              <input type="range" id="filter-budget" min="6000" max="35000" step="1000" value="${currentMaxBudget}"
                     oninput="document.getElementById('budget-value').textContent = '₹' + parseInt(this.value).toLocaleString('en-IN')"
                     onchange="TrustPG.applyFilters()"
                     class="w-full accent-emerald-600 cursor-pointer">
              <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹6,000</span>
                <span>₹20,000</span>
                <span>₹35,000</span>
              </div>
            </div>

            <!-- Property Gender Type -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Property Gender</label>
              <div class="space-y-1.5 text-xs text-slate-700">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="any" ${currentGender === 'any' ? 'checked' : ''} onchange="TrustPG.applyFilters()" class="text-emerald-600 focus:ring-emerald-500">
                  <span>Any Property</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="women" ${currentGender === 'women' ? 'checked' : ''} onchange="TrustPG.applyFilters()" class="text-emerald-600 focus:ring-emerald-500">
                  <span>Women's PG Only</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="men" ${currentGender === 'men' ? 'checked' : ''} onchange="TrustPG.applyFilters()" class="text-emerald-600 focus:ring-emerald-500">
                  <span>Men's PG Only</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="coliving" ${currentGender === 'coliving' ? 'checked' : ''} onchange="TrustPG.applyFilters()" class="text-emerald-600 focus:ring-emerald-500">
                  <span>Co-living Spaces</span>
                </label>
              </div>
            </div>

            <!-- Room Sharing -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Room Sharing</label>
              <select id="filter-room" onchange="TrustPG.applyFilters()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50">
                <option value="any" ${currentRoomType === 'any' ? 'selected' : ''}>Any Sharing</option>
                <option value="single" ${currentRoomType === 'single' ? 'selected' : ''}>Single Room</option>
                <option value="double" ${currentRoomType === 'double' ? 'selected' : ''}>Double Sharing</option>
                <option value="triple" ${currentRoomType === 'triple' ? 'selected' : ''}>Triple Sharing</option>
              </select>
            </div>

            <!-- Food Preference -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Food Arrangement</label>
              <select id="filter-food" onchange="TrustPG.applyFilters()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50">
                <option value="any" ${currentFood === 'any' ? 'selected' : ''}>Any Arrangement</option>
                <option value="with_food" ${currentFood === 'with_food' ? 'selected' : ''}>Food Included in Rent</option>
                <option value="without_food" ${currentFood === 'without_food' ? 'selected' : ''}>Without Food</option>
              </select>
            </div>

            <!-- Verified Badge Filter -->
            <div class="pt-3 border-t border-slate-100">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" id="filter-verified" ${currentVerified ? 'checked' : ''} onchange="TrustPG.applyFilters()" class="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  Verified PGs Only
                </span>
              </label>
            </div>

            <!-- Amenities Checkboxes -->
            <div class="pt-3 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amenities</label>
              <div class="space-y-2 text-xs text-slate-700">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="filter-wifi" onchange="TrustPG.applyFilters()" class="rounded text-emerald-600">
                  <span>High-Speed Wi-Fi</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="filter-laundry" onchange="TrustPG.applyFilters()" class="rounded text-emerald-600">
                  <span>Washing Machine / Laundry</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="filter-ac" onchange="TrustPG.applyFilters()" class="rounded text-emerald-600">
                  <span>Air Conditioning (AC)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="filter-power" onchange="TrustPG.applyFilters()" class="rounded text-emerald-600">
                  <span>Power Backup</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="filter-water" onchange="TrustPG.applyFilters()" class="rounded text-emerald-600">
                  <span>RO Drinking Water</span>
                </label>
              </div>
            </div>

          </div>

          <!-- LISTINGS RESULTS & SORTING -->
          <div class="lg:col-span-3 space-y-6">
            
            <!-- Result Bar & Sorting -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span id="results-count" class="text-sm font-bold text-slate-800">Showing results...</span>
              </div>

              <!-- Sort Dropdown -->
              <div class="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span class="text-slate-500 font-semibold whitespace-nowrap">Sort By:</span>
                <select id="filter-sort" onchange="TrustPG.applyFilters()" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium">
                  <option value="lowest_total" ${currentSort === 'lowest_total' ? 'selected' : ''}>Lowest Estimated Monthly Total</option>
                  <option value="lowest_rent" ${currentSort === 'lowest_rent' ? 'selected' : ''}>Lowest Base Rent</option>
                  <option value="highest_rating" ${currentSort === 'highest_rating' ? 'selected' : ''}>Highest Resident Rating</option>
                  <option value="recently_verified" ${currentSort === 'recently_verified' ? 'selected' : ''}>Recently Verified</option>
                  <option value="recently_updated" ${currentSort === 'recently_updated' ? 'selected' : ''}>Recently Updated</option>
                </select>
              </div>
            </div>

            <!-- Active Filter Chips -->
            <div id="active-filter-chips" class="flex flex-wrap items-center gap-2"></div>

            <!-- Listings Grid -->
            <div id="search-listings-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-full py-16 text-center text-slate-500">
                <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Searching database for matching PGs...
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    // Fetch and populate results based on search query params
    await fetchAndRenderSearchResults(searchParams);
  }

  async function fetchAndRenderSearchResults(searchParams) {
    const grid = document.getElementById('search-listings-grid');
    const countEl = document.getElementById('results-count');
    const chipsEl = document.getElementById('active-filter-chips');

    try {
      const res = await api(`/api/listings?${searchParams.toString()}`);
      if (countEl) countEl.innerHTML = `Found <strong>${res.count}</strong> PGs in Bengaluru`;

      // Render active chips
      if (chipsEl) {
        const chips = [];
        const loc = searchParams.get('locality');
        if (loc && loc !== 'all') chips.push(`Locality: ${loc}`);
        const maxB = searchParams.get('max_budget');
        if (maxB && maxB !== '35000') chips.push(`Max ₹${parseInt(maxB).toLocaleString('en-IN')}`);
        const gender = searchParams.get('gender');
        if (gender && gender !== 'any') chips.push(`Gender: ${gender}`);
        const verified = searchParams.get('verified_only');
        if (verified === '1') chips.push('Verified Only');

        chipsEl.innerHTML = chips.map(c => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            ${c}
          </span>
        `).join('');
      }

      if (!res.listings || res.listings.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center px-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <i data-lucide="search-x" class="w-6 h-6"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">No matching PGs found</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try increasing your budget, clearing some filters, or selecting "All Localities" to see more options.
            </p>
            <button onclick="TrustPG.clearAllFilters()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
              Clear All Filters
            </button>
          </div>
        `;
      } else {
        grid.innerHTML = res.listings.map(pg => renderPropertyCardHtml(pg)).join('');
      }

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      grid.innerHTML = `<div class="col-span-full py-8 text-center text-red-500 text-sm">Failed to load listings: ${err.message}</div>`;
    }
  }

  function applyFilters() {
    const locality = document.getElementById('filter-locality')?.value || 'all';
    const maxBudget = document.getElementById('filter-budget')?.value || '35000';
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'any';
    const roomType = document.getElementById('filter-room')?.value || 'any';
    const food = document.getElementById('filter-food')?.value || 'any';
    const verifiedOnly = document.getElementById('filter-verified')?.checked ? '1' : '0';
    const sort = document.getElementById('filter-sort')?.value || 'lowest_total';

    const params = new URLSearchParams();
    if (locality !== 'all') params.set('locality', locality);
    if (maxBudget !== '35000') params.set('max_budget', maxBudget);
    if (gender !== 'any') params.set('gender', gender);
    if (roomType !== 'any') params.set('room_type', roomType);
    if (food !== 'any') params.set('food', food);
    if (verifiedOnly === '1') params.set('verified_only', '1');
    if (sort) params.set('sort', sort);

    // Amenities
    if (document.getElementById('filter-wifi')?.checked) params.set('wifi', '1');
    if (document.getElementById('filter-laundry')?.checked) params.set('laundry', '1');
    if (document.getElementById('filter-ac')?.checked) params.set('ac', '1');
    if (document.getElementById('filter-power')?.checked) params.set('power_backup', '1');
    if (document.getElementById('filter-water')?.checked) params.set('drinking_water', '1');

    window.location.hash = `#/find?${params.toString()}`;
  }

  function clearAllFilters() {
    window.location.hash = '#/find';
  }

  // ==========================================
  // VIEW: 3. PG DETAILS & COST TRANSPARENCY
  // ==========================================
  async function renderDetailsPage(container, id) {
    try {
      const res = await api(`/api/listings/${id}`);
      const pg = res.listing;
      state.currentListing = pg;
      const isComparing = state.compareList.includes(pg.id);

      const photos = pg.photos && pg.photos.length > 0 ? pg.photos : [
        { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', caption: 'Main Room' }
      ];

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Breadcrumb & Top Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              <a href="#/" class="hover:underline">Home</a> &gt;
              <a href="#/find?locality=${encodeURIComponent(pg.locality)}" class="hover:underline">${pg.locality}</a> &gt;
              <span class="text-slate-800 font-semibold">${pg.title}</span>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="TrustPG.toggleFavourite(${pg.id})" id="fav-btn" class="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-all">
                <span>${pg.is_favourite ? '❤️ Saved' : '🤍 Save'}</span>
              </button>
              <button onclick="TrustPG.toggleCompare(${pg.id}, event)" class="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${isComparing ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:bg-slate-50'}">
                ${isComparing ? '✓ In Compare' : '+ Compare'}
              </button>
            </div>
          </div>

          <!-- Demo Banner Advisory -->
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold">⚠️ Demo Listing:</span>
              <span>Details not independently verified. Please independently verify room conditions and charges before paying deposits.</span>
            </div>
            <button onclick="TrustPG.openReportModal(${pg.id})" class="text-amber-800 hover:underline font-semibold ml-2">Report Info</button>
          </div>

          <!-- Property Header -->
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              ${pg.is_currently_verified ? `
                <button onclick="TrustPG.viewCertificate(${pg.id})" class="verified-pill">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                  TrustPG Verified
                </button>
              ` : `
                <span class="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  Verification Not Completed
                </span>
              `}
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                ${pg.gender_preference === 'women' ? "Women's PG" : pg.gender_preference === 'men' ? "Men's PG" : "Co-living"}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                ${pg.furnishing.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">${pg.title}</h1>
            <p class="text-xs text-slate-600 flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-4 h-4 text-emerald-600"></i>
              ${pg.address}
            </p>
          </div>

          <!-- Photo Gallery Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden h-[340px] sm:h-[420px]">
            <div class="md:col-span-2 h-full bg-slate-100">
              <img id="main-photo" src="${photos[0].url}" alt="${pg.title}" class="w-full h-full object-cover">
            </div>
            <div class="hidden md:flex flex-col gap-4 h-full">
              ${photos.slice(1, 3).map(p => `
                <div class="flex-1 bg-slate-100 overflow-hidden cursor-pointer" onclick="document.getElementById('main-photo').src = '${p.url}'">
                  <img src="${p.url}" alt="${p.caption || pg.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Two Column Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left Col (Details, Facilities, Reviews) -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Description -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 class="font-bold text-lg text-slate-900">About this Accommodation</h3>
                <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">${pg.description}</p>
                <div class="pt-2 text-xs text-slate-500">
                  Room Sharing Types: <strong>${pg.room_sharing_types.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</strong>
                </div>
              </div>

              <!-- Facilities & Amenities -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 class="font-bold text-lg text-slate-900">Facilities & Services Available</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div class="flex items-center gap-2 ${pg.facilities.wifi ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.wifi ? '📶' : '⚪'}</span> <span>High-Speed Wi-Fi</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.laundry ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.laundry ? '🧺' : '⚪'}</span> <span>Washing Machine</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.housekeeping ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.housekeeping ? '🧹' : '⚪'}</span> <span>Daily Housekeeping</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.ac ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.ac ? '❄️' : '⚪'}</span> <span>Air Conditioning</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.power_backup ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.power_backup ? '⚡' : '⚪'}</span> <span>Power Backup</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.drinking_water ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.drinking_water ? '💧' : '⚪'}</span> <span>RO Drinking Water</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.security ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.security ? '👮' : '⚪'}</span> <span>Security Guard / Warden</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.cctv ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.cctv ? '📹' : '⚪'}</span> <span>CCTV Surveillance</span>
                  </div>
                  <div class="flex items-center gap-2 ${pg.facilities.attached_bathroom ? 'text-slate-900 font-semibold' : 'text-slate-400 line-through'}">
                    <span>${pg.facilities.attached_bathroom ? '🚿' : '⚪'}</span> <span>Attached Bathroom</span>
                  </div>
                </div>
              </div>

              <!-- Verification Panel (If verified) -->
              ${pg.inspection_certificate ? `
                <div class="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-emerald-900 font-bold text-base">
                      <i data-lucide="shield-check" class="w-5 h-5 text-emerald-700"></i>
                      <span>TrustPG Verified Status</span>
                    </div>
                    <button onclick="TrustPG.viewCertificate(${pg.id})" class="text-xs font-bold text-emerald-800 hover:underline">
                      View Full Audit Certificate &rarr;
                    </button>
                  </div>
                  <p class="text-xs text-emerald-800 leading-relaxed">
                    This property underwent physical on-site inspection on <strong>${new Date(pg.inspection_certificate.inspection_date).toLocaleDateString()}</strong> by ${pg.inspection_certificate.inspector_name}. 12 core safety, hygiene, and advertised facility parameters passed audit.
                  </p>
                  <p class="text-[11px] text-emerald-700">
                    Badge validity active until: <strong>${new Date(pg.inspection_certificate.expiry_date).toLocaleDateString()}</strong>.
                  </p>
                </div>
              ` : ''}

              <!-- Resident Reviews & Ratings Section -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 class="font-bold text-lg text-slate-900">Genuine Resident Reviews</h3>
                    <p class="text-xs text-slate-500">Reviews scored across 6 transparent dimensions</p>
                  </div>
                  <button onclick="TrustPG.openReviewForm(${pg.id})" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all">
                    Write a Review
                  </button>
                </div>

                <!-- Review list -->
                <div class="space-y-4">
                  ${pg.reviews && pg.reviews.length > 0 ? pg.reviews.map(r => `
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-900">${r.author_name}</span>
                          ${r.is_resident_verified ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">Verified Resident</span>' : ''}
                          ${r.is_demo ? '<span class="demo-badge">Sample Review — Demo Only</span>' : ''}
                        </div>
                        <span class="font-bold text-amber-600">⭐ ${r.overall_rating} / 5.0</span>
                      </div>
                      <p class="text-xs text-slate-700 leading-relaxed">${r.review_text}</p>
                      
                      <!-- 6 Dimensions Small Grid -->
                      <div class="grid grid-cols-3 sm:grid-cols-6 gap-1 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <div>Clean: <strong>${r.cleanliness}★</strong></div>
                        <div>Food: <strong>${r.food_quality}★</strong></div>
                        <div>Facility: <strong>${r.facilities}★</strong></div>
                        <div>Response: <strong>${r.responsiveness}★</strong></div>
                        <div>Value: <strong>${r.value_for_money}★</strong></div>
                        <div>Accuracy: <strong>${r.accuracy}★</strong></div>
                      </div>
                    </div>
                  `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No reviews yet for this listing. Be the first to share your experience!</p>'}
                </div>
              </div>

            </div>

            <!-- Right Col: TRANSPARENT COST BREAKDOWN TABLE & CONTACT CTA -->
            <div class="lg:col-span-1 space-y-6">
              
              <!-- Transparent Cost Breakdown Card -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 sticky top-28">
                <div class="pb-3 border-b border-slate-100">
                  <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Transparent Cost Breakdown</span>
                  <h3 class="text-xl font-extrabold text-slate-900 mt-1">Know What You Pay</h3>
                </div>

                <!-- Structured Table -->
                <table class="cost-table">
                  <tbody>
                    <tr>
                      <td class="text-slate-600">Monthly Base Rent</td>
                      <td class="text-right font-bold text-slate-900">₹${pg.base_rent.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td class="text-slate-600">Food Charges</td>
                      <td class="text-right font-semibold ${pg.food_included ? 'text-emerald-700' : 'text-slate-800'}">
                        ${pg.food_included ? 'Included in Rent' : (pg.food_charges !== null ? `₹${pg.food_charges.toLocaleString('en-IN')}` : '<span class="text-amber-700 font-bold">Not provided</span>')}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-slate-600">Electricity & Maintenance</td>
                      <td class="text-right font-semibold text-slate-800">
                        ${pg.electricity_maintenance !== null ? `₹${pg.electricity_maintenance.toLocaleString('en-IN')}` : '<span class="text-amber-700 font-bold">Not provided</span>'}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-slate-600">Other Monthly Charges</td>
                      <td class="text-right font-semibold text-slate-800">
                        ${pg.other_charges !== null ? `₹${pg.other_charges.toLocaleString('en-IN')}` : '<span class="text-slate-400">None / Disclosed</span>'}
                      </td>
                    </tr>
                    <tr class="total-row">
                      <td class="text-emerald-950 font-bold">Estimated Monthly Total</td>
                      <td class="text-right text-emerald-800 font-extrabold text-base">
                        ₹${pg.estimated_monthly_total.toLocaleString('en-IN')}
                        ${pg.has_incomplete_cost ? '<div class="text-[10px] text-amber-700 font-normal">(*Incomplete - Charges unlisted)</div>' : ''}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-slate-600 text-xs pt-3">Security Deposit</td>
                      <td class="text-right font-semibold text-slate-800 text-xs pt-3">
                        ${pg.deposit !== null ? `₹${pg.deposit.toLocaleString('en-IN')}` : '<span class="text-amber-700 font-bold">Not provided</span>'}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-slate-600 text-xs">One-time / Move-in Fee</td>
                      <td class="text-right font-semibold text-slate-800 text-xs">
                        ${pg.one_time_fees !== null ? `₹${pg.one_time_fees.toLocaleString('en-IN')}` : '<span class="text-slate-400">₹0</span>'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                ${pg.deposit_terms ? `
                  <div class="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                    <strong>Deposit Refund Terms:</strong> ${pg.deposit_terms}
                  </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="space-y-2.5 pt-2">
                  <button onclick="TrustPG.openContactModal(${pg.id})" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>Contact Owner / Enquire</span>
                  </button>
                  <button onclick="TrustPG.openScheduleVisitModal(${pg.id})" class="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                    <span>Schedule Physical Visit</span>
                  </button>
                </div>

                <p class="text-[10px] text-slate-400 text-center">
                  Free student enquiry &bull; Direct communication with PG owner
                </p>

              </div>

            </div>

          </div>

        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      container.innerHTML = `<div class="max-w-xl mx-auto py-16 text-center text-red-500 text-sm">Failed to load property details: ${err.message}</div>`;
    }
  }

  // View Certificate Helper
  async function viewCertificate(pgId) {
    try {
      const res = await api(`/api/listings/${pgId}`);
      if (res.listing && res.listing.inspection_certificate) {
        showVerificationCertificate(res.listing.inspection_certificate);
      } else {
        showToast('This property does not currently hold an active inspection certificate.', 'warning');
      }
    } catch (e) {
      showToast('Certificate not found', 'error');
    }
  }

  // Toggle Favourite
  async function toggleFavourite(pgId) {
    if (!state.currentUser) {
      showToast('Please login as a student to save favourites', 'warning');
      window.location.hash = '#/login?role=student';
      return;
    }
    try {
      const res = await api('/api/favourites/toggle', {
        method: 'POST',
        body: JSON.stringify({ pg_id: pgId })
      });
      const btn = document.getElementById('fav-btn');
      if (btn) {
        btn.innerHTML = `<span>${res.saved ? '❤️ Saved' : '🤍 Save'}</span>`;
      }
      showToast(res.saved ? 'Saved to your dashboard favourites!' : 'Removed from favourites');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Contact Owner Modal
  function openContactModal(pgId) {
    if (!state.currentUser) {
      showToast('Please login as a student to send an enquiry', 'warning');
      window.location.hash = '#/login?role=student';
      return;
    }
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Send Enquiry to PG Owner</h3>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <form onsubmit="TrustPG.submitEnquiry(event, ${pgId})" class="space-y-4 mt-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expected Move-in Date</label>
            <input type="date" id="enq-date" required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message for Owner</label>
            <textarea id="enq-msg" rows="3" required placeholder="Hi, I am interested in double sharing accommodation. Is food included on weekends?" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Send Enquiry</button>
          </div>
        </form>
      </div>
    `;
  }

  async function submitEnquiry(e, pgId) {
    e.preventDefault();
    const move_in_date = document.getElementById('enq-date').value;
    const message = document.getElementById('enq-msg').value;

    try {
      const res = await api('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify({ pg_id: pgId, message, move_in_date })
      });
      closeModal();
      showToast(res.message);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Schedule Visit Modal
  function openScheduleVisitModal(pgId) {
    if (!state.currentUser) {
      showToast('Please login as a student to schedule a visit', 'warning');
      window.location.hash = '#/login?role=student';
      return;
    }
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Schedule a Physical Property Visit</h3>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <form onsubmit="TrustPG.submitVisit(event, ${pgId})" class="space-y-4 mt-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preferred Date</label>
              <input type="date" id="visit-date" required class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preferred Time</label>
              <select id="visit-time" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="Morning (10 AM - 12 PM)">Morning (10 AM - 12 PM)</option>
                <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Special Notes for Warden / Owner</label>
            <input type="text" id="visit-notes" placeholder="Visiting with parents; would like to see double sharing room" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Confirm Appointment</button>
          </div>
        </form>
      </div>
    `;
  }

  async function submitVisit(e, pgId) {
    e.preventDefault();
    const preferred_date = document.getElementById('visit-date').value;
    const preferred_time = document.getElementById('visit-time').value;
    const notes = document.getElementById('visit-notes').value;

    try {
      const res = await api('/api/visits', {
        method: 'POST',
        body: JSON.stringify({ pg_id: pgId, preferred_date, preferred_time, notes })
      });
      closeModal();
      showToast(res.message);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Report Listing Modal
  function openReportModal(pgId) {
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Report Inaccurate Listing Details</h3>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <p class="text-xs text-slate-600 my-3">
          Help us protect students. If advertised rent, deposit, food, or amenities differ from reality, report it immediately for platform review.
        </p>
        <textarea id="report-reason" rows="3" placeholder="Explain the discrepancy (e.g. owner asked for ₹2,000 extra food fee not listed here)..." class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
        <div class="flex justify-end gap-3 mt-4">
          <button type="button" onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700">Cancel</button>
          <button onclick="TrustPG.closeModal(); TrustPG.showToast('Report received. Administrators will audit this property.');" class="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">Submit Report</button>
        </div>
      </div>
    `;
  }

  // Open Review Form
  function openReviewForm(pgId) {
    if (!state.currentUser) {
      showToast('Please login as a student to write a review', 'warning');
      window.location.hash = '#/login?role=student';
      return;
    }
    window.location.hash = `#/submit-review?pgId=${pgId}`;
  }

  // ==========================================
  // VIEW: 4. COMPARE PGS (SIDE BY SIDE UP TO 4)
  // ==========================================
  async function renderComparePage(container) {
    if (state.compareList.length === 0) {
      container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <i data-lucide="scale" class="w-8 h-8"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">No PGs Selected for Comparison</h2>
          <p class="text-sm text-slate-600 max-w-md mx-auto">
            Compare up to 4 properties side-by-side to evaluate real monthly outflow, security deposits, room sharing options, and verified inspection badges.
          </p>
          <a href="#/find" class="inline-block px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow">
            Browse PGs in Bengaluru
          </a>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    try {
      const res = await api(`/api/listings/compare?ids=${state.compareList.join(',')}`);
      const list = res.listings || [];

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-xs text-slate-500 mb-1">
                <a href="#/" class="hover:underline">Home</a> &gt; <span>Side-by-Side Property Comparison</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Compare Accommodations (${list.length}/4)</h1>
            </div>
            <button onclick="TrustPG.clearCompare()" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Clear Comparison
            </button>
          </div>

          <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <table class="w-full min-w-[700px] border-collapse text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="p-3 font-bold text-slate-500 uppercase tracking-wider w-44">Feature</th>
                  ${list.map(pg => `
                    <th class="p-3 text-slate-900 font-bold min-w-[180px]">
                      <div class="space-y-2">
                        <img src="${pg.primary_photo || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'}" class="w-full h-28 object-cover rounded-xl">
                        <div class="font-bold text-sm line-clamp-1">${pg.title}</div>
                        <div class="text-[11px] text-emerald-700 font-semibold">${pg.locality}</div>
                        <button onclick="TrustPG.toggleCompare(${pg.id})" class="text-[10px] text-red-600 hover:underline">Remove</button>
                      </div>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                
                <!-- Verification Status -->
                <tr class="bg-slate-50/50">
                  <td class="p-3 font-bold text-slate-700">TrustPG Verified</td>
                  ${list.map(pg => `
                    <td class="p-3">
                      ${pg.verification_status === 'verified' ? `
                        <span class="verified-pill">✓ Verified Audit</span>
                      ` : `
                        <span class="text-slate-400">Unverified</span>
                      `}
                    </td>
                  `).join('')}
                </tr>

                <!-- Base Rent -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Monthly Base Rent</td>
                  ${list.map(pg => `
                    <td class="p-3 font-bold text-slate-900">₹${pg.base_rent.toLocaleString('en-IN')}/mo</td>
                  `).join('')}
                </tr>

                <!-- Food Charges -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Food Charges</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.food_charges_display}</td>
                  `).join('')}
                </tr>

                <!-- Electricity & Maintenance -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Electricity & Maint.</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.electricity_display}</td>
                  `).join('')}
                </tr>

                <!-- Estimated Monthly Total -->
                <tr class="bg-emerald-50/60 font-bold text-emerald-950">
                  <td class="p-3 font-extrabold text-emerald-900">Est. Monthly Total</td>
                  ${list.map(pg => `
                    <td class="p-3 text-base text-emerald-800 font-extrabold">
                      ₹${pg.estimated_monthly_total.toLocaleString('en-IN')}/mo
                      ${pg.has_incomplete_cost ? '<div class="text-[10px] text-amber-700 font-normal">(*Incomplete info)</div>' : ''}
                    </td>
                  `).join('')}
                </tr>

                <!-- Security Deposit -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Security Deposit</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.deposit_display}</td>
                  `).join('')}
                </tr>

                <!-- Room Types -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Sharing Options</td>
                  ${list.map(pg => `
                    <td class="p-3 capitalize">${pg.room_sharing_types.join(', ')}</td>
                  `).join('')}
                </tr>

                <!-- Wi-Fi -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Wi-Fi</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.wifi ? '✅ Included' : '❌ No'}</td>
                  `).join('')}
                </tr>

                <!-- Laundry -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Laundry</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.laundry ? '✅ Included' : '❌ No'}</td>
                  `).join('')}
                </tr>

                <!-- Power Backup -->
                <tr>
                  <td class="p-3 font-bold text-slate-700">Power Backup</td>
                  ${list.map(pg => `
                    <td class="p-3">${pg.power_backup ? '✅ Yes' : '❌ No'}</td>
                  `).join('')}
                </tr>

                <!-- Action Button -->
                <tr>
                  <td class="p-3"></td>
                  ${list.map(pg => `
                    <td class="p-3">
                      <a href="#/pg/${pg.id}" class="block w-full py-2 bg-slate-900 text-white rounded-xl text-center font-bold text-xs hover:bg-slate-800">
                        View Details
                      </a>
                    </td>
                  `).join('')}
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      `;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      container.innerHTML = '<div class="p-8 text-center text-red-500">Failed to load comparison data.</div>';
    }
  }

  function clearCompare() {
    state.compareList = [];
    localStorage.removeItem('trustpg_compare');
    updateCompareBadge();
    navigate();
  }

  // ==========================================
  // VIEW: 5. HOW IT WORKS
  // ==========================================
  function renderHowItWorksPage(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div class="text-center space-y-3">
          <span class="demo-badge">Student Transparency Guide</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">How TrustPG Works</h1>
          <p class="text-sm text-slate-600 max-w-xl mx-auto">
            Discover how TrustPG cuts through misleading broker ads and ensures you pay exactly what is advertised.
          </p>
        </div>

        <div class="space-y-8">
          <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0">1</span>
            <div>
              <h3 class="font-bold text-lg text-slate-900">Search by Locality, Budget & Needs</h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                Filter Bengaluru accommodations by college proximity, room sharing (single, double, triple), food preferences, and must-have facilities like power backup and high-speed Wi-Fi.
              </p>
            </div>
          </div>

          <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0">2</span>
            <div>
              <h3 class="font-bold text-lg text-slate-900">Evaluate the True Cost of Living</h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                Don't get tricked by artificially low base rents. TrustPG sums rent, food, electricity, maintenance, and hidden charges to give you an accurate estimated monthly total.
              </p>
            </div>
          </div>

          <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0">3</span>
            <div>
              <h3 class="font-bold text-lg text-slate-900">Look for the TrustPG Verified Badge</h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                Verified properties have completed an independent 12-point physical audit by an authorized inspector covering Wi-Fi speed, water purity, room hygiene, and price disclosures.
              </p>
            </div>
          </div>

          <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <span class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0">4</span>
            <div>
              <h3 class="font-bold text-lg text-slate-900">Schedule a Physical Visit & Move In</h3>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                Send an enquiry or book a visit directly through your student dashboard with zero broker fees. Once confirmed, you can review your stay to help future students.
              </p>
            </div>
          </div>
        </div>

        <div class="text-center pt-4">
          <a href="#/find" class="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow">
            Start Finding Your PG Now
          </a>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: 6. HOW VERIFICATION WORKS (GET YOUR PG VERIFIED)
  // ==========================================
  function renderVerificationPage(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div class="text-center space-y-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider border border-emerald-200">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
            Inspection Standard
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">Get Your PG Verified</h1>
          <p class="text-sm text-slate-600 max-w-xl mx-auto">
            TrustPG on-site verification helps honest PG owners stand out to thousands of students seeking reliable accommodation in Bengaluru.
          </p>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-xl font-bold text-slate-900">The 12-Point Inspection Checklist</h3>
              <p class="text-xs text-slate-500">Every check is recorded by an authorized field auditor on-site</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500">Inspection Service Fee:</span>
              <div class="text-xl font-extrabold text-emerald-800">₹999 <span class="text-xs font-normal text-slate-500">(Proposed Fixed Fee)</span></div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">1.</span>
              <span>Physical address and locality match listing</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">2.</span>
              <span>Advertised room types and bed availability confirmed</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">3.</span>
              <span>Room condition, ventilation, and visible cleanliness</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">4.</span>
              <span>Wi-Fi connectivity & live speed test clocked</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">5.</span>
              <span>Food hygiene and kitchen cooking arrangements</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">6.</span>
              <span>Operational laundry / washing machines</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">7.</span>
              <span>Daily housekeeping schedule & logbook</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">8.</span>
              <span>Drinking water purifier (RO unit operation & TDS)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">9.</span>
              <span>Advertised common facilities (lounge, microwave, fridge)</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">10.</span>
              <span>CCTV surveillance and warden/gate security</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">11.</span>
              <span>Accuracy of listing photographs vs physical premises</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span class="font-bold text-emerald-600">12.</span>
              <span>Transparent disclosure of rent, deposit & house rules</span>
            </div>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <h4 class="font-bold text-sm">Strict Anti-Bribery & Audit Governance Policy</h4>
            <p class="leading-relaxed">
              <strong>Core Rule:</strong> Paying the ₹999 inspection fee covers the field auditor's time and report creation. It does <em>not</em> guarantee that a badge will be awarded. If checklist criteria fail, the property receives a "Reinspection Required" status and must correct deficiencies.
            </p>
            <p class="text-[11px] text-emerald-800">
              Only a platform administrator (not the field inspector) can approve the final badge. Badges remain valid for 180 days.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span class="text-xs text-slate-500">Are you a Bengaluru PG owner?</span>
            <a href="#/list-pg" class="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800">
              List Your PG & Request Inspection
            </a>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // VIEW: 7. LIST YOUR PG (OWNER ONBOARDING)
  // ==========================================
  function renderListPgPage(container) {
    if (!state.currentUser || (state.currentUser.role !== 'owner' && state.currentUser.role !== 'admin')) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <i data-lucide="home" class="w-8 h-8"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">List Your PG on TrustPG</h2>
          <p class="text-sm text-slate-600">
            Please login with your PG Owner account to create and manage listings.
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <a href="#/login?role=owner" class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700">
              Owner Sign In
            </a>
            <button onclick="TrustPG.quickLogin('owner@trustpg.com', 'Password@123')" class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50">
              ⚡ 1-Click Owner Demo
            </button>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <span class="demo-badge">Owner Onboarding</span>
          <h1 class="text-3xl font-extrabold text-slate-900 mt-2">Publish a New PG Listing</h1>
          <p class="text-xs text-slate-600 mt-1">
            Provide transparent rent and fee breakdowns. Honest listings receive higher engagement and verified badges.
          </p>
        </div>

        <form onsubmit="TrustPG.submitNewListing(event)" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          <!-- Basic Info -->
          <div class="space-y-4">
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 border-b pb-2">1. Property Overview</h3>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">PG Name / Title *</label>
              <input type="text" id="new-title" required placeholder="e.g. Royal Comforts Luxury PG" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Bengaluru Locality *</label>
                <select id="new-locality" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
                  <option value="Koramangala">Koramangala</option>
                  <option value="BTM Layout">BTM Layout</option>
                  <option value="HSR Layout">HSR Layout</option>
                  <option value="Electronic City">Electronic City</option>
                  <option value="Whitefield">Whitefield</option>
                  <option value="Marathahalli">Marathahalli</option>
                  <option value="Indiranagar">Indiranagar</option>
                  <option value="Jayanagar">Jayanagar</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Property Gender *</label>
                <select id="new-gender" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
                  <option value="coliving">Co-living Space</option>
                  <option value="women">Women's PG Only</option>
                  <option value="men">Men's PG Only</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Full Physical Address *</label>
              <input type="text" id="new-address" required placeholder="Plot, Street, Cross, Landmark, Pincode" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
              <textarea id="new-desc" rows="3" required placeholder="Highlight proximity to colleges, metro station, quiet hours, meals provided..." class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>
          </div>

          <!-- Pricing & Transparent Outflow -->
          <div class="space-y-4">
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-500 border-b pb-2">2. Transparent Pricing & Cost Breakdown</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Monthly Base Rent (₹) *</label>
                <input type="number" id="new-rent" required min="3000" max="100000" placeholder="e.g. 10000" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Food Arrangement *</label>
                <select id="new-food-inc" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" onchange="document.getElementById('new-food-cost-wrap').style.display = this.value === '1' ? 'none' : 'block'">
                  <option value="1">Food Included in Base Rent</option>
                  <option value="0">Separate Monthly Food Charge</option>
                </select>
              </div>
            </div>

            <div id="new-food-cost-wrap" style="display: none;">
              <label class="block text-xs font-bold text-slate-700 mb-1">Monthly Food Surcharge (₹) (If separate)</label>
              <input type="number" id="new-food-cost" placeholder="e.g. 2000" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Electricity & Maintenance (₹/mo)</label>
                <input type="number" id="new-elec" placeholder="e.g. 600" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Refundable Security Deposit (₹)</label>
                <input type="number" id="new-deposit" placeholder="e.g. 15000" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Deposit Refund & Exit Notice Terms</label>
              <input type="text" id="new-deposit-terms" placeholder="e.g. 100% refundable upon 30 days notice" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
          </div>

          <!-- Mandatory Accuracy Declaration (Section 11) -->
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-3">
            <h4 class="font-bold text-sm">Mandatory Owner Accuracy Declaration</h4>
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" id="accuracy-declaration" required class="rounded text-emerald-600 mt-0.5">
              <span class="leading-relaxed">
                “I confirm that the information and facilities stated in this listing are accurate to the best of my knowledge. I understand that false claims may lead to listing suspension.”
              </span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <a href="#/dashboard/owner" class="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700">Cancel</a>
            <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow">
              Publish Transparent Listing
            </button>
          </div>

        </form>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  async function submitNewListing(e) {
    e.preventDefault();
    const declared = document.getElementById('accuracy-declaration').checked;
    if (!declared) {
      showToast('You must confirm the listing accuracy declaration.', 'error');
      return;
    }

    const title = document.getElementById('new-title').value;
    const locality = document.getElementById('new-locality').value;
    const gender_preference = document.getElementById('new-gender').value;
    const address = document.getElementById('new-address').value;
    const description = document.getElementById('new-desc').value;
    const base_rent = document.getElementById('new-rent').value;
    const food_included = document.getElementById('new-food-inc').value === '1';
    const food_charges = food_included ? 0 : document.getElementById('new-food-cost').value;
    const electricity_maintenance = document.getElementById('new-elec').value;
    const deposit = document.getElementById('new-deposit').value;
    const deposit_terms = document.getElementById('new-deposit-terms').value;

    try {
      const res = await api('/api/owner/listings', {
        method: 'POST',
        body: JSON.stringify({
          title, locality, gender_preference, address, description,
          base_rent, food_included, food_charges: food_charges ? Number(food_charges) : null,
          electricity_maintenance: electricity_maintenance ? Number(electricity_maintenance) : null,
          deposit: deposit ? Number(deposit) : null,
          deposit_terms,
          accuracy_declaration: true
        })
      });
      showToast(res.message);
      window.location.hash = '#/dashboard/owner';
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==========================================
  // VIEW: 8 & 9. LOGIN / SIGN UP
  // ==========================================
  function renderAuthPage(container, hash) {
    const isOwner = hash.includes('role=owner');
    const roleDefault = isOwner ? 'owner' : 'student';

    container.innerHTML = `
      <div class="max-w-md mx-auto px-4 py-16 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900">
            ${isOwner ? 'PG Owner Portal' : 'Student Sign In'}
          </h2>
          <p class="text-xs text-slate-600">
            Access transparent accommodation discovery and management.
          </p>
        </div>

        <!-- 1-Click Demo Presets Banner -->
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <button onclick="TrustPG.openQuickLoginModal()" class="text-xs text-emerald-800 font-bold hover:underline">
            ⚡ Need to test right now? Open 1-Click Demo Presets
          </button>
        </div>

        <!-- Tabs -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div class="flex border-b border-slate-100 pb-3 gap-4 text-sm font-bold">
            <button id="tab-login" onclick="TrustPG.switchAuthTab('login')" class="text-emerald-700 border-b-2 border-emerald-600 pb-1">
              Sign In
            </button>
            <button id="tab-register" onclick="TrustPG.switchAuthTab('register')" class="text-slate-400 hover:text-slate-600 pb-1">
              New Account
            </button>
          </div>

          <!-- Sign In Form -->
          <form id="form-login" onsubmit="TrustPG.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input type="email" id="login-email" required placeholder="${isOwner ? 'owner@trustpg.com' : 'student@trustpg.com'}" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input type="password" id="login-pass" required placeholder="••••••••" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow">
              Sign In
            </button>
          </form>

          <!-- Register Form -->
          <form id="form-register" onsubmit="TrustPG.handleRegister(event)" class="space-y-4 hidden">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input type="text" id="reg-name" required placeholder="e.g. Priya Sharma" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input type="email" id="reg-email" required placeholder="you@example.com" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input type="tel" id="reg-phone" placeholder="+91 98765 43210" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Account Role</label>
              <select id="reg-role" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-semibold">
                <option value="student" ${roleDefault === 'student' ? 'selected' : ''}>College Student</option>
                <option value="owner" ${roleDefault === 'owner' ? 'selected' : ''}>PG Owner</option>
                <option value="inspector">Authorized Inspector</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input type="password" id="reg-pass" required placeholder="••••••••" class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            </div>
            <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow">
              Create Account
            </button>
          </form>

        </div>
      </div>
    `;
  }

  function switchAuthTab(tab) {
    const fLogin = document.getElementById('form-login');
    const fReg = document.getElementById('form-register');
    const tLogin = document.getElementById('tab-login');
    const tReg = document.getElementById('tab-register');

    if (tab === 'login') {
      fLogin.classList.remove('hidden');
      fReg.classList.add('hidden');
      tLogin.className = 'text-emerald-700 border-b-2 border-emerald-600 pb-1';
      tReg.className = 'text-slate-400 hover:text-slate-600 pb-1';
    } else {
      fLogin.classList.add('hidden');
      fReg.classList.remove('hidden');
      tReg.className = 'text-emerald-700 border-b-2 border-emerald-600 pb-1';
      tLogin.className = 'text-slate-400 hover:text-slate-600 pb-1';
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    await login(email, pass);
  }

  async function handleRegister(e) {
    e.preventDefault();
    const full_name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-pass').value;
    await register({ full_name, email, phone, role, password });
  }

  // ==========================================
  // VIEW: 10. STUDENT DASHBOARD
  // ==========================================
  async function renderStudentDashboard(container) {
    if (!state.currentUser) {
      window.location.hash = '#/login?role=student';
      return;
    }

    try {
      const [favRes, enqRes, visitRes] = await Promise.all([
        api('/api/favourites'),
        api('/api/student/enquiries'),
        api('/api/student/visits')
      ]);

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span class="demo-badge">Student Portal</span>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Welcome, ${state.currentUser.full_name}
              </h1>
              <p class="text-xs text-slate-600">${state.currentUser.email}</p>
            </div>
            <a href="#/find" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 self-start sm:self-auto shadow">
              Explore More PGs
            </a>
          </div>

          <!-- Dashboard Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left 2 Cols: Enquiries & Visit Requests -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Active Enquiries -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 class="font-bold text-base text-slate-900 flex items-center justify-between">
                  <span>My Enquiries (${enqRes.enquiries.length})</span>
                </h3>
                <div class="space-y-3">
                  ${enqRes.enquiries.length > 0 ? enqRes.enquiries.map(e => `
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <h4 class="font-bold text-sm text-slate-900"><a href="#/pg/${e.pg_id}" class="hover:text-emerald-700">${e.pg_title}</a></h4>
                        <p class="text-xs text-slate-500">${e.locality} &bull; Owner: ${e.owner_name} (${e.owner_phone})</p>
                        <p class="text-xs text-slate-700 mt-2 bg-white p-2 rounded border border-slate-200">"${e.message}"</p>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${e.status === 'move_in_confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                          ${e.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div class="text-[10px] text-slate-400 mt-2">${new Date(e.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No active enquiries yet.</p>'}
                </div>
              </div>

              <!-- Scheduled Visits -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 class="font-bold text-base text-slate-900">Physical Visit Requests (${visitRes.visits.length})</h3>
                <div class="space-y-3">
                  ${visitRes.visits.length > 0 ? visitRes.visits.map(v => `
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <h4 class="font-bold text-slate-900">${v.pg_title}</h4>
                        <p class="text-slate-600 mt-0.5">Appointment: <strong>${v.preferred_date}</strong> (${v.preferred_time})</p>
                        ${v.notes ? `<p class="text-[11px] text-slate-500">Note: ${v.notes}</p>` : ''}
                      </div>
                      <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                        ${v.status}
                      </span>
                    </div>
                  `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No scheduled visits yet.</p>'}
                </div>
              </div>

            </div>

            <!-- Right Col: Saved Favourites -->
            <div class="lg:col-span-1 space-y-6">
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 class="font-bold text-base text-slate-900">Saved Favourites (${favRes.favourites.length})</h3>
                <div class="space-y-3">
                  ${favRes.favourites.length > 0 ? favRes.favourites.map(f => `
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <img src="${f.primary_photo || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80'}" class="w-14 h-14 object-cover rounded-lg shrink-0">
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs text-slate-900 truncate"><a href="#/pg/${f.id}" class="hover:text-emerald-700">${f.title}</a></h4>
                        <p class="text-[11px] text-emerald-800 font-semibold mt-0.5">₹${f.base_rent.toLocaleString('en-IN')}/mo</p>
                        <p class="text-[10px] text-slate-500">${f.locality}</p>
                      </div>
                      <button onclick="TrustPG.toggleFavourite(${f.id})" class="text-red-500 hover:text-red-700 text-sm">✕</button>
                    </div>
                  `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">You have not saved any PGs yet.</p>'}
                </div>
              </div>
            </div>

          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-red-500">Error loading student dashboard: ${e.message}</div>`;
    }
  }

  // ==========================================
  // VIEW: 11. PG OWNER DASHBOARD
  // ==========================================
  async function renderOwnerDashboard(container) {
    if (!state.currentUser || (state.currentUser.role !== 'owner' && state.currentUser.role !== 'admin')) {
      window.location.hash = '#/login?role=owner';
      return;
    }

    try {
      const [listingsRes, enqRes, moveInRes] = await Promise.all([
        api('/api/owner/listings'),
        api('/api/owner/enquiries'),
        api('/api/owner/move-ins')
      ]);

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span class="demo-badge">PG Owner Portal</span>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Owner Dashboard &bull; ${state.currentUser.full_name}
              </h1>
              <p class="text-xs text-slate-600">Manage listings, handle student enquiries, and request on-site audits.</p>
            </div>
            <a href="#/list-pg" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 self-start sm:self-auto shadow">
              + Add New PG Listing
            </a>
          </div>

          <!-- My Properties List -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-lg text-slate-900">My PG Accommodations (${listingsRes.listings.length})</h3>
            
            <div class="space-y-4">
              ${listingsRes.listings.length > 0 ? listingsRes.listings.map(pg => `
                <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div class="flex items-start gap-4">
                    <img src="${pg.primary_photo || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80'}" class="w-20 h-20 object-cover rounded-xl shrink-0">
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-bold text-base text-slate-900"><a href="#/pg/${pg.id}" class="hover:text-emerald-700">${pg.title}</a></h4>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${pg.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                          ${pg.verification_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 mt-1">${pg.locality} &bull; Base Rent: ₹${pg.base_rent.toLocaleString('en-IN')}/mo</p>
                      <p class="text-xs text-slate-600 mt-1">Enquiries: <strong>${pg.enquiry_count || 0}</strong> | Confirmed Move-ins: <strong>${pg.move_in_count || 0}</strong></p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end md:self-auto">
                    ${pg.verification_status === 'not_requested' ? `
                      <button onclick="TrustPG.requestVerification(${pg.id})" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow">
                        Request Verification (₹999)
                      </button>
                    ` : pg.verification_status === 'payment_pending' ? `
                      <button onclick="TrustPG.payVerification(${pg.id})" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow">
                        Complete Demo Payment (₹999)
                      </button>
                    ` : `
                      <span class="text-xs font-bold text-slate-500">Inspection In Progress</span>
                    `}
                    <a href="#/pg/${pg.id}" class="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100">
                      View
                    </a>
                  </div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 py-6 text-center">You have not created any listings yet. Click "+ Add New PG Listing" above.</p>'}
            </div>
          </div>

          <!-- Received Enquiries & Move-in Confirmation (₹1,500 Fee tracker with deduplication) -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 class="font-bold text-lg text-slate-900">Received Student Enquiries</h3>
              <p class="text-xs text-slate-500">Confirm student move-ins here. Standard success platform fee of ₹1,500 applies per confirmed stay.</p>
            </div>

            <div class="space-y-3">
              ${enqRes.enquiries.length > 0 ? enqRes.enquiries.map(e => `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span class="font-bold text-sm text-slate-900">${e.student_name}</span>
                    <span class="text-xs text-slate-500">(${e.student_phone} &bull; ${e.student_email})</span>
                    <p class="text-xs text-emerald-800 font-semibold mt-0.5">Property: ${e.pg_title}</p>
                    <p class="text-xs text-slate-700 mt-1">"${e.message}"</p>
                  </div>
                  <div class="shrink-0 flex items-center gap-2">
                    ${e.status === 'move_in_confirmed' ? `
                      <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        ✓ Move-in Confirmed
                      </span>
                    ` : `
                      <button onclick="TrustPG.confirmMoveIn(${e.id})" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
                        Confirm Move-in
                      </button>
                    `}
                  </div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No enquiries received yet.</p>'}
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-red-500">Error loading owner dashboard: ${e.message}</div>`;
    }
  }

  // Owner inspection request
  async function requestVerification(pgId) {
    try {
      const res = await api('/api/inspections/request', {
        method: 'POST',
        body: JSON.stringify({ pg_id: pgId })
      });
      showToast(res.message);
      // Automatically prompt payment demo modal
      payVerification(pgId, res.inspection_id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Owner demo payment simulation
  function payVerification(pgId, inspectionId) {
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">On-Site Inspection Payment (Demo Mode)</h3>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <div class="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
          <p class="font-bold text-sm">Inspection Fee: ₹999</p>
          <p>Payment Gateway integration is in Demo Mode. Clicking "Confirm Demo Payment" records a valid simulated payment reference and notifies Platform Administrators to dispatch an inspector.</p>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold">Cancel</button>
          <button onclick="TrustPG.processDemoPayment(${inspectionId || 1})" class="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow">
            Confirm Demo Payment (₹999)
          </button>
        </div>
      </div>
    `;
  }

  async function processDemoPayment(inspectionId) {
    try {
      const res = await api('/api/inspections/pay', {
        method: 'POST',
        body: JSON.stringify({ inspection_id: inspectionId })
      });
      closeModal();
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Owner move-in confirmation (with deduplication)
  async function confirmMoveIn(enquiryId) {
    if (!confirm('Confirm this student move-in? Standard platform fee of ₹1,500 will be registered.')) return;
    try {
      const res = await api('/api/owner/move-ins/confirm', {
        method: 'POST',
        body: JSON.stringify({ enquiry_id: enquiryId })
      });
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==========================================
  // VIEW: 12. INSPECTOR DASHBOARD
  // ==========================================
  async function renderInspectorDashboard(container) {
    if (!state.currentUser || (state.currentUser.role !== 'inspector' && state.currentUser.role !== 'admin')) {
      window.location.hash = '#/login?role=inspector';
      return;
    }

    try {
      const res = await api('/api/inspector/assigned');
      const list = res.inspections || [];

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span class="demo-badge">Auditor Portal</span>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Authorized Inspector Workspace
              </h1>
              <p class="text-xs text-slate-600">Inspector: ${state.currentUser.full_name} (${state.currentUser.email})</p>
            </div>
            <div class="text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200">
              Assigned Inspections: <strong>${list.length}</strong>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-lg text-slate-900">Assigned Inspection Requests</h3>
            
            <div class="space-y-4">
              ${list.length > 0 ? list.map(item => `
                <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 class="font-bold text-base text-slate-900">${item.pg_title}</h4>
                    <p class="text-xs text-slate-500">${item.locality} &bull; Address: ${item.address}</p>
                    <p class="text-xs text-slate-600 mt-1">Owner: <strong>${item.owner_name}</strong> (${item.owner_phone})</p>
                    <p class="text-[11px] text-emerald-800 mt-1">Payment Status: <strong>${item.payment_status.toUpperCase()}</strong> (${item.payment_ref})</p>
                  </div>
                  <div class="flex items-center gap-2 self-end md:self-auto">
                    <button onclick="TrustPG.openChecklistModal(${item.id})" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow">
                      Conduct 12-Point Checklist &rarr;
                    </button>
                  </div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 py-6 text-center">No inspections assigned right now.</p>'}
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-red-500">Error loading inspector portal: ${e.message}</div>`;
    }
  }

  // Inspector 12-point checklist editor modal
  function openChecklistModal(inspectionId) {
    const checklistItems = [
      'Property address matching the listing',
      'Advertised room type and bed availability',
      'Room condition and visible cleanliness',
      'Wi-Fi availability and basic functioning (live speed test)',
      'Food arrangements and kitchen hygiene',
      'Laundry machines operation',
      'Housekeeping schedule and logbook',
      'RO drinking water dispenser functioning',
      'Advertised common facilities (lounge, pantry)',
      'Stated security arrangements & CCTV',
      'Accuracy of listing photographs',
      'Disclosure of rent, deposits, and house rules'
    ];

    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6 sm:p-8 max-w-2xl">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">12-Point On-Site Inspection Audit</h3>
            <p class="text-xs text-slate-500">Record genuine findings. Failed criteria will require reinspection.</p>
          </div>
          <button onclick="TrustPG.closeModal()" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onsubmit="TrustPG.submitInspectionChecklist(event, ${inspectionId})" class="space-y-4 mt-4">
          <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            ${checklistItems.map((title, i) => `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>${i + 1}. ${title}</span>
                  <select id="check-${i}" class="px-2 py-1 border rounded bg-white text-xs font-semibold">
                    <option value="pass">Pass ✅</option>
                    <option value="fail">Fail ❌</option>
                    <option value="na">Not Applicable ⚪</option>
                    <option value="unable">Unable to Verify ⚠️</option>
                  </select>
                </div>
                <input type="text" id="note-${i}" placeholder="Inspector notes / observed measurements..." class="w-full px-2.5 py-1 text-xs border rounded bg-white">
              </div>
            `).join('')}
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Overall Inspector Summary & Evidence Notes</label>
            <textarea id="overall-inspector-notes" rows="2" placeholder="e.g. Wi-Fi clocked at 280 Mbps. Clean kitchen. Biometric access verified." class="w-full px-3 py-2 border rounded-xl text-xs"></textarea>
          </div>

          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Security Notice:</strong> Submitting this checklist forwards findings to Platform Administrators for final badge approval. Inspectors cannot approve badges directly.
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow">
              Submit Audit Findings
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async function submitInspectionChecklist(e, inspectionId) {
    e.preventDefault();
    const checklistItems = [
      'Property address matching the listing',
      'Advertised room type and bed availability',
      'Room condition and visible cleanliness',
      'Wi-Fi availability and basic functioning (live speed test)',
      'Food arrangements and kitchen hygiene',
      'Laundry machines operation',
      'Housekeeping schedule and logbook',
      'RO drinking water dispenser functioning',
      'Advertised common facilities (lounge, pantry)',
      'Stated security arrangements & CCTV',
      'Accuracy of listing photographs',
      'Disclosure of rent, deposits, and house rules'
    ];

    const data = checklistItems.map((title, i) => ({
      id: i + 1,
      title,
      status: document.getElementById(`check-${i}`).value,
      notes: document.getElementById(`note-${i}`).value
    }));

    const notes = document.getElementById('overall-inspector-notes').value;

    try {
      const res = await api(`/api/inspector/inspections/${inspectionId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ checklist_data: data, inspector_notes: notes, is_draft: false })
      });
      closeModal();
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==========================================
  // VIEW: 13. ADMIN DASHBOARD
  // ==========================================
  async function renderAdminDashboard(container) {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      window.location.hash = '#/login?role=student';
      showToast('Admin privilege required', 'error');
      return;
    }

    try {
      const [metricsRes, inspRes, reportsRes, settingsRes, auditRes] = await Promise.all([
        api('/api/admin/metrics'),
        api('/api/admin/inspections'),
        api('/api/admin/reports'),
        api('/api/admin/settings'),
        api('/api/admin/audit-logs')
      ]);

      const m = metricsRes.metrics;

      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span class="demo-badge">Executive Governance Panel</span>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Platform Administrator Dashboard</h1>
              <p class="text-xs text-slate-600">Platform metrics, badge approval, inspection dispatch, and moderation.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="TrustPG.reseedDemoData()" class="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50">
                Reseed Demo Data
              </button>
              <button onclick="TrustPG.purgeDemoData()" class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow">
                Purge Demo Listings
              </button>
            </div>
          </div>

          <!-- Metrics Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span class="text-xs text-slate-500 font-semibold">Active Listings</span>
              <div class="text-2xl font-extrabold text-slate-900 mt-1">${m.active_listings}</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span class="text-xs text-slate-500 font-semibold">Student Users</span>
              <div class="text-2xl font-extrabold text-slate-900 mt-1">${m.total_students}</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span class="text-xs text-slate-500 font-semibold">Verified Properties</span>
              <div class="text-2xl font-extrabold text-emerald-700 mt-1">${m.verified_properties}</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span class="text-xs text-slate-500 font-semibold">Confirmed Move-Ins</span>
              <div class="text-2xl font-extrabold text-blue-700 mt-1">${m.confirmed_move_ins}</div>
            </div>
            <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span class="text-xs text-slate-500 font-semibold">Platform Fee Revenue</span>
              <div class="text-2xl font-extrabold text-slate-900 mt-1">₹${(m.move_in_revenue_inr || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <!-- Pending Inspection Requests (Assign Inspector & Final Approval) -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-lg text-slate-900">Inspection Requests & Approvals (${inspRes.inspections.length})</h3>
            </div>

            <div class="space-y-4">
              ${inspRes.inspections.length > 0 ? inspRes.inspections.map(insp => `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-bold text-sm text-slate-900">${insp.pg_title}</h4>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${insp.result === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                        Result: ${insp.result.toUpperCase()}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">${insp.locality} &bull; Owner: ${insp.owner_name} &bull; Payment: <strong>${insp.payment_status}</strong></p>
                    <p class="text-xs text-emerald-800 mt-1">Assigned Inspector: <strong>${insp.inspector_name || 'Not assigned yet'}</strong></p>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <!-- Assign Inspector button if unassigned -->
                    ${!insp.inspector_id ? `
                      <button onclick="TrustPG.openAssignInspectorModal(${insp.id})" class="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                        Assign Inspector
                      </button>
                    ` : ''}

                    <!-- Final Approval or Rejection buttons -->
                    <button onclick="TrustPG.adminDecision(${insp.id}, 'approve')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow">
                      Approve Verified Badge
                    </button>
                    <button onclick="TrustPG.adminDecision(${insp.id}, 'reinspection')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold">
                      Require Recheck
                    </button>
                    <button onclick="TrustPG.adminDecision(${insp.id}, 'reject')" class="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold">
                      Reject
                    </button>
                  </div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No inspection requests found.</p>'}
            </div>
          </div>

          <!-- Moderation & Platform Settings Two Col -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Reported Reviews Moderation -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="font-bold text-base text-slate-900">Reported Reviews Moderation (${reportsRes.reports.length})</h3>
              <div class="space-y-3">
                ${reportsRes.reports.length > 0 ? reportsRes.reports.map(rep => `
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div class="flex justify-between font-bold">
                      <span>${rep.pg_title}</span>
                      <span class="text-red-600">Reported by ${rep.reported_by_name}</span>
                    </div>
                    <p class="text-slate-700 italic">"${rep.review_text}"</p>
                    <p class="text-slate-500 text-[11px]">Reason: ${rep.reason}</p>
                    <div class="flex justify-end gap-2 pt-1">
                      <button onclick="TrustPG.moderateReport(${rep.id}, 'dismiss')" class="px-3 py-1 border rounded text-[11px] font-bold">Dismiss Report</button>
                      <button onclick="TrustPG.moderateReport(${rep.id}, 'hide_review')" class="px-3 py-1 bg-red-600 text-white rounded text-[11px] font-bold">Hide Review</button>
                    </div>
                  </div>
                `).join('') : '<p class="text-xs text-slate-500 py-4 text-center">No reported reviews pending moderation.</p>'}
              </div>
            </div>

            <!-- Platform Settings Configuration -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="font-bold text-base text-slate-900">Fee & Validity Configuration</h3>
              <form onsubmit="TrustPG.updateAdminSettings(event)" class="space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Inspection Audit Fee (₹)</label>
                  <input type="number" id="cfg-insp-fee" value="${getSettingValue(settingsRes.settings, 'inspection_fee', '999')}" class="w-full px-3 py-2 border rounded-xl text-sm font-bold">
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Confirmed Move-In Platform Fee (₹)</label>
                  <input type="number" id="cfg-movein-fee" value="${getSettingValue(settingsRes.settings, 'move_in_fee', '1500')}" class="w-full px-3 py-2 border rounded-xl text-sm font-bold">
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Badge Validity Period (Days)</label>
                  <input type="number" id="cfg-validity-days" value="${getSettingValue(settingsRes.settings, 'verification_validity_days', '180')}" class="w-full px-3 py-2 border rounded-xl text-sm font-bold">
                </div>
                <button type="submit" class="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                  Save Platform Configuration
                </button>
              </form>
            </div>

          </div>

          <!-- Audit Logs -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-base text-slate-900">System Audit Trail</h3>
            <div class="max-h-60 overflow-y-auto space-y-1.5 text-xs">
              ${auditRes.logs.map(l => `
                <div class="flex items-center justify-between p-2 rounded bg-slate-50 text-slate-700">
                  <div><strong>${l.action}</strong>: ${l.details || ''} (${l.user_name || 'System'})</div>
                  <div class="text-[10px] text-slate-400">${new Date(l.created_at).toLocaleTimeString()}</div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-red-500">Error loading admin dashboard: ${e.message}</div>`;
    }
  }

  function getSettingValue(arr, key, fallback) {
    const item = (arr || []).find(s => s.key === key);
    return item ? item.value : fallback;
  }

  // Admin Assign Inspector Modal
  function openAssignInspectorModal(inspectionId) {
    const container = document.getElementById('modal-container');
    container.className = 'modal-overlay';
    container.innerHTML = `
      <div class="modal-content p-6">
        <h3 class="font-bold text-base text-slate-900 mb-4">Assign Authorised Field Inspector</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Select Inspector</label>
            <select id="assign-insp-id" class="w-full px-3 py-2 border rounded-xl text-sm">
              <option value="3">Anand Kumar (Authorized Field Inspector)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Scheduled Audit Date</label>
            <input type="date" id="assign-insp-date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 border rounded-xl text-sm">
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button onclick="TrustPG.closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold">Cancel</button>
            <button onclick="TrustPG.assignInspector(${inspectionId})" class="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Confirm Assignment</button>
          </div>
        </div>
      </div>
    `;
  }

  async function assignInspector(inspectionId) {
    const inspector_id = document.getElementById('assign-insp-id').value;
    const scheduled_date = document.getElementById('assign-insp-date').value;

    try {
      const res = await api(`/api/admin/inspections/${inspectionId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ inspector_id, scheduled_date })
      });
      closeModal();
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function adminDecision(inspectionId, decision) {
    try {
      const res = await api(`/api/admin/inspections/${inspectionId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, admin_notes: `Processed ${decision.toUpperCase()} by TrustPG Governance Team` })
      });
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function moderateReport(reportId, action) {
    try {
      const res = await api(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function updateAdminSettings(e) {
    e.preventDefault();
    const inspection_fee = document.getElementById('cfg-insp-fee').value;
    const move_in_fee = document.getElementById('cfg-movein-fee').value;
    const verification_validity_days = document.getElementById('cfg-validity-days').value;

    try {
      const res = await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ inspection_fee, move_in_fee, verification_validity_days })
      });
      showToast(res.message);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function purgeDemoData() {
    if (!confirm('Are you sure you want to purge all demo listings and sample reviews to prepare for production launch?')) return;
    try {
      const res = await api('/api/admin/demo-data/purge', { method: 'POST' });
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function reseedDemoData() {
    try {
      const res = await api('/api/admin/demo-data/reseed', { method: 'POST' });
      showToast(res.message);
      navigate();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==========================================
  // VIEW: 14. SUBMIT A REVIEW (7 DIMENSIONS)
  // ==========================================
  function renderSubmitReviewPage(container, hash) {
    const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    const pgId = searchParams.get('pgId') || '1';

    container.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-12 space-y-6">
        <div>
          <span class="demo-badge">Resident Experience Feedback</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Submit Resident Review</h1>
          <p class="text-xs text-slate-600">Rate your experience honestly across our 6 standard dimensions.</p>
        </div>

        <form onsubmit="TrustPG.submitReview(event, ${pgId})" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label class="block mb-1">Cleanliness (1-5)</label>
              <select id="rev-clean" class="w-full px-3 py-2 border rounded-xl">
                <option value="5">5 - Spotless</option>
                <option value="4" selected>4 - Clean</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Subpar</option>
                <option value="1">1 - Dirty</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">Food Quality (1-5)</label>
              <select id="rev-food" class="w-full px-3 py-2 border rounded-xl">
                <option value="5">5 - Delicious & Homely</option>
                <option value="4" selected>4 - Good</option>
                <option value="3">3 - Acceptable</option>
                <option value="2">2 - Needs improvement</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">Facilities / Wi-Fi (1-5)</label>
              <select id="rev-fac" class="w-full px-3 py-2 border rounded-xl">
                <option value="5" selected>5 - Excellent</option>
                <option value="4">4 - Works well</option>
                <option value="3">3 - Frequent interruptions</option>
                <option value="2">2 - Deficient</option>
                <option value="1">1 - Broken</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">Owner Responsiveness (1-5)</label>
              <select id="rev-resp" class="w-full px-3 py-2 border rounded-xl">
                <option value="5">5 - Very cooperative</option>
                <option value="4" selected>4 - Responsive</option>
                <option value="3">3 - Slow</option>
                <option value="2">2 - Unresponsive</option>
                <option value="1">1 - Hostile</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">Value for Money (1-5)</label>
              <select id="rev-val" class="w-full px-3 py-2 border rounded-xl">
                <option value="5">5 - Worth every rupee</option>
                <option value="4" selected>4 - Good value</option>
                <option value="3">3 - Fair</option>
                <option value="2">2 - Expensive for quality</option>
                <option value="1">1 - Total rip-off</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">Listing Accuracy (1-5)</label>
              <select id="rev-acc" class="w-full px-3 py-2 border rounded-xl">
                <option value="5" selected>5 - Exactly as listed</option>
                <option value="4">4 - Mostly accurate</option>
                <option value="3">3 - Minor differences</option>
                <option value="2">2 - Misleading</option>
                <option value="1">1 - Completely false</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Written Feedback *</label>
            <textarea id="rev-text" rows="3" required placeholder="Describe your daily experience: food taste, hot water timing, security warden, and deposit refund..." class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <a href="#/pg/${pgId}" class="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700">Cancel</a>
            <button type="submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async function submitReview(e, pgId) {
    e.preventDefault();
    const cleanliness = document.getElementById('rev-clean').value;
    const food_quality = document.getElementById('rev-food').value;
    const facilities = document.getElementById('rev-fac').value;
    const responsiveness = document.getElementById('rev-resp').value;
    const value_for_money = document.getElementById('rev-val').value;
    const accuracy = document.getElementById('rev-acc').value;
    const review_text = document.getElementById('rev-text').value;

    try {
      const res = await api('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          pg_id: pgId,
          cleanliness, food_quality, facilities, responsiveness,
          value_for_money, accuracy, review_text
        })
      });
      showToast(res.message);
      window.location.hash = `#/pg/${pgId}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==========================================
  // VIEW: 15. ABOUT US
  // ==========================================
  function renderAboutPage(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div class="space-y-3 text-center">
          <span class="demo-badge">Student-First Mission</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">About TrustPG</h1>
          <p class="text-sm text-slate-600 max-w-xl mx-auto">
            Find Your Stay. Know What You Pay. Built to solve student rental opacity in Bengaluru.
          </p>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            Every year, hundreds of thousands of college students arrive in Bengaluru to attend premier institutions like Christ University, St. John's Medical College, PES University, NIFT, and RV College of Engineering.
          </p>
          <p>
            Unfortunately, the search for safe and honest student housing is marred by fake photos, hidden electricity meters, undisclosed maintenance fees, and lost security deposits. TrustPG was founded to introduce transparency, verifiable facts, and accountability into student accommodation.
          </p>
          <h3 class="font-bold text-slate-900 text-base">Our Three Core Pillars</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong class="text-emerald-800 block mb-1">1. Total Cost Clarity</strong>
              We show the full estimated monthly total—including food and maintenance—before you visit.
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong class="text-emerald-800 block mb-1">2. Earned Verification</strong>
              Property verification requires passing our 12-point physical audit. Trust can never be purchased.
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong class="text-emerald-800 block mb-1">3. Resident Voice</strong>
              Genuine multi-dimensional ratings backed by confirmed student stays.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: 16. CONTACT US
  // ==========================================
  function renderContactPage(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-extrabold text-slate-900">Contact TrustPG Support</h1>
          <p class="text-xs text-slate-600">Have questions about listings or verification? Reach out to our Bengaluru team.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 class="font-bold text-sm text-slate-900">Bengaluru Office</h3>
            <p class="text-slate-600">TrustPG Technologies Pvt. Ltd.<br>4th Cross, 5th Block, Koramangala<br>Bengaluru, Karnataka 560095</p>
            <p class="text-slate-600">Support Hours: 9:00 AM - 7:00 PM IST (Mon - Sat)</p>
            <p class="text-slate-600">Email: <strong>support@trustpg.com</strong></p>
          </div>

          <form onsubmit="event.preventDefault(); TrustPG.showToast('Message sent! Our support team will reply within 24 hours.');" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input type="text" required class="w-full px-3 py-2 border rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input type="email" required class="w-full px-3 py-2 border rounded-xl text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Message</label>
              <textarea rows="3" required class="w-full px-3 py-2 border rounded-xl text-xs"></textarea>
            </div>
            <button type="submit" class="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: 17. FAQ
  // ==========================================
  function renderFaqPage(container) {
    const faqs = [
      { q: "Is TrustPG free for students?", a: "Yes. Searching, filtering, comparing costs, and contacting PG owners is 100% free for students." },
      { q: "What does the 'TrustPG Verified' badge mean?", a: "It signifies that an authorized inspector visited the physical property and verified our 12 standard parameters (address, Wi-Fi speed, room cleanliness, food arrangements, RO water, security, and fee transparency). Verification is valid for 180 days." },
      { q: "Can a PG owner pay for a Verified badge or better ranking?", a: "No. Paying the ₹999 inspection fee covers the cost of an independent physical audit. It never guarantees a positive badge. Furthermore, organic search results cannot be bought by sponsors." },
      { q: "How is the 'Estimated Monthly Total' calculated?", a: "We sum Base Rent + Food Charges + Electricity & Maintenance + Other mandatory monthly fees. If an owner fails to disclose mandatory costs, we label it as 'Incomplete / Not provided' so you know to ask before paying." },
      { q: "What happens if a confirmed move-in falls through?", a: "The ₹1,500 owner success platform fee is only charged upon verified move-in confirmation. Our cancellation and refund policy protects both parties." }
    ];

    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div class="text-center space-y-2">
          <span class="demo-badge">Student & Owner Help</span>
          <h1 class="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
          <p class="text-xs text-slate-600">Everything you need to know about TrustPG discovery and verification.</p>
        </div>

        <div class="space-y-3">
          ${faqs.map(f => `
            <details class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm group">
              <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
                <span>${f.q}</span>
                <span class="text-emerald-600 text-base group-open:rotate-180 transition-transform">&darr;</span>
              </summary>
              <p class="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">${f.a}</p>
            </details>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: 18 & 19. LEGAL PAGES (PRIVACY & TERMS)
  // ==========================================
  function renderPrivacyPage(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 leading-relaxed">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <strong>Setup Advisory:</strong> This is an editable draft policy. A qualified legal professional should review before full commercial deployment.
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p class="text-xs text-slate-500">Last updated: October 2026</p>

        <h3 class="font-bold text-slate-900 text-base">1. Information We Collect</h3>
        <p>TrustPG collects only essential information required to facilitate student discovery, owner enquiries, and inspection reports: name, contact number, email, and property preferences.</p>

        <h3 class="font-bold text-slate-900 text-base">2. How We Use Data</h3>
        <p>Data is used exclusively to facilitate communication between prospective student residents and accommodation owners. We do not sell your personal data to brokers or third-party marketing networks.</p>

        <h3 class="font-bold text-slate-900 text-base">3. Review Transparency</h3>
        <p>Reviews submitted by residents are displayed publicly with verified resident indicators. Audit logs are preserved to deter spam and fraudulent ratings.</p>
      </div>
    `;
  }

  function renderTermsPage(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 leading-relaxed">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <strong>Setup Advisory:</strong> This is an editable draft agreement. A qualified legal professional should review before full commercial deployment.
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
        <p class="text-xs text-slate-500">Last updated: October 2026</p>

        <h3 class="font-bold text-slate-900 text-base">1. Platform Nature & Scope</h3>
        <p>TrustPG operates an accommodation information and discovery service. While we strive to verify advertised parameters through our 12-point physical audit, property conditions, prices, and availability may change over time.</p>

        <h3 class="font-bold text-slate-900 text-base">2. Verification Disclaimer</h3>
        <p class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          “TrustPG provides accommodation information to help users compare options. Property details, prices, and availability may change. Verification applies only to the stated inspection scope and date. Users should independently confirm costs, terms, and property conditions before making payments.”
        </p>

        <h3 class="font-bold text-slate-900 text-base">3. Inspection Refund Policy</h3>
        <p>The ₹999 on-site inspection fee covers the scheduling, travel, and physical audit work performed by an authorized inspector. Once an inspector has been dispatched, the inspection fee is non-refundable regardless of whether the property passes or fails the audit.</p>

        <h3 class="font-bold text-slate-900 text-base">4. Confirmed Move-in Fees</h3>
        <p>Participating PG owners agree to pay a standard platform success fee of ₹1,500 per confirmed move-in sourced through TrustPG. Duplicate fees for the same resident are strictly prohibited by our database deduplication rules.</p>
      </div>
    `;
  }

  // Public Interface
  return {
    navigate,
    login,
    register,
    logout,
    quickLogin,
    openQuickLoginModal,
    closeModal,
    toggleMobileMenu,
    toggleCompare,
    clearCompare,
    toggleFavourite,
    openContactModal,
    submitEnquiry,
    openScheduleVisitModal,
    submitVisit,
    openReportModal,
    openReviewForm,
    submitReview,
    viewCertificate,
    showToast,
    handleHeroSearch,
    applyFilters,
    clearAllFilters,
    switchAuthTab,
    handleLogin,
    handleRegister,
    submitNewListing,
    requestVerification,
    payVerification,
    processDemoPayment,
    confirmMoveIn,
    openChecklistModal,
    submitInspectionChecklist,
    openAssignInspectorModal,
    assignInspector,
    adminDecision,
    moderateReport,
    updateAdminSettings,
    purgeDemoData,
    reseedDemoData
  };
})();

// Route Listener & DOM Ready
window.addEventListener('hashchange', TrustPG.navigate);
window.addEventListener('DOMContentLoaded', () => {
  TrustPG.navigate();
});
