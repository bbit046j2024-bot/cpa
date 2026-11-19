# Elisha Adera Campaign Management Portal (2026/2027)

**Candidate:** Elisha Adera  
**Position:** Super Delegate  
**Institution:** Technical University of Mombasa (TUM)  
**Department:** Management Science  
**Campaign Period:** 2026/2027  
**Alliance Identity:** CPA – Comrades Project Alliance  
**CPA Motto:** For Comrades by Comrades  
**Candidate Slogan:** Competent Leader  
**Campaign Philosophy:** *"A journey without vision is a step to no foundation."*

---

## 1. Overview

The **Elisha Adera Campaign Management Portal** is a production-grade, full-stack university departmental student election ecosystem built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

This system is engineered strictly for a **University Departmental Campaign** within the Department of Management Science at TUM. It explicitly avoids county, constituency, ward, or national political campaign structures.

---

## 2. Key Features

### A. Public Campaign Website
- **Hero Section:** High-impact hero featuring the candidate's authentic campaign poster, CPA logo, and official TUM crest.
- **Strict 4-Field Supporter Registration Form:**
  - Field 1: Full Name
  - Field 2: Kenyan Mobile Number (validated & normalized to E.164 e.g. `+254...`, supporting `07xx` and `01xx` Safaricom, Airtel, Telkom)
  - Field 3: Departmental Course (configurable dropdown with custom entry)
  - Field 4: Year of Study (Year 1 to Year 4)
  - **Consent Checkbox:** Separate, unchecked checkbox (*"I agree to receive campaign-related updates on my phone number."*)
  - **Data Privacy Assurance:** Strict adherence to data minimization. Zero collection of ID numbers, registration numbers, or home addresses.
- **Instant Registration Success Screen:** Displays a professional confirmation banner.
- **About the Candidate:** Dedicated profile highlighting background, values, and departmental advocacy pillars.
- **Official Updates:** Announcement board with pinned notices and event briefings.

### B. Private Administration Portal
- **Role-Based Access Control (RBAC):**
  - **Administrator:** Complete access to supporters, communications, activities, settings, user management, and exports.
  - **Campaign Coordinator:** Manages activities, view permitted supporters, and reviews reports.
  - **Data Entry Officer:** Dedicated to enrolling supporters and updating contact records.
- **Executive Dashboard:** Live metrics calculated directly from the database (Total Supporters, Active Supporters, SMS Consent Rate %, Supporters by Course & Year of Study).
- **Supporter Directory:**
  - Multi-criteria search by name and phone number.
  - Filter by Course, Year of Study, and Consent Status.
  - Supporter Profile Viewer, Edit modal, and Status toggling (Active / Inactive).
  - Bulk CSV / Excel Import with validation and duplicate prevention.
  - Instant CSV Export.
  - Initial seed of 25 foundation loyalists pre-loaded directly from the official Word document register.
- **Communications Centre:**
  - Audience segmentation by Course, Year, or All Consented.
  - Strict compliance safeguard: Non-consented students are excluded.
  - SMS Character counter with GSM-7 segment calculator.
  - Safe-mode sandbox toggle for bulk SMS gateway until electoral clearance is completed.
  - WhatsApp template drafter.
- **Campaign Activities Management:** Schedule town halls, lecture hall walk-ins, strategy meetings, and volunteer rallies.
- **Audit-Ready Reports:** Printable executive report with official letterhead, candidate certification signature block, and summary statistics.

---

## 3. Technology Stack & Design System

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS (Custom campaign palette)
- **Icons:** Lucide React
- **Brand Colors:**
  - Deep Green: `#075B32` (Primary Brand & Navbar)
  - Primary Green: `#087A43` (Action Buttons)
  - CPA Gold: `#EBAA18` (Highlights & Badges)
  - CPA Blue: `#1555B5` (Alliance Identity)
  - Off-White Background: `#F5F8F5`
  - Dark Typography: `#17241C`

---

## 4. Local Development

```bash
# Clone or navigate to the directory
cd elisha-adera-campaign-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials
- **Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username:** `admin`
- **Password:** `cpa2026`

---

## 5. Deployment Guide (Vercel & Firebase)

### Deploying to Vercel
1. Push this repository to GitHub or GitLab.
2. Log in to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import the repository.
4. Set Build Command: `next build` and Output Directory: `.next`.
5. Click **Deploy**.

---

## 6. Pre-Seeded Supporters Data

The portal automatically initializes with the 25 verified supporters extracted from `Elisha_Adera_CPA_Supporters_Register_2026-2027.docx`:
1. Young Jang (0706 510 069)
2. Lawrence Oketch (0119 154 380)
3. Kelly Victor (0714 423 133)
4. McWilliam Menge (0792 433 523)
5. Abdijabar Hussein (0115 884 644)
6. Brian Nyakundi (0701 302 281)
7. Khadija Abdulmalik (0112 697 688)
8. Daniel Amaheno (0118 942 519)
9. Hanaa Ahmed (0774 052 990)
10. Marcus Irumba (0752 244 494)
... and all 25 foundation loyalists.

---

## 7. License & Compliance
Built strictly for the 2026/2027 TUM Department of Management Science Super Delegate Election under the Comrades Project Alliance (CPA). Compliant with the Kenyan Data Protection Act 2019.


## 8. Class Representative Registration Pipeline

Class representative applications are stored in the separate `cpa_class_representatives` table and never added to the supporter register. Public submissions use `POST /api/class-representatives`; records begin with `pending` review status. Only a reviewer who checks the official class rep list should mark a record `verified`.

### Database setup

Run the additive migration once from this project directory after configuring `.env.local` with the existing TiDB credentials:

```bash
node scripts/migrate-class-representatives.js
```

The script creates only `cpa_class_representatives`; it does not modify or seed existing tables.

### Vercel environment settings

Set these server-side variables for the CPA Vercel project:

- `CLASS_REP_ALLOWED_ORIGINS`: exact origin of Aggrey's published site, set it to `https://cpatum.netlify.app` (no path or trailing slash).
- `CLASS_REP_REVIEW_TOKEN`: a separate, high-entropy secret used to open the class rep verification queue at `/admin/class-representatives`.

Redeploy CPA after adding the variables. Do not put the review token or TiDB credentials in Aggrey's static HTML. CORS will reject requests from origins that are not explicitly listed.

The form returns a pending-review confirmation. It does not itself prove class representative status or grant voting eligibility; the CPA review page must mark the applicant `verified` after checking the official list.
