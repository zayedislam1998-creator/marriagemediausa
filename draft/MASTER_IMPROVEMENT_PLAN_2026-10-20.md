# MuslimBibah.com — সাইট অডিট ও ডেভেলপার হ্যান্ডঅফ পরিকল্পনা

**তারিখ:** ২০ অক্টোবর ২০২৬  
**উদ্দেশ্য:** বর্তমান feature inventory, Shaadi.com benchmark, technical options, delivery plan ও acceptance criteria।  
**সীমা:** এই টার্নে শুধু planning document তৈরি হবে; site/code/database/deployment/credentials পরিবর্তন নয়।

> এই পরিকল্পনা developer-কে বাস্তবায়নের জন্য স্বাধীনতা দেয়। Production environment, বর্তমান branch এবং privacy/legal constraints আগে যাচাই করতে হবে।

## 1. প্রধান চাহিদা ও বর্তমান ঝুঁকি

প্রথম requirement: Admin-এ publish করা packages-ই homepage, membership plan, member dashboard ও checkout-এ দেখাবে। Edit-এর পর অন্য browser/device-এও নির্দিষ্ট freshness SLA-তে আপডেট চাই। পুরোনো member-এর purchased entitlement package edit করে নীরবে পাল্টানো যাবে না—purchase snapshot, version, audit এবং effective-date rule দরকার।

দ্বিতীয় requirement: public page-এর copy, ছবি, FAQ, navigation/footer, SEO, stories, services/contact content admin থেকে draft, preview, revision, review/publish ও rollback করা যাবে। Auth, roles, membership entitlements, payment state ও privacy policy visual editor-এর বাইরে server-side logic থাকবে।

Inspection-এ কিছু route/table/UI আছে, কিন্তু কিছু data seed/demo/local state। Search code seed JSON ব্যবহার করে। Contact/story form local success state-এ থামে, service form alert দেখায়, CMS-এর কিছু story/article/FAQ/campaign state process memory/local state-এ। এগুলো durable production workflow নয়।

## 2. বর্তমান feature inventory

| Feature area | Local code-এ দেখা | প্রধান verification |
|---|---|---|
| Homepage | Search hero, counters, steps, profile cards, diaspora, why-us/halal, quiz, stories, pricing, advice, FAQ, footer | static/seed বনাম DB/CMS, real count/story/price |
| Membership | Plan page, package admin, member dashboard | সব view ও checkout একই active DB catalogue |
| Auth | Register/login/logout/me routes/pages | duplicate identity, verification, session refresh, role, reset, redirect |
| Profile | Biodata view/edit, preferences/photo schema | persistence, draft, consent, field visibility |
| Search | Search UI/repository | inspected implementation seed JSON; DB index, filters, privacy DTO দরকার |
| Proposals/chat | Routes/tables আছে | state machine, pair uniqueness, authorization, entitlement, report/block |
| Contact/services/stories | Public forms/pages আছে | durable submit, admin inbox, email retry; inspection-এ প্রমাণিত নয় |
| Admin | Members, Form Studio, Pricing, Gateways, KYC, Media, Analytics, Settings | permission, persistence, audit, recovery |
| CMS/KYC | CMS stories/articles এবং KYC UI/schema | AdminStore/memory/seed data, reviewer/appeal/evidence privacy যাচাই |
| Stripe/PayPal | Routes/config/schema আছে | credentials missing state, test/live config, signature/capture/reconciliation |
| Analytics | Admin API/schema | actual DB count ও settled ledger; fabricated fallback নয় |

DB schema-তে users, packages, user_subscriptions, profiles/preferences/photos, proposals, contact/photo unlocks, bookmarks/profileViews, conversations/messages, kycVerifications, moderationReports, auditLogs, successStories, formBuilderConfigs, paymentGatewaysConfig, paymentTransactions, walletLedger, processedWebhookEvents table আছে। Table থাকা end-to-end behavior প্রমাণ করে না।

Manifest snapshot: Next.js 16.4.0, React 19.3.0, PostgreSQL/Drizzle, Stripe, React Hook Form, Zod; CMS/rich-text editor দেখা যায়নি। Lockfile/deployment version যাচাই করতে হবে।

আগের plan-এ stabilization work (auth/session, packages, membership invariant, gateway fail-closed, payment fulfillment, real-only analytics) ও TypeScript check-এর কথা আছে; CSV/XLSX import, invites, provider sandbox round-trip, browser acceptance তখনও বাকি ছিল। এই নথির সময় তা নতুন করে verified নয়। আগের DB snapshot ছিল ১৪ users, ১৩ profiles, ৫ active packages, ১৩ active subscriptions; Stripe/PayPal TEST inactive/keys absent; ৪ simulated completed payment history-তে ছিল, revenue-তে নয়। Snapshot stale হতে পারে—production change-এর আগে current DB snapshot/backup নিন।

