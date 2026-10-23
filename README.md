# TrustPG — Find Your Stay. Know What You Pay.
## Production-Ready Student PG Discovery & Verification Platform for Bengaluru

TrustPG is a student-first accommodation discovery platform engineered to solve rental opacity, hidden surcharges, and unverified broker claims in Bengaluru, Karnataka, India.

---

## 1. Project Overview & Vision

- **Brand:** TrustPG
- **Tagline:** *Find Your Stay. Know What You Pay.*
- **Initial Market:** Bengaluru (Koramangala, BTM Layout, HSR Layout, Electronic City, Whitefield, Marathahalli, Indiranagar, Jayanagar)
- **Currency:** Indian Rupee (₹)
- **Primary Audience:** College students (18–24), outstation students, interns
- **Secondary Users:** PG owners, authorized on-site inspectors, platform administrators
- **Core Principle:** **Trust Should Never Be for Sale.** Paying an inspection fee covers an independent physical audit; it never guarantees a positive badge, ranking prioritization, or review censorship.

---

## 2. Technology Stack

- **Runtime:** Node.js v24.14.0 (Native ESM / CommonJS)
- **Database:** Relational SQLite via Node 24 native `node:sqlite` (`trustpg.db`), with ACID transactions, foreign keys, prepared statements, and disk persistence.
- **Backend:** Native Node.js HTTP/REST API server with custom router, crypto-based secure password hashing (scrypt/PBKDF2), session management, and role-based authorization.
- **Frontend:** Responsive Single-Page Application (SPA) architecture with client-side router, modern Tailwind CSS design system, Lucide icons, responsive navigation, modals, and interactive dashboards.
- **Testing:** Automated test suite (`test.js`) verifying database integrity, fee calculations, missing cost disclosures, filter logic, and state machine transitions.

---

## 3. Quick Start & Execution

### Running the Application

Double-click `start.bat` or run in PowerShell:

```powershell
cd c:\Users\hp\OneDrive\Desktop\AI\trustpg
& "C:\Users\hp\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```

Then open your browser at:
👉 **`http://127.0.0.1:3000`**

### Running Automated QA Tests

```powershell
cd c:\Users\hp\OneDrive\Desktop\AI\trustpg
& "C:\Users\hp\AppData\Roaming\Antigravity\bin\agy-node.cmd" test.js
```

---

## 4. Ready-to-Use 1-Click Demo Credentials

A quick login modal is accessible on every page via the top announcement bar or the login screen:

| Role | Email | Password | Description & Features |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `student@trustpg.com` | `Password@123` | Search, compare, save favourites, send enquiries, schedule visits, write 6-dimension reviews. |
| **🏠 PG Owner** | `owner@trustpg.com` | `Password@123` | Publish listings with transparent costs, manage availability, request paid inspection, confirm move-ins. |
| **📋 Inspector** | `inspector@trustpg.com` | `Password@123` | Access assigned properties, fill out the 12-point checklist (Pass/Fail/NA/Unable), submit findings. |
| **🛡️ Admin** | `admin@trustpg.com` | `Password@123` | View metrics, assign inspectors, approve/reject verified badges, moderate reviews, configure fees. |

---

## 5. The 19 Required Functional Pages

1. **Home (`#/`)**: Hero with search panel (locality, budget, room sharing, food, gender), 8 locality cards, featured PGs, the TrustPG Difference ("A Lower Rent Is Not Always a Lower Cost"), the Cost & Trust Card, the 6 core trust rules, and CTA banner.
2. **Find a PG (`#/find`)**: Reactive search with locality, budget slider, gender, sharing, food, 10+ amenities checkboxes, verified-only toggle, sorting, active filter chips, and clear-all.
3. **PG Details (`#/pg/:id`)**: Photo gallery, description, structured Cost Breakdown Table with "Not provided" handling for missing charges, verification certificate panel, resident reviews with 6 dimensions, and action modals (Enquiry, Schedule Visit, Report Info).
4. **Compare PGs (`#/compare`)**: Side-by-side comparison of up to 4 PGs evaluating rent, estimated total outflow, deposit, sharing options, food, and verified audit badges.
5. **How It Works (`#/how-it-works`)**: 4-step student discovery and true cost explanation guide.
6. **How Verification Works (`#/verification`)**: Detailed breakdown of the 12-point inspection checklist, the ₹999 proposed fee, and audit governance rules.
7. **List Your PG (`#/list-pg`)**: Owner listing wizard with transparent pricing inputs and mandatory Accuracy Declaration.
8. **Student Sign Up / Login (`#/login?role=student`)**: Authentication with instant 1-click test preset.
9. **PG Owner Sign Up / Login (`#/login?role=owner`)**: Owner authentication with instant 1-click test preset.
10. **Student Dashboard (`#/dashboard/student`)**: Favourites, active enquiries, scheduled visits, and review submissions.
11. **PG Owner Dashboard (`#/dashboard/owner`)**: Listings management, availability toggle, received enquiries, request inspection (with demo payment simulation), and confirmed move-ins & ₹1,500 platform fee tracker.
12. **Inspector Dashboard (`#/dashboard/inspector`)**: Assigned audit requests, 12-point checklist interface with Pass/Fail/NA/Unable options, notes, and admin submission.
13. **Admin Dashboard (`#/dashboard/admin`)**: Metrics overview, inspector dispatch, checklist review & final badge award/rejection, review moderation, fee configuration (₹999 inspection, ₹1,500 move-in, 180-day validity), demo data purge/reseed, and audit trail.
14. **Submit a Review (`#/submit-review?pgId=:id`)**: 6 rating dimensions (Cleanliness, Food quality, Facilities, Owner responsiveness, Value for money, Accuracy of listing) + written feedback.
15. **About Us (`#/about`)**: Founding story, Bengaluru focus, student pain points, and core pillars.
16. **Contact Us (`#/contact`)**: Office address in Koramangala 5th Block, support hours, and inquiry form.
17. **FAQ (`#/faq`)**: Comprehensive accordion answering student and owner questions.
18. **Privacy Policy (`#/privacy`)**: Draft data privacy terms with legal review advisory notice.
19. **Terms and Conditions (`#/terms`)**: Terms of service, verification scope disclaimer, and inspection refund policy.

---

## 6. Business Model & Integrity Safeguards

### A. Confirmed Move-In Success Fee (₹1,500)
- Searching, comparing, and enquiring is 100% free for students.
- Participating PG owners pay a standard platform success fee of ₹1,500 only upon confirmed student move-in.
- **Strict Deduplication:** Database enforces unique constraints on `enquiry_id` to guarantee the fee can never be levied twice for the same student move-in.

### B. Optional Paid On-Site Inspection (₹999)
- Owners can request a physical audit by an authorized inspector for ₹999.
- Payment is handled via demo mode simulation (or configurable Razorpay gateway).
- **Audit Separation:** Paying the fee does not guarantee a badge. If checks fail, reinspection is required. Only Platform Administrators can approve the badge. Badges expire automatically after 180 days.

---

## 7. Legal Disclaimer

> **Important Advisory:** TrustPG provides accommodation information to help users compare options. Property details, prices, and availability may change. Verification applies only to the stated inspection scope and date. Users should independently confirm costs, terms, and property conditions before making payments.
