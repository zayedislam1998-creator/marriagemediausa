# Marriage Media USA (marriagemediausa.com)

The Premier Halal Matrimonial Platform engineered specifically for the North American Muslim Diaspora (United States & Canada), the United Kingdom, Australia, and worldwide practicing communities. Built with **Next.js 16**, **React 19**, **PostgreSQL**, **Drizzle ORM**, and **Sharp WebP Media Engine**.

---

## 🌟 Architecture & Key Capabilities

### 1. Executive Authentication Suite (`/login` & `/register`)
- **Persistent Global Header & Navigation**: `<AppHeader />`, `<Footer />`, and `<BottomNav />` remain visible across all authentication states.
- **2-Column Responsive Layout**: Desktop presentation features matrimonial value pillars, real-time vital statistics, and Islamic trust badges on the left, paired with an executive card interface on the right.
- **100% Professional English Interface**: Clean placeholders, zero sample dummy text, and strict adherence to matrimonial dignity.
- **Dynamic Cascading Geolocation Engine**:
  - Global Country Dropdown with flags and telephone dial code prefixes (`+1`, `+880`, `+44`, `+61`, etc.).
  - Cascading administrative subdivisions:
    - **United States**: All 50 US States + DC with metropolitan cities.
    - **Bangladesh**: All 8 Divisions, 64 Districts, and Upazilas / Thanas.
    - **Canada**: All Provinces and key metropolitan regions.
    - **United Kingdom**: Greater London, West Midlands, West Yorkshire, Scotland, Wales, etc.
    - **Australia**: New South Wales, Victoria, Queensland, WA, SA, ACT.
    - **International**: Flexible state and city inputs for worldwide applicants.
- **Member Tier Provisioning**: New registrants enter the Member Dashboard on a default Free status without forced paid packages, retaining full discretion to upgrade post-registration.

### 2. Enterprise Media & File Manager Suite
- **Pluggable Architecture**: Reusable across all application touchpoints (`<FileManagerModal />` and `<MediaUploadPicker />`).
- **Sharp 3-Tier WebP Processing Pipeline**:
  1. **Full Profile Image**: WebP 800×1000px, EXIF-stripped, Q85.
  2. **Card Thumbnail**: WebP 300×375px, Q80.
  3. **Purdah Modesty Gaussian Blur**: WebP 300×375px with 24px blur radius, preserving facial modesty until mutual consent.
- **Dedicated Admin Media Desk**: Full visual catalog with file size statistics, search filtering, grid/list view toggles, image metadata inspection, and instant URL copying.
- **RESTful API**:
  - `GET /api/media` — Filter and list stored media.
  - `POST /api/media` — Multipart upload with automated Sharp optimization.
  - `DELETE /api/media/[id]` — Permanent deletion across all generated file variants.

### 3. Islamic Matrimonial Domain Integrity
- **Mandatory Wali Representation**: Father or legal guardian information collected and verified for female candidate biodatas.
- **85+ Profile Attributes**: Detailed coverage of Aqeeda/Mazhab, daily prayer habits, halal diet standards, education, profession, and family background.
- **Multi-Seat RBAC**: Role-Based Access Control protecting `/admin`, `/admin/cms`, `/admin/kyc`, and `/dashboard` via HTTP-only JWT cookies (`jose`).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.x, v22.x, or v24.x LTS
- **PostgreSQL**: 16+ running locally or in Docker / Coolify
- **Sharp Native Dependencies**: Handled automatically via npm

### 2. Environment Configuration
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>"

# Security & Authentication Session Secret
AUTH_SECRET="<SECURE_RANDOM_SECRET_KEY_MIN_32_CHARS>"

# Application Domain
NEXT_PUBLIC_APP_URL="https://marriagemediausa.com"

# Local Storage Directory (Defaults to public/uploads)
STORAGE_PUBLIC_DIR="./public/uploads"
STORAGE_PRIVATE_KYC_DIR="./uploads/private/kyc"
```

> [!IMPORTANT]
> Never commit actual passwords or private tokens to source control. Production secrets must be managed securely through Coolify or your container environment manager.

### 3. Dependency Installation
```bash
npm install
```

### 4. Database Setup & Seeding
```bash
# Push database schemas
npm run db:push

# Seed packages and initial administration records
npm run db:seed
```

### 5. Running the Application
```bash
# Development server (Turbopack)
npm run dev

# Production build and launch
npm run build
npm run start
```

---

## 🐳 Production Deployment (Coolify & Docker)

The application is pre-configured with `output: 'standalone'` in `next.config.ts` for minimal Docker container images.

### Coolify Nixpacks / Docker Compose
1. Link your GitHub repository (`main` branch) to Coolify.
2. Select **Nixpacks** or **Dockerfile** as the build pack.
3. Configure Environment Variables in the Coolify UI:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `NODE_ENV=production`
4. Set up an internal persistent storage volume for uploads:
   - Host path: `/data/coolify/applications/<APP_ID>/uploads`
   - Container path: `/app/public/uploads`
5. Connect your domain (`marriagemediausa.com`) in Coolify to automatically provision Let's Encrypt SSL via Traefik.

---

## 🔒 Security Standards

- **Strict HTTP-Only Cookies**: Session tokens cannot be accessed by client-side JavaScript.
- **Private KYC Storage**: Passports and verification documents are saved outside the public web root (`uploads/private/kyc/`) and streamed strictly to authenticated Trust & Safety moderators.
- **Purdah Modesty**: Raw unblurred photos are never exposed without explicit mutual profile unlock.

---

© 2026 Marriage Media USA. All rights reserved.
