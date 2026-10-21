# Final Live Release Work Order — MarriageMediaUSA.com

**For:** the developer/agent implementing the remaining work  
**Date:** October 21, 2026  
**Primary code workspace:** `C:\Users\Public\Rahul-Project\MuslimBibah.com`  
**Live release package:** `C:\Users\Public\Rahul-Project\marriagemediausa.com`  
**Intended live domain:** `marriagemediausa.com`

This is the single release handoff. Follow it in order and keep the evidence in this document or the linked review. The owner has asked for the site to be made ready and released after the gates pass. Do not ask for another approval for routine implementation or the release described here. If the configured Coolify project/domain is different from `marriagemediausa.com`, stop before deploying and report that exact mismatch.

## Latest verification checkpoint — October 21, 2026

- Primary implementation commit: `232a239fe2d15a5b19542727eec222edbf98df4f` (`MuslimBibah.com`).
- Sister release commit: `4de29cc1d5db90970f2542a543a6d5ce9368d003` (`marriagemediausa.com`), pushed successfully to `origin/main`.
- Both current source trees passed `npm run build` and TypeScript: primary generated 46 routes; sister generated 45 routes.
- Targeted ESLint on changed files passed with zero errors and five existing warnings (unused `usStates` prop and `<img>` optimization warnings). Full-repository lint has not been certified.
- The new code binds checkout to the authenticated session, makes the primary and sister payment routes use session identity, removes fabricated homepage member counts, routes all public package reads through `/api/packages`, and makes schema/index DDL failures stop migration instead of being swallowed. Passwords are already stored as bcrypt hashes; user IDs are identifiers and should not be hashed.
- **Live deployment is not confirmed.** After push, `https://marriagemediausa.com` returned HTTP 200 but still served the old `15,420` homepage text with `X-Nextjs-Cache: HIT` and `Cache-Control: s-maxage=31536000`, including on a commit-specific query URL. The pushed commit is not yet evidenced on the live site. Coolify deployment status is not available from this workspace; deploy commit `4de29cc` in the linked Coolify app and verify the domain/cache before calling the release live.
- Production database connectivity/migration, restorable backup, Coolify app/branch linkage, persistent uploads, staging acceptance, payment sandbox, and operational email delivery remain unverified. Do not run production schema migrations until the backup and staging gates below pass.

## 1. Current state and deployment target


- The latest primary build compiled, passed TypeScript, and generated 46 routes (verified October 21, 2026).
- The latest sister build compiled, passed TypeScript, and generated 45 routes (verified October 21, 2026). This build alone does not prove production database connectivity.
- The reviewed changes are committed in both worktrees; the sister release commit is pushed to `origin/main`.
- The sister package README specifies Coolify with a Node/standalone Next.js deployment and `marriagemediausa.com`. The primary package also contains Firebase static-export scripts and a Firebase project config. **Do not deploy the dynamic MarriageMediaUSA app through `deploy:firebase`, static export, or Firebase Hosting rewrites.** The application needs its Next.js server/API routes and PostgreSQL connection.
- The current sister repository has Git remote `origin` at `https://github.com/zayedislam1998-creator/marriagemediausa.git`, tracking `main`. Verify Coolify is linked to this repository, branch, and domain before promoting/deploying a commit.

## 2. Required implementation work — primary workspace first

Complete and review code in `MuslimBibah.com` first, then carry the accepted changes to the sister package. The user-provided `AGENTS.md` instructions apply.

### 2.1 Close remaining product and data gaps