## 3. Package এবং membership design

PostgreSQL packages একমাত্র source of truth হবে। এক server-only package service/typed DTO ব্যবহার করে homepage, membership plan, dashboard, admin preview ও checkout পড়বে। Hardcoded route-specific price/features বা seed fallback নয়; empty/error-এ honest unavailable state।

Lifecycle: DRAFT → ACTIVE → INACTIVE/ARCHIVED। Public API শুধু active/saleable; draft admin-only। Free plan mandatory কি না explicit rule; package ID বা প্রথম row অনুমান নয়।

Fields: stable unique code, name/description, ISO currency, integer minor-unit price, duration/renewal, status, order, sale window, public feature copy, validated entitlement keys/limits, version, audit actor/time. Marketing text ও machine entitlement আলাদা।

Admin mutation DB transaction commit-এর পরে cache invalidation করবে। All views same repository/tag. Multi-instance deployment shared cache/tag behavior verify করুন; client query cache refresh করুন। BroadcastChannel same-browser tab-এ hint দিতে পারে, cross-device data source নয়। Next 16 revalidateTag(tag, "max") stale-while-revalidate দিতে পারে; read-your-own-write দরকার হলে updateTag বিবেচনা; small catalogue uncached DB read-ও বিকল্প। Freshness SLA লিখুন। সূত্র: [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag), [Next.js 16](https://nextjs.org/blog/next-16)。

Purchase/admin grant-এ immutable snapshot (package code/version/price/currency/duration/entitlements) রাখুন। Renewal, expiry, cancellation, upgrade/downgrade, refund/chargeback, free grant ও manual extension-এর state transitions এবং DB invariants লিখুন। Access server-side persisted subscription থেকে; UI plan label থেকে নয়। Admin grant shared service দিয়ে actor/reason/date/audit সহ হবে।

## 4. CMS ও editable content

প্রথমে existing PostgreSQL/Drizzle-এ typed CMS মূল্যায়ন করুন—structured page/block model, admin editor, revisions এবং publish workflow; arbitrary JSX/HTML render নয়। Visual editing/collaboration দরকার হলে Payload বনাম Sanity proof of concept। Payload docs Next 16.2.6+ এবং Postgres support জানায়; installed 16.4.0 minimum-এর মধ্যে হলেও peer/runtime/migration compatibility check চাই। Payload self-hosted Next admin দেয় কিন্তু existing admin/auth overlap সম্ভব। Sanity hosted structured CMS/live visual editing দেয়, তবে SaaS/storage/token/cost/data boundary বাড়ায়। একই field-এর এক source of truth। Sources: [Payload install](https://payloadcms.com/docs/getting-started/installation), [Payload overview](https://payloadcms.com/docs/getting-started/what-is-payload), [Sanity for Next.js](https://www.sanity.io/docs/nextjs), [Sanity App Router editor](https://www.sanity.io/docs/nextjs/visual-editing-with-next-js-app-router)।

Editable pages: homepage; why-us/how-it-works; services; contact details/form copy; stories/articles/advice/FAQ/campaigns; footer/navigation; SEO/social metadata; Bengali/English locales; approved legal/privacy/terms content. Package price/currency/term/entitlements CMS-এ duplicate নয়। Form Studio labels/options edit করতে পারে, server validation schema controlled থাকবে। Member profile/payment/KYC CMS content নয়।

Proposed model: content_pages (route/locale/status/SEO), typed content_sections/order/schema version, immutable revisions/author/time, media assets/alt/size/access, safe global settings, operational form submissions. Workflow: draft → validation → signed short-lived private preview → reviewer → publish/schedule → cache invalidation → audit → rollback. Public reader published content-ই দেখবে; draft noindex/no-store; publish+revision atomic।

Allowlisted blocks: hero, structured rich text, image+alt, feature grid, steps, CTA, FAQ, story/testimonial, service card, contact info, banner, article reference. Rich text AST/JSON allowlist; validate links, sanitize output, reject executable HTML. Media type/size/alt/access rules.

Contact/service/story forms need server validation (existing Zod), DB record, rate limit, abuse control, consent timestamp/version, admin status/assignment/history, email retry. Email failure-এ record থাকবে। Member import আলাদা flow: CSV/XLSX preview → mapping → row validation/duplicate detection → confirm → result/idempotent retry. Password কখনো workbook-এ নয়; expiring single-use setup invite।

## 5. Shaadi.com public benchmark ও roadmap

Shaadi features tier/region/time অনুযায়ী বদলাতে পারে। Pattern নিন, brand/copy/pricing/UI/proprietary algorithm নকল নয়।

| Publicly documented pattern | Local status | প্রস্তাব |
|---|---|---|
| Basic/advanced search: age/language/location/education/profession/lifestyle | Search exists, seed JSON observed | DB indexed privacy-filtered search, saved filters |
| Preference-fit, broader/two-way matches | Engine unverified | reciprocal fit categories and explanation |
| Saved searches, shortlist, visitors/viewed/ignored | Some schema, UI flow unverified | persistent search, shortlist, history/privacy |
| Interest accept/decline | proposal schema/route | unique pair workflow, expiry, notification |
| Premium contact/chat/voice/video | related tables/routes; enforcement unverified | server entitlement/consent; calls after vendor review |
| Contact privacy, hide/activity controls | partial support | privacy center and field/photo/contact permissions |
| Verification, report/block | KYC/moderation schema/UI | badge scope, reviewer, appeal, SLA |
| Tiered package benefits | package admin exists | canonical DB package and enforced entitlements |
| Hide/delete/support/spotlight | lifecycle unverified | durable support, pause/export/delete; opt-in labeled promotion |

References: [Membership](https://www.shaadi.com/info/introduction/membership-plans), [Premium](https://support.shaadi.com/support/solutions/articles/48000953202-what-additional-benefits-do-i-get-as-a-premium-member-), [Advanced Search](https://support.shaadi.com/support/solutions/articles/48000953829-how-is-advanced-search-different-from-basic-search-), [Matches](https://www.shaadi.com/info/customer-relations/faq/match-making), [Two-way](https://www.shaadi.com/info/introduction/two-way), [Contact privacy](https://support.shaadi.com/support/solutions/articles/155000008335-why-am-i-not-able-to-view-the-contact-number-of-some-matches-), [Hide/delete](https://support.shaadi.com/support/solutions/articles/48000755467-i-want-to-hide-or-delete-my-profile), [Report](https://www.shaadi.com/info/customer-relations/faq/report), [SecureTalk](https://www.shaadi.com/info/customer-relations/faq/securetalk-faq), [Profile management](https://www.shaadi.com/info/customer-relations/faq/profile), [Profile Blaster](https://www.shaadi.com/info/customer-relations/faq/profile-blaster)।

Advanced backlog: configurable filters and diaspora search; two-way compatibility explanations; saved searches/alerts; profile visitors/shortlist; proposal lifecycle; block/report across every API; moderation and appeals; granular photo/contact visibility; profile pause/export/delete; verification badge scope; authorized messaging; safe attachments; optional voice/video only after vendor/privacy/cost review; member timeline/admin RBAC/MFA; accessible mobile/language experience; privacy-aware SEO/analytics.

## 6. 2026 libraries / stack

Before editing, follow workspace rule to read project-local node_modules/next/dist/docs/, exact lockfile/runtime, and official compatibility of additions. Repo snapshot Next 16.4.0/React 19.3.0; Next 16 proxy.ts guidance applies, check before copying middleware examples.

| Need | Recommendation | Add now? |
|---|---|---|
| DB/packages | Existing PostgreSQL + Drizzle server service | No |
| cache | Next 16 cache APIs; BroadcastChannel only tab hint | No |
| forms | Existing React Hook Form + Zod; server validation too | No |
| auth | Audit current session/guards; new library only for proven gap | Not by default |
| CMS | Typed Drizzle vs Payload/Sanity; choose one source | No |
| rich text | Tiptap candidate, structured schema/sanitize | Optional; not CMS |
| import | CSV first; XLSX parser after file threat/size review | Later |
| drag/drop | inspect existing package before adding another | Avoid duplicate |
| E2E | Playwright if CI has no browser harness | Release-gate candidate |
| monitoring | decide after hosting known; redact PII | Platform-specific |

Next.js has no built-in membership billing package. Framework routing/render/cache does not supply subscriptions or entitlements. Stripe SDK was in manifest; generic Next membership package will not solve DB truth, verified webhook or access rules. Keep provider adapters around app-owned order/subscription model. CMS/payment separate domains. [Tiptap guide](https://tiptap.dev/docs/editor/getting-started/install/nextjs)。

## 7. Security/domain requirements

Server-side authz for each member/admin API; DB constraints/transactions; least-privilege DB; versioned migrations and restore-tested backups; secrets in server secret storage only; normalized email/phone collision handling; rate limits; webhook signature/event ID/idempotency/reconciliation; no entitlement from redirect query; MFA/role/audit/session revoke; PII-minimized logs; private KYC/media storage and retention; content URL/HTML sanitization; consent, export/correction/deletion and appeal policy; monitor DB health/cache freshness/payment age/email retries. Email failure must not erase a form submission.

## 8. Phased delivery

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0 Re-baseline | branch/deployed commit/runtime/config/schema/current-state map, backup, seed exposure report | environment differences and blockers documented; secrets not printed |
| 1 Packages | canonical repository, lifecycle/admin editor, purchase snapshot, cache SLA | all surfaces + new checkout same package; inactive absent; cross-device freshness; historic snapshot stable |
| 2 CMS/forms | typed blocks, draft preview/revisions/publish/rollback, durable form inbox | survives restart; no draft leak; invalid content rejected; form records actionable |
| 3 Auth/admin | canonical session, normalized identities, manual create/import/invite | duplicate/concurrent signup safe; self-registration and invite login work; role spoof rejected |
| 4 Stripe/PayPal | verified sandbox order, webhook fulfillment, refund/reconciliation | only provider-confirmed amount grants once; replay/mismatch/cancel grants none |
| 5 Search/safety | DB search, proposal states, block/report/KYC/privacy controls | no production seed; blocked/hidden users excluded; private contacts protected |
| 6 Advanced/scale | two-way discovery, monitoring, accessible localized product | KPI/owner/privacy review/rollback/support plan per feature |

## 9. Acceptance matrix and decisions

| Flow | Verify |
|---|---|
| Packages | create/edit/deactivate, DB/cache failure, another tab/browser/device |
| Membership | grant/expiry/renew/upgrade/cancel/comp/refund and snapshot |
| Auth | new/duplicate/concurrent/verify/disabled/refresh/logout |
| Import | valid/duplicate/malformed/retry/invite expiry/email failure |
| CMS/forms | preview/publish/rollback/invalid block/media/locale/email failure |
| Payments | success/cancel/invalid signature/wrong amount/replay/timeout/refund |
| Privacy/analytics | block/report/contact visibility/export/delete; zero/DB down/refund/pending/simulation |

Evidence should include DB rows/versions, server API authorization, browser flow, audit and reconciliation. Inspected manifest did not confirm browser E2E runner; inspect CI, then choose Playwright/equivalent. No tests were run in this planning turn.

Owner decisions: auto-renew/free tier; membership start and mid-cycle policy; refund/chargeback rule; import fields/provenance; invite expiry and verification; publisher approval/legal pages; Bengali/English fallback/currency/phone regions; privacy defaults/guardian role; retention periods; hosting/cache/storage/email/monitoring/backup RPO/RTO; which competitor-inspired features users actually want.

Before coding, developer should deliver verified route/API/schema matrix, package lifecycle/snapshot/cache design, CMS choice/block/role/preview design, migration+rollback+backup plan, API/permission/error design, state diagrams, release gates and support/recovery runbook. Dependency changes need Next 16 compatibility evidence.

Workspace rules to re-check before implementation: primary code work in MuslimBibah.com; packages PostgreSQL truth; Home/membership/dashboard use /api/packages; package save emits PACKAGE_UPDATED; analytics from /api/admin/analytics actual DB; logout executes executeUniversalLogout(); login page remains sign-in without forced redirect.

## 10. Sources

### Shaadi.com
- [Membership plans](https://www.shaadi.com/info/introduction/membership-plans)
- [Premium benefits](https://support.shaadi.com/support/solutions/articles/48000953202-what-additional-benefits-do-i-get-as-a-premium-member-)
- [Advanced search](https://support.shaadi.com/support/solutions/articles/48000953829-how-is-advanced-search-different-from-basic-search-)
- [Match-making FAQ](https://www.shaadi.com/info/customer-relations/faq/match-making)
- [Two-way matches](https://www.shaadi.com/info/introduction/two-way)
- [Contact visibility](https://support.shaadi.com/support/solutions/articles/155000008335-why-am-i-not-able-to-view-the-contact-number-of-some-matches-)
- [Hide/delete](https://support.shaadi.com/support/solutions/articles/48000755467-i-want-to-hide-or-delete-my-profile)
- [Report/block](https://www.shaadi.com/info/customer-relations/faq/report)
- [SecureTalk](https://www.shaadi.com/info/customer-relations/faq/securetalk-faq)
- [Profile management](https://www.shaadi.com/info/customer-relations/faq/profile)
- [Profile Blaster](https://www.shaadi.com/info/customer-relations/faq/profile-blaster)

### Next.js/CMS
- [Next.js 16](https://nextjs.org/blog/next-16)
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [Authentication](https://nextjs.org/docs/app/guides/authentication)
- [Payload](https://payloadcms.com/docs/getting-started/installation)
- [Sanity Next.js](https://www.sanity.io/docs/nextjs)
- [Sanity visual editing](https://www.sanity.io/docs/nextjs/visual-editing-with-next-js-app-router)
- [Tiptap](https://tiptap.dev/docs/editor/getting-started/install/nextjs)
