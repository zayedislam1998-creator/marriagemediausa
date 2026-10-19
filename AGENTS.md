<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MuslimBibah.com & Marriage Media USA Agent Directives

### 1. Workspace & Development Package Boundaries
- **Active Workspace**: `C:\Users\Public\Rahul-Project\MuslimBibah.com`
- **Sister Development Package**: `C:\Users\Public\Rahul-Project\marriagemediausa.com`
- Perform and verify all code changes locally in `MuslimBibah.com` first.
- **NEVER** launch persistent background Node.js or Python servers. The user starts and manages `npm run dev` manually.

### 2. Single Source of Truth for Packages
- Packages reside in PostgreSQL table `packages`.
- All user-facing views (Homepage `/`, `/membership-plan`, `/dashboard`) dynamically fetch from `/api/packages`.
- Modifying packages in `/admin -> Pricing & Packages` broadcasts `PACKAGE_UPDATED` via `BroadcastChannel` for live real-time synchronization.

### 3. Zero Mock Data Policy in Analytics
- The Admin `Revenue & Analytics` tab must always reflect actual database counts from `/api/admin/analytics` (`users`, `profiles`, `user_subscriptions`, `payment_transactions`).
- Never introduce hardcoded mock statistics or fabricated revenue numbers.

### 4. Authentication & Universal Session Synchronization
- All logout triggers must execute `executeUniversalLogout()` from `@/lib/auth/universalLogout.ts`.
- Visiting `/login` must always present the sign-in form without forced auto-redirection.