- [ ] **CMS coverage:** Current DB-backed public editing is present for homepage hero/banner/FAQ, contact support details, and stories. Implement the remaining promised public page sections (at minimum services, how-it-works, why-us, navigation/footer, and SEO), or document a clear reduced scope and remove unsupported editor controls. Ensure draft content is private; add/edit/publish/unpublish behavior must persist across restart. If revisions/rollback remain in the approved plan, implement and verify them; otherwise explicitly defer them.
- [x] **Package API policy (source implementation):** Every user-facing package view—homepage, `/membership-plan`, and `/dashboard`—must use `/api/packages` as the canonical read contract, per `AGENTS.md`. Remove view-specific hardcoded prices and separate direct package reads where they bypass that contract. Admin writes remain PostgreSQL-backed. A package update must become visible across a new browser/device within a documented SLA; checkout must re-check the active DB package and current price. Preserve historical member entitlements/snapshots.
- [ ] **Analytics policy:** Keep real database counts for `users`, `profiles`, `user_subscriptions`, and `payment_transactions`. Real completed payments alone contribute to revenue. Simulated/test transactions, pending payments, package list prices, and manual grants must not be shown as paid revenue.
- [ ] **No fabricated member data:** Keep the seed-profile fallbacks removed from homepage, search, dashboard, and profile detail. Empty DB results must show an honest empty state; only active, approved database profiles may be shown as real members.
- [ ] **CMS, inquiry, story, member and auth flows:** Confirm CMS edits, contact/service submissions, story moderation, XLSX/CSV import, manual member invites, signup/login/session refresh/logout, and server-side role checks are complete. Do not turn code presence into a completion claim without staging evidence.
- [x] **Payment fail-closed behavior (source implementation):** Keep checkout/capture unavailable when credentials are missing, mismatched, or placeholders. Simulation may not create paid entitlements or real revenue in production. If Stripe/PayPal sandbox checks cannot be completed, leave the corresponding live gateway disabled and record the limitation.
- [ ] **Email delivery:** If account, inquiry, or operational emails are intended to be active at launch, configure production SMTP credentials and verify delivery to a controlled mailbox. Otherwise keep email notifications explicitly disabled/fallback-safe and state that in the release note. Never report a simulated email as delivered.

### 2.2 Acceptance and evidence on a disposable/staging environment

- [ ] Verify homepage, search, membership packages, dashboard packages, checkout price, and package update freshness in a second browser/device.
- [ ] Verify empty DB profile behavior and ensure analytics counts reconcile with SQL counts for all four tables.
- [ ] Verify CMS edit → save → restart/persist → publish → public render; verify draft is not public and unauthorized users cannot edit.
- [ ] Verify signup duplicate handling, login → refresh → dashboard → logout, direct `/login` while signed in, expired/disabled sessions, and member attempts against admin routes/actions.
- [ ] Verify valid/invalid XLSX and CSV rows, duplicates, row-level errors, invite expiry/reuse/retry, user password setup, and correct profile/subscription rows. Use disposable test records only.
- [ ] Verify contact/service/story submissions persist, admin-only inquiry access works, notes/status persist, and stories remain unpublished until approved.
- [ ] With Stripe and PayPal sandbox credentials, verify success, cancellation, pending/failure, wrong user/order/amount/currency, webhook signature, replay/duplicate event, retries, refund/reversal, and reconciliation. If credentials are unavailable, record a blocked state and keep live checkout disabled.
- [ ] Verify logout uses `executeUniversalLogout()` everywhere and `/login` never forces an automatic redirect.
- [ ] Verify production build does not run schema DDL. Apply `npm run db:auto-migrate` only as a separate, explicit migration step after a restorable backup and a successful staging migration.
- [ ] Record tested commit, environment, commands, expected/actual result, and before/after counts. Redact credentials, tokens, personal data, and payment details.

## 3. Sync, inspect, and build both repositories

- [ ] Finish the accepted implementation in the primary workspace first.
- [ ] Sync only intentional changes to `marriagemediausa.com`; do not copy `.env` or blindly overwrite repository-specific config/assets. Compare all changed and untracked files, including `src/proxy.ts`, migration scripts, contact/story components, package pages, payment routes, and CMS files.
- [ ] Inspect `git diff`, untracked files, and deletions in both worktrees. Remove accidental artifacts and confirm no secrets, real test member data, or unapproved seed content are included.
- [ ] Verify the sister `.env`/Coolify database target without printing secret values. Resolve the current sister DB hostname/connectivity error and demonstrate a successful package read and migration against the correct staging database.
- [ ] Run `npm run build` in both worktrees on the final code. TypeScript/build must pass; investigate and resolve any DB query error emitted during route generation rather than relying only on the process exit code.
- [ ] Run the project's required lint/type checks and the acceptance flows above. Do not leave P0/P1 items with “implemented” status but no evidence.

