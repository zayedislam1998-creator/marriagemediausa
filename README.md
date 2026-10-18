# Marriage Media USA (marriagemediausa.com)

A modern, high-performance, and 100% Halal Matrimonial Platform engineered specifically for the North American Muslim community (USA & Canada). Built with **Next.js 16**, **React 19**, **PostgreSQL**, and **Drizzle ORM**.

---

## 🌟 Key Features

- **Islamic Matrimonial Standards**: Modesty-first design with Wali guardian verification, Purdah privacy photo blur shields, and strictly authentic Islamic biodata attributes.
- **85+ Profile Attributes**: Comprehensive information covering deen, education, occupation, residency status, family background, and lifestyle.
- **Enterprise-Grade Stack**:
  - **Framework**: Next.js 16 (App Router, Server Actions, Standalone Output)
  - **Database & ORM**: PostgreSQL 16+ via Drizzle ORM
  - **Security & RBAC**: Multi-seat Role-Based Access Control (Super Admin, Editor, Moderator, Member) with secure HTTP-only cookies and JWTs (`jose`)
  - **Real-Time Communication**: Proposal workflow, contact unlock credit transactions, and live messaging
  - **Deployment Ready**: Optimized for self-hosted deployment via **Coolify**, **Docker**, and Linux VPS environments

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **PostgreSQL**: 16+ running locally or in Docker

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
Configure your `.env` variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/marriagemediausa"
AUTH_SECRET="your-secure-random-secret-key"
NEXT_PUBLIC_APP_URL="https://marriagemediausa.com"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
Push schemas and seed domain packages and initial admin:
```bash
# Push database schemas
npm run db:push

# Seed authentic packages and initial super admin
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

To generate a standalone production build:
```bash
npm run build
npm start
```

For **Coolify** or Docker deployments, the repository includes `output: 'standalone'` in `next.config.ts` for zero-overhead, sub-second container deployments.

---

## 🔒 Security & Privacy

- All contact requests require verified credits or guardian approvals.
- Private photos are protected behind permission workflows.
- KYC documents are isolated in secure storage.

---

© 2026 Marriage Media USA. All rights reserved.