## 4. Production configuration and safe database rollout

In the Coolify application for `marriagemediausa.com`, verify the following values are set in the platform's secret/environment settings. Never put actual values in Git or this handoff.

- Required: `DATABASE_URL`, `AUTH_SECRET` (strong random value, at least 32 characters), `NEXT_PUBLIC_APP_URL=https://marriagemediausa.com`, and `NODE_ENV=production`.
- Persistent storage: mount public uploads to the configured public upload path and private KYC files to a persistent path outside the public web root. Confirm both survive container replacement and private files cannot be fetched anonymously.
- If payment credentials are stored/encrypted in the database, set `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` consistently before saving/reading them. Enable Stripe/PayPal credentials only after sandbox verification. Confirm webhook URLs/signing secret match the production domain.
- If email is enabled, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and the required notification recipient through Coolify secrets. Verify SPF/DKIM/DMARC and a controlled delivery test.
- Firebase variables are optional only if the selected auth/storage flows still require them; verify the actual feature dependency before omitting them. Do not add unused credentials by default.
- Set initial-admin bootstrap variables only when they are intentionally needed for a one-time controlled bootstrap; do not leave a temporary bootstrap password active.

Before deployment:

1. Identify the exact production PostgreSQL database and take a backup that has been confirmed restorable.
2. Apply the reviewed schema migration as a separate step using the production environment, after a successful staging run. Confirm the command's exit status and expected tables/columns. Do not run `db:seed` against production unless an explicitly reviewed data migration requires it.
3. Confirm the rollback plan for both application and schema. Prefer backward-compatible migration ordering; do not deploy a new app that requires columns not yet present.

## 5. Commit and deploy to the live US site

Only after sections 2–4 pass:

1. Create one reviewed release commit in `MuslimBibah.com`, then sync the same accepted source changes to `marriagemediausa.com` and create the release commit there. Preserve any existing user changes; do not discard work to make the tree clean.
2. Confirm the sister commit is on the branch configured in Coolify (currently expected to be `main`) and that the connected application/domain is `marriagemediausa.com`.
3. Push that exact sister release commit to `origin`. If Coolify deploys automatically, monitor that deployment to completion. Otherwise deploy that exact commit from Coolify. Do not use Firebase static export for this release.
4. Verify Coolify build/runtime logs, health status, database connection, and persistent upload mounts. Confirm the app is serving the new commit over HTTPS at `https://marriagemediausa.com`.

## 6. Post-deploy smoke checks and rollback gate

Run read-only or controlled checks first:

- [ ] Homepage and public routes load without server errors: `/`, `/search`, `/membership-plan`, `/contact`, `/services`, `/stories`, `/login`, `/register`.
- [ ] `/api/packages` returns the real active PostgreSQL packages; public pages show the same prices/features. Do not create a production package just to test.
- [ ] Search returns only approved active records; zero eligible records produces an empty state, not seeded people.
- [ ] Admin analytics is available only to authorized admins, shows DB counts, and excludes simulated/pending/grant amounts from paid revenue.
- [ ] Login and logout work with a controlled authorized account; direct `/login` still shows the form.
- [ ] Inquiry forms persist and appear in the authorized admin inbox. If a smoke inquiry is necessary, use a controlled address and resolve/delete it immediately according to the data policy.
- [ ] Payment checkout stays disabled if gateway configuration is not verified. Do not make a real charge as a smoke test.
- [ ] No migration, database, auth, image/storage, or payment errors appear in production logs.

If a critical route, authentication, database, privacy, or package-price check fails, stop launch and roll back to the previous application commit. Restore the DB only under the documented recovery procedure; do not improvise destructive production SQL.

## 7. Final completion report

After deployment, report in one message:

- Primary and sister release commit hashes.
- Coolify application, configured branch, live domain, deployment time, and deployment result.
- Build and staging acceptance results, migration/backup result, and post-deploy smoke checks.
- Whether Stripe, PayPal, and email are enabled or intentionally disabled.
- Any known limitation and the rollback target.

**Release is complete only when the exact reviewed commit is live at the intended domain, database/runtime smoke checks pass, and this report is provided.**
