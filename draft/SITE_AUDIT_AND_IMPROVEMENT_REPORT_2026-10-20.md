# Marriage Media USA / MuslimBibah — সাইট অডিট ও উন্নয়ন রিপোর্ট

**তারিখ:** ২০ অক্টোবর ২০২৬  
**অডিটের ধরন:** প্রথমে read-only baseline code/database review; পরে এই report-এর শেষে সীমিত database repair এবং primary workspace-এ code remediation।  
**পর্যালোচিত workspace:** `MuslimBibah.com` (নির্দেশিত সক্রিয় workspace)। `marriagemediausa.com` sister package অক্ষত রাখা হয়েছে।  
**সীমাবদ্ধতা:** configured PostgreSQL database-এর aggregate status যাচাই করা হয়েছে; user PII/password বা payment secrets পড়া/প্রকাশ করা হয়নি। Stripe/PayPal dashboard, deployed environment variables, production logs ও browser-এ real payment/login journey যাচাই করা হয়নি। তাই production runtime-এ সব flow end-to-end pass করেছে বলা হচ্ছে না।

> নিচের বিস্তারিত finding table-গুলো baseline review-এর সময়কার code behavior বর্ণনা করে। পরবর্তী remediation-এ যেগুলো বদলেছে, তার বর্তমান অবস্থা ও database repair নিচে “Remediation status” অংশে আছে।

## নির্বাহী সারাংশ

অ্যাকাউন্ট/প্রোফাইল/সাবস্ক্রিপশন, প্যাকেজ, পেমেন্ট এবং match/profile display একই নির্ভরযোগ্য data path ব্যবহার করছে না। কিছু পথ PostgreSQL ব্যবহার করে, কিছু path seed JSON বা browser storage/Firestore-নির্ভর, আর payment integration-এ test simulation থেকে বাস্তব membership credit দেওয়ার রাস্তা আছে। ফলে একই সাইটে “user তৈরি হয়েছে”, “লগইন সফল”, “dashboard-এ ঢুকেছে”, “paid package সক্রিয়”—এসবের অর্থ সব path-এ এক নয়।

### প্রথমে সমাধান দরকার এমন বিষয়

| অগ্রাধিকার | কোডে পাওয়া সমস্যা | বাস্তব প্রভাব |
|---|---|---|
| **P0 — জরুরি** | Public signup-এ জানা passcode দিয়ে `SUPER_ADMIN` role নেওয়ার branch আছে; login-এও hardcoded master-password fallback আছে। | অননুমোদিত admin access, user/profile/payment data ঝুঁকিতে পড়তে পারে। |
| **P0 — জরুরি** | PayPal capture route request body-র `userId`, `packageId`, amount/credits-জাতীয় তথ্য গ্রহণ করে; simulation path order-কে `COMPLETED` দেখিয়ে package/credit মঞ্জুর করে। | authenticated owner ও সত্যিকারের paid order যাচাই না হলে ভুল account-এ বা বিনা payment-এ সুবিধা যোগ হওয়ার ঝুঁকি। |
| **P1 — উচ্চ** | Dashboard, admin এবং membership page-এ PostgreSQL প্যাকেজের বদলে seed JSON থেকে package পড়ার path আছে; `/api/packages`-এ DB-তে package না পেলে seed fallback দেয়। | Admin-এ পরিবর্তিত দাম/feature এবং user-কে দেখানো/কেনার package আলাদা হতে পারে। |
| **P1 — উচ্চ** | Admin-এ একবারে একজন সদস্য provision করার form আছে; spreadsheet/CSV import UI/API পাওয়া যায়নি। Provisioning-এ demo password prefill, profile defaults, `isVerified: true`, non-transactional multi-table writes, unknown tier-এ first package fallback আছে। | ১০ user-কে bulk import করা যায় না; partial account/profile/subscription rows, demo credential reuse, fabricated profile fields, wrong plan assignment হতে পারে। |
| **P1 — উচ্চ** | Registration-এর একাধিক path আছে। API path-এ atomic transaction যোগ করা হয়েছে, কিন্তু `signUpAction`-এ account, profile ও free subscription আলাদা write; profile-এর DOB/age ও অনেক biodata hardcoded। | কোনো insert ব্যর্থ হলে অসম্পূর্ণ account; ফর্মের দেওয়া তথ্যের বাইরে ভুল/কাল্পনিক profile information। |
| **P1 — উচ্চ** | Auth-এর client guard/dashboard এবং server route guard-এর আচরণ এককভাবে যাচাইকৃত নয়। চলতি working copy-তে dashboard এখন `/api/auth/me`-এর PostgreSQL session পড়ছে—এটি redirect-loop-এর সম্ভাব্য root cause-কে আংশিকভাবে address করে। | deployed/cached state বা alternate auth path-এ login-এর পর আবার login-এ পাঠানোর সমস্যা থাকতে পারে; end-to-end প্রমাণ ছাড়া fixed বলা যাবে না। |
| **P1 — উচ্চ** | Database URL না থাকলে `db/index.ts` নীরবে local `postgres://...localhost...`-এ যায়; package read failure/empty result seed package দিয়ে ঢেকে যায়। | ভুল DB-তে connect হওয়া বা production configuration failure-কে স্বাভাবিক demo data বলে মনে হওয়া। |
| **P2 — মাঝারি** | Analytics-এ member count শূন্য হলে profile count-কে member count বলা হয়; payment rows না থাকলে active subscription-এর `pricePaidUsd` থেকে revenue গণনা হয়। | label-এর মানে ও প্রকৃত completed payments-এর হিসাবের অমিল; admin সিদ্ধান্তে ভুল সংখ্যা। |

## বিস্তারিত অডিট ফাইন্ডিং

### 1. Registration ও duplicate user

- `users.email` এবং `users.phone_number` schema-তে unique; API registration আগে exact email/phone match খোঁজে। একই normalized email বা একই exact phone দিয়ে বারবার registration সাধারণত 409/DB uniqueness-এ থামার কথা। তাই “একই তথ্য দিয়ে একই account বারবার হচ্ছে”—এটি কোড থেকে নিশ্চিত হয়নি।
- Email lowercase/trim করা হলেও ফোন শুধু trim হয়; `+1 555...`, `1555...`, `(555)...` একই ব্যক্তির জন্য আলাদা string হতে পারে। DB unique constraint এই formatting variant-কে একই নম্বর হিসেবে চেনে না। Race condition-এ app-level pre-check-ও যথেষ্ট নয়; DB unique conflict-কে 409 হিসেবে ধরতে হবে।
- API route-এ user + profile + free subscription transaction-এর মধ্যে লেখা হয় এবং `/api/auth/register` response-এ session cookie বসানোর বর্তমান পরিবর্তন দেখা গেছে (`src/app/api/auth/register/route.ts`, `src/lib/auth/session.ts`)। তবে `src/lib/auth/actions.ts`-এর `signUpAction` এখনও আলাদা write এবং free package না পেলে subscription ছাড়াই redirect করার সম্ভাবনা রাখে। কোন UI কোন path ব্যবহার করছে তা একক source-এ আনা দরকার।
- Signup route default DOB `1998-01-01`, age `28`, height, education, religion/practice এবং bio বসায়। প্রকৃত ব্যক্তির কাছ থেকে না নেওয়া তথ্যকে real profile হিসেবে দেখানো উচিত নয়; প্রয়োজনীয় fields সংগ্রহ করুন, বাকিগুলো “not provided” রাখুন।
- Email/phone verification timestamp-সহ schema fields আছে, কিন্তু review করা signup path-এ verification challenge/confirmation flow নেই। `isApproved: true`-ও registration-এ default হচ্ছে; profile moderation-এর আগে public visibility হলে তা ঝুঁকিপূর্ণ।

**প্রমাণ:** `src/app/api/auth/register/route.ts:16-26, 41-59, 64-135`; `src/lib/auth/actions.ts:217-310`; `src/db/schema.ts:62-75, 112-130`.

### 2. Login, session ও dashboard-এ ফেরত পাঠানো

- বর্তমান `useRequireAuth` client hook `/api/auth/me`-কে session-এর authoritative source ধরে, আর API login/register response-এ cookie বসানোর code আছে। `/login` ও `/register`-এ জোর করে redirect না করার proxy branch-ও আছে। এগুলো চলতি working copy-তে সংশোধনের ইঙ্গিত; তবু test না হওয়ায় loop সম্পূর্ণ বন্ধ বলা যাচ্ছে না।
- App-এ একই সঙ্গে Firebase/Firestore auth utilities, PostgreSQL JWT session, client-side local storage helpers ও legacy server actions আছে। dashboard hook এখন PostgreSQL session ব্যবহার করলেও `/admin`, chat, biodata-সহ অন্য page-এ বিভিন্ন auth hook/Firestore path ব্যবহারের code আছে। Login flow, page guard, logout, role lookup—সবগুলো একই identity authority ব্যবহার করছে কি না inventory করে একীভূত করতে হবে।
- Role বোঝার client-side heuristic-এ email-এ `admin` substring থাকলে admin হিসেবে বিবেচনা করা হয় (`useRequireAuth.ts`); server-side admin permission অবশ্য session role-ভিত্তিক হতে হবে। Client-এর badge/route visibility-কে authorization হিসেবে ব্যবহার করা যাবে না।
- `/api/auth/login`-এর login data DB থেকে পড়ে এবং cookie response-এ লেখে—এটি ভালো দিক। কিন্তু hardcoded fallback password ভুল password দিয়েও নির্দিষ্ট/অন্যান্য account-এ ঢোকার অনুমতি দিতে পারে (নিচের P0 finding)।

**প্রমাণ:** `src/lib/firebase/useRequireAuth.ts:33-89, 101-120`; `src/app/api/auth/login/route.ts:23-68, 103-130`; `src/app/api/auth/me/route.ts:4-28`; `src/proxy.ts:60-93`; `src/app/dashboard/page.tsx:10-12`.

### 3. Admin security — P0

- Public registration body-তে `adminPasscode` নেওয়া হয় এবং source-এ `MB-ADMIN-2026` মিললে role `SUPER_ADMIN` করা হয়। Server action-এও একই public signup elevation branch আছে। এটি শুধু UI-তে লুকালেও API সরাসরি ডাকা যায়।
- Login code-এ `Salam2026!` fallback যেকোনো account-এর জন্য password হিসেবে গ্রহণ হতে পারে; অন্য নির্দিষ্ট demo admin password-ও hardcoded। Admin modal-এ একই `Salam2026!` prefilled। Source-controlled credential-কে live credential হিসেবে ধরে compromise হয়েছে ধরে নিতে হবে এবং credential rotation দরকার।
- `Super Admin` permission checks থাকলেও public role elevation-ийг এগুলো প্রতিরোধ করে না; elevation-এর পর attacker-এর valid admin session তৈরি হবে।

**প্রমাণ:** `src/app/api/auth/register/route.ts:26, 55-59`; `src/lib/auth/actions.ts:82-88, 183-220`; `src/app/api/auth/login/route.ts:53-60`; `src/components/admin/ProvisionMemberModal.tsx:18-27`.

### 4. Manual account creation ও spreadsheet import

- Admin panel-এ single-member “Provision Member” form এবং server action আছে। তাই একজন user manually তৈরি করা সম্ভব; Excel/CSV bulk import feature নেই বলে code inventory-তে পাওয়া যায়নি।
- Provisioning helper `users`, `profiles`, `user_subscriptions`-এ পরপর write করে transaction ব্যবহার করে না; মাঝখানে failure হলে আগের row থেকে যেতে পারে। Duplicate conflict-এর জন্য dedicated field-level preflight/row feedback নেই।
- Admin provisioning নতুন user-কে verified করে, `guardianVerified`/profile approval-ও সত্য করে, অথচ contact verification/KYC evidence না থাকলেও। Defaults হিসেবে demo/placeholder profile details ঢোকে। Selected tier না মিললে first package-এ fallback হয়।
- CSV/XLSX import দরকার: template download, field mapping, preview, per-row validation, duplicate detection, error CSV, explicit “create account + profile together” transaction, invite/password setup link, consent/created-by audit trail, retry-safe import job। Plain password spreadsheet-এ রাখার বদলে random one-time invite flow অগ্রাধিকার পাবে।

**প্রমাণ:** `src/components/admin/ProvisionMemberModal.tsx:18-71`; `src/lib/admin/memberProvisionAction.ts:10-68`; `src/db/queries.ts:524-617`.

### 5. Package source-of-truth ও pricing mismatch

- `/api/packages` DB result থাকলে সেটি দেয়, কিন্তু package table empty হলে `DomainRepository.getPackages()` seed JSON fallback দেয় (`source: 'fallback'`)। Database unavailable হলে query helper empty list ফেরত দিতে পারে, ফলে DB failure-ও fallback হিসেবে উপস্থাপিত হতে পারে।
- `/membership-plan/page.tsx`, `/dashboard/page.tsx`, `/admin/page.tsx`-এ `DomainRepository.getPackages()` সরাসরি ব্যবহার দেখা গেছে। অর্থাৎ এসব view `/api/packages`/PostgreSQL থেকে package না-ও পড়তে পারে। Membership comparison table-তেও static `$29/$59/$99/$149` ইত্যাদি লেখা, যেগুলো package table-এর প্রকৃত মূল্য থেকে স্বাধীন।
- Registration path `packages.id = 1`-কে free package ধরে; auto-migration seed-ও ID-based assumption রাখে। Package ID বদলালে বা seed order වෙනස් হলে registration fail/incorrect package হতে পারে।
- `PricingPackagesTab` package update `PACKAGE_UPDATED` event broadcast করে; event broadcast UI refresh signal, DB source-of-truth mismatch-কে নিজে ঠিক করে না।

**প্রমাণ:** `src/app/api/packages/route.ts:6-27`; `src/app/membership-plan/page.tsx:9-20, 86-111`; `src/app/dashboard/page.tsx:101-104`; `src/app/admin/page.tsx:120`; `src/lib/admin/packageActions.ts`; `src/components/admin/PricingPackagesTab.tsx:100-110, 180-297`; `src/app/api/auth/register/route.ts:120-133`.

### 6. PayPal / Stripe payment ও “official” checkout — P0

- PayPal create-order route live API ব্যবহার করার পাশাপাশি placeholder credential থাকলে `SIM_PAYPAL_*` order তৈরি করে। Capture route-ও mock order বা placeholder config-এ simulated transaction insert করে `COMPLETED` mark, subscription activate এবং wallet credit করে। Stripe create-checkout-session-এও placeholder/test path তাৎক্ষণিক `COMPLETED` transaction ও membership fulfillment লেখে। Test simulation যদি production config-এ পৌঁছে, এটি real payment receipt নয়।
- PayPal capture route-এ `getCurrentSession()`/signed webhook verification দেখা যায়নি। `userId`, `packageId`, `type`, `credits`, `customAmount` request body থেকে নেওয়া হয়; UUID না হলে DB-এর প্রথম user-এ fallback হয়। Live capture order `COMPLETED` কি না দেখে, কিন্তু locally stored pending order-এর owner, expected amount, currency, package/credits-এর সাথে provider capture মিলিয়ে দেখে না।
- PayPal capture আবার submit হলে transaction row conflict update-এ `COMPLETED` হয়; এরপরও subscription/wallet fulfillment চলে। Payment transaction unique order ID idempotency দেয়, কিন্তু fulfillment side effect idempotent নয়।
- Stripe payment fulfilment webhook route আছে (`src/app/api/webhooks/stripe/route.ts`), যা ভালো ভিত্তি। তবু checkout creation endpoint-এর mock path real account-এ package grant করে; তাই test/live mode boundary ও webhook-based fulfillment একমুখীভাবে প্রয়োগ করতে হবে।
- “Official” PayPal flow-এর জন্য checkout-এ brand name যথেষ্ট নয়: server-side order amount/package binding, authenticated user binding, provider confirmation, signed webhook/capture validation, idempotent fulfillment, refund/dispute reconciliation এবং test/live banner দরকার। Secret credentials server-side encrypted/secrets manager-এ রাখতে হবে; কখনো browser-এ expose নয়।

**প্রমাণ:** `src/app/api/payments/paypal/create-order/route.ts:26-45, 90-103, 126-168`; `src/app/api/payments/paypal/capture-order/route.ts:7-25, 40-99, 101-190`; `src/app/api/payments/stripe/create-checkout-session/route.ts:27-47, 104-164, 167-216`; `src/app/api/webhooks/stripe/route.ts`.

### 7. Database correctness, migration ও analytics

- `DATABASE_URL` না থাকলে `src/db/index.ts` local database URL ধরে (`localhost:5432/muslimbibah`)—দূরবর্তী deployment-এ configuration ভুল হলেও তা স্পষ্ট fail-fast message নাও দিতে পারে। Production-এ required env অনুপস্থিত হলে startup/health check fail হওয়া উচিত।
- Runtime auto-migration অনেক DDL failure `catch(console.error)` বা warning দিয়ে এগিয়ে যায় (`src/db/auto-migrate.ts`)। ফলে route চললেও schema পুরোপুরি আপ-টু-date কি না বোঝা কঠিন। Versioned migrations, deployment gate, migration status endpoint/alert দরকার।
- Subscription lookup-এ একাধিক path `.limit(1)` দিয়ে status/order ছাড়া row বেছে নেয়; user-প্রতি active subscription-এর database invariant/replacement strategy স্পষ্ট করতে হবে। Provisioning ও payment update-এ subscription/wallet/transaction atomic consistency নিশ্চিত করা দরকার।
- Analytics member count শূন্য হলে profile count fallback; revenue payment transactions-এ `COMPLETED` না থাকলে active subscriptions-এর `pricePaidUsd` যোগ করে। Admin-provisioned subscription price list price হতে পারে, actual captured payment নাও হতে পারে। Revenue-র একমাত্র ভিত্তি completed/settled transaction ledger; subscriptions-কে আলাদা “active plan value” নামে দেখাতে হবে।

**প্রমাণ:** `src/db/index.ts:5-15`; `src/db/auto-migrate.ts:9-16, 19-59` এবং DDL catch sites; `src/app/api/admin/analytics/route.ts`.

## বাস্তব ডেটাবেস snapshot এবং gateway অবস্থার স্পষ্টীকরণ

Production-connected PostgreSQL থেকে read-only transaction-এ aggregate/config state দেখা হয়েছে; কোনো credential, ব্যক্তিগত user row বা payment secret রিপোর্টে লেখা হয়নি। ২০ অক্টোবর ২০২৬-এর snapshot:

| টেবিল/পরিমাপ | সংখ্যা বা অবস্থা |
|---|---:|
| users | 14 |
| profiles | 13 (13টি linked; admin profile না থাকা প্রত্যাশিত) |
| packages | 5টি active |
| user_subscriptions | 1টি row; 13 MEMBER account-এর মধ্যে 12টির recorded subscription নেই |
| duplicate active subscription | 0 |
| normalized duplicate email | 0 |
| payment_transactions | 4টি, সবগুলো `simulated=true` |
| gateway config | Stripe ও PayPal TEST config আছে, দুটির শেষ test status FAILED |

বর্তমান package table-এ Free Explorer হলো ID 5 এবং Silver Monthly ID 1। ফলে ID 1-কে free ধরে registration করার code বাস্তব DB-র সাথে মেলে না। বিদ্যমান একটি subscription Silver Monthly-তে ACTIVE, তবে `pricePaidUsd=0.00` ও payment reference নেই—এটিকে paid transaction বলা যাবে না। DB-তে কোনো successful live gateway credential/test evidence পাওয়া যায়নি; ব্যবহারকারীর বক্তব্য অনুযায়ী Stripe/PayPal-এর live keys এখনও যোগ করা হয়নি। তাই code-এ gateway integration/placeholder/simulation implementation আছে, কিন্তু সেটি configured ও live payment processing-এর প্রমাণ নয়।

**DB data mutation করা হয়নি।** Missing 12 subscription-এর জন্য নিরাপদ repair policy হলো: শুধুমাত্র active MEMBER যাদের কোনো unexpired ACTIVE subscription নেই, তাদের বর্তমানে active $0 package-এ grant করা; পুরনো row/paid record বদলানো নয়। কার্যকর করার আগে per-user eligibility ও admin/manual-grant audit দরকার।

## Next.js membership package সম্পর্কে

Next.js-এর নিজস্ব paid membership/entitlement package নেই। Next.js authentication guidance auth/session library-এর পরামর্শ দেয়, তবে package catalogue, subscription lifecycle, entitlement ledger ও provider billing app-এর domain logic। এই repo-তে PostgreSQL + Drizzle membership model ইতিমধ্যে আছে; আগে এটিকে একক, transactional এবং server-authorized করা উচিত। নতুন auth/billing dependency যোগ করার আগে বর্তমান auth/database boundaries স্থিতিশীল করুন। [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

## Shaadi.com থেকে benchmark করা product capability

নিচেরগুলো Shaadi.com-এর public documentation থেকে product benchmark; কোনো private feature/spec বা UI/text copy নয়।

1. **Premium entitlement-এ যোগাযোগের ক্ষমতা স্পষ্ট:** accepted matches-এর সাথে chat/email/phone, কিছু Plus tier-এ profile spotlight/bold listing, এবং supported plan-এ voice/video call. Premium benefit-গুলো বাস্তব delivery ও consent-সহই বিক্রি করা উচিত। [Premium benefits](https://support.shaadi.com/support/solutions/articles/48000953202-what-additional-benefits-do-i-get-as-a-premium-member-) · [Membership plan comparison](https://www.shaadi.com/info/introduction/membership-plans)
2. **Contact visibility শর্তভিত্তিক:** verified status, reciprocal acceptance, matching/privacy preferences এবং member-এর hide-number control মানতে হবে। [Contact number visibility](https://support.shaadi.com/support/solutions/articles/155000008335-why-am-i-not-able-to-view-the-contact-number-of-some-matches-)
3. **Search ও recommendation choice:** New/Daily/preference-based/wider matches, advanced criteria, এবং two-way fit-এর মত discovery concept। [Match categories](https://support.shaadi.com/support/solutions/articles/48000953813-how-does-matches-option-help-me-to-get-more-matches-with-different-options-) · [Advanced Search](https://support.shaadi.com/support/solutions/articles/48000953829-how-is-advanced-search-different-from-basic-search-) · [Two-way matching](https://www.shaadi.com/info/introduction/two-way)
4. **User-controlled safety:** Block/Report, report-to-safety escalation, hide/unhide, delete, privacy options এবং clear consequences। [Block and Report](https://www.shaadi.com/info/customer-relations/faq/report) · [Hide/Delete](https://support.shaadi.com/support/solutions/articles/48000755467-i-want-to-hide-or-delete-my-profile)
5. **Profile verification/moderation:** verification badge-এর prerequisite ও scope পরিষ্কার, profile changes review, contact reveal-এ server-side enforcement। [Profile moderation/visibility FAQ](https://www.shaadi.com/info/customer-relations/faq/profile)

**প্রস্তাবিত priority:** first fix auth/session + package/subscription database correctness + provider payment security. Then add admin CSV/XLSX bulk import with preview/row errors/invitation (no plaintext passwords). Later build consent-based advanced search, two-way match explanations, profile privacy, trust/safety moderation, and optional call/concierge only if operationally supported.

**Source notes:** Shaadi.com pages can vary by country, app version and current plan. This report records the public documentation viewed on 20 October 2026; it does not treat a competitor's terms or feature availability as requirements for MuslimBibah.

## Remediation status — ২০ অক্টোবর ২০২৬

প্রাথমিক baseline-এর পর `MuslimBibah.com` working copy-তে code সংশোধন এবং configured PostgreSQL-এ সীমিত repair করা হয়েছে:

| এলাকা | বর্তমান ফল |
|---|---|
| Login/session | Public signup থেকে admin elevation ও hardcoded password fallback সরানো হয়েছে; dashboard `/api/auth/me`-এর live DB role/membership পড়ে; `/login` sign-in form দেখায়; logout universal logout path ব্যবহার করে। TypeScript check pass করেছে। Browser end-to-end acceptance এখনও চালানো হয়নি। |
| Package/membership | PostgreSQL `packages` এখন একমাত্র source; package না পড়লে seed fallback নেই। Admin provisioning exact package ID ব্যবহার করে এবং user/profile/subscription transaction-এ তৈরি করে। প্রতি user-এর একটি active subscription enforce করার unique partial index যোগ হয়েছে। |
| Existing member rows | Database snapshot-এ ১৩ MEMBER, ১৩ profile, ১ current subscription ছিল; ১২ active member-এর current subscription ছিল না। ওই ১২ জনকে active `$0 Free Explorer` package-এ admin grant হিসেবে যুক্ত করা হয়েছে। কোনো paid revenue/payment record লেখা হয়নি। |
| Gateway state | Database-এ Stripe ও PayPal দুটিই TEST/FAILED, secret ও Stripe webhook secret নেই, তবু `active=true` ছিল। উভয়টিকে `active=false` করা হয়েছে। Gateway support code-এ থাকবে; credentials যোগ না হওয়া পর্যন্ত checkout বন্ধ থাকবে। |
| Payment integrity | Fake/simulated fulfillment সরানো হয়েছে। Stripe webhook signature ও PayPal authenticated capture-এ order owner, amount, currency ও purchase match না হলে membership grant হবে না; grant transaction/idempotency guard-সহ। Pending checkout package snapshot ধরে যাতে পরে package edit হলেও entitlement পাল্টে না যায়। |
| Secret handling | Gateway secrets API response-এ ফেরত আসে না; write-only, AES-256-GCM storage যোগ হয়েছে। Admin settings save করতে `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` (৩২-byte hex key) server environment-এ দিতে হবে। কোনো provider secret এই workspace-এ যোগ করা হয়নি। |
| Analytics | Mock/list-price revenue fallback সরানো হয়েছে; member/profile/subscription count সরাসরি DB থেকে এবং revenue শুধুমাত্র `simulated != true` completed gateway rows থেকে গণনা হবে। DB-তে থাকা ৪টি পুরোনো simulated-completed transaction audit/history হিসেবে রাখা হয়েছে, কিন্তু revenue হিসেবে গণনা হবে না। |
| এখনও বাকি | CSV/XLSX member import, invite/password-setup flow, email/phone verification, refund/chargeback reconciliation, provider sandbox round-trip এবং browser login/checkout acceptance এই remediation-এ সম্পন্ন হয়নি। এগুলো master plan-এর পরবর্তী release gate। |

Shaadi.com-এর উন্মুক্ত membership, advanced search, two-way matching, contact privacy ও safety reference কেবল benchmark হিসেবে নেওয়া হয়েছে; copy বা proprietary scoring নকল করা হয়নি। Next.js-এ built-in membership billing package নেই—সুতরাং এই app-এর PostgreSQL subscription/entitlement domain বজায় রেখে provider integration আলাদা রাখা হয়েছে।

### 8. Privacy, trust & profile data

- Marriage profile-এ DOB/age, guardian phone, family, religion, income, photo ও KYC-type তথ্য আছে; profile visibility ও contact unlocking-এর জন্য explicit field-level privacy, purpose, consent record, account deactivation/deletion, retention, access audit জরুরি। Registration-এ `photoPrivacy: 'PUBLIC'` এবং `isApproved: true` default হচ্ছে।
- Admin bulk import-এ অন্য ব্যক্তির contact ও sensitive biodata থাকবে। Import confirmation-এ submitter-এর authority/consent, encrypted transport/storage, limited staff access, rejected file deletion এবং row-level audit যুক্ত করতে হবে।
- বাস্তব profile না হওয়া seed data এবং fabricated/default profile data-কে live member search/match থেকে স্পষ্টভাবে বিচ্ছিন্ন রাখতে হবে।

## Shaadi.com থেকে নেওয়া যায় এমন পণ্যগত দিক

এগুলো Shaadi.com-এর documented public capabilities দেখে ধারণাগত benchmark; brand, text, UI বা proprietary scoring হুবহু কপি করার নির্দেশনা নয়। নিজের user research, consent ও safety standard ধরে আলাদা implementation করতে হবে।

1. **একাধিক match discovery list:** New Matches, Daily/Todays Matches, preference-fit My Matches, Near Me, Recently Viewed, Recent Visitors, Premium Matches, “members you may like/looking for me”; preference সামান্য relax করার opt-in control। [Shaadi match categories](https://support.shaadi.com/support/solutions/articles/48000953813-how-does-matches-option-help-me-to-get-more-matches-with-different-options-)
2. **Advanced search + saved preferences:** age, marital status, religion/language, location/growing up, education, profession, lifestyle, keyword; saved search ও notification। [Shaadi Advanced Search](https://support.shaadi.com/support/solutions/articles/48000953829-how-is-advanced-search-different-from-basic-search-)
3. **Two-way fit explanation:** শুধু “score” নয়—কেন দুজনের preference মিলেছে/মেলেনি তা explain করা; mutually eligible candidates আলাদা দেখা। [Shaadi two-way matching concept](https://www.shaadi.com/info/introduction/two-way)
4. **Consent-driven contact privacy:** phone hidden by default; verified profile এবং অপর পক্ষের acceptance/permission-এর পরই contact detail; member প্রতি hide/show controls। [Shaadi contact visibility & selfie verification](https://support.shaadi.com/support/solutions/articles/155000008335-why-am-i-not-able-to-view-the-contact-number-of-some-matches-)
5. **Verification + moderation workflow:** selfie/phone/email verification badges, manual review queue, photo/content screening, profile completeness, duplicate/fraud flags। Badge-এর মানে ও যাচাইয়ের scope user-কে জানাতে হবে।
6. **Secure introductions:** interest request, accept/decline/withdraw, in-platform chat, optional privacy-preserving voice/video call, match-level block/report. Premium benefits documented include chat/contact exchange and voice/video call in supported plans. [Premium feature list](https://support.shaadi.com/support/solutions/articles/48000953202-what-additional-benefits-do-i-get-as-a-premium-member-)
7. **Trust and safety surface:** profile থেকে Report/Block, harassment/scam guidance, support escalation, case history, response target, abuse detection। [Shaadi Be Safe Online](https://support.shaadi.com/support/solutions/articles/48000953859-be-safe-online)
8. **Profile privacy settings:** photo visibility, contact visibility, name/education/employer reveal, hide from search, pause profile, deactivate/delete, download/correct personal data; purpose, retention ও third-party sharing জানিয়ে privacy center। [Shaadi privacy policy](https://www.shaadi.com/info/privacy)
9. **Paid tier value clarity:** যোগাযোগের কোন action, কতদিন, সীমা/credits কত, renew/cancel/refund কী—checkout-এর আগে স্পষ্ট তুলনা। Premium highlight/concierge/assistance কেবল বাস্তব service capacity থাকলে যোগ করা।
10. **Family-assisted profile model:** user নিজের বা family member-এর profile তৈরি/পরিচালনা করলে কে data দিয়েছে, profile subject-এর সম্মতি আছে কি না, কে login/contact permission পাবে—role/consent স্পষ্ট করা। Shaadi privacy notice-ও অন্য কারও হয়ে profile দেওয়ার প্রসঙ্গ রাখে; local law/policy অনুযায়ী আলাদা consent design জরুরি।

## এখনও প্রয়োজনীয় release যাচাই

Configured database-এর aggregate membership/payment/gateway status দেখা হয়েছে, কিন্তু সেটি production deployment-এর একই target কি না যাচাই করা যায়নি। Production/runtime release-এর আগে:

- Deployed DB target/health, migration version, unique-email/phone violations, orphaned user/profile rows এবং deployed DB-তে duplicate active subscription। Sensitive rows export না করে aggregate count ব্যবহার করুন।
- Signup/login/dashboard flow: fresh signup → logout → login → refresh → new tab → inactive user → wrong role; `/api/auth/me` response এবং cookie presence/expiry; browser cache disabled state।
- Packages: Admin-এ package edit করার পর homepage, membership page, dashboard, checkout amount একই DB record দেখায় কি না। DB empty/unavailable হলে page স্পষ্ট error দেখায় কি না, seed price নয়।
- PayPal ও Stripe sandbox: test/live mode mapping, order owner/amount/currency match, repeat capture/webhook, cancel/refund, network retry, provider dashboard transaction receipt, DB transaction reconciliation। Live mode-এর আগে controlled low-value real transaction ও refund reconciliation।
- Log-এ hardcoded credential references, demo account, simulation rows এবং authentication-related 401/403/500 patterns; credential rotation-এর পর আগের credential invalid কি না।

**এই রিপোর্টের সাথে যুক্ত master implementation roadmap:** [MASTER_IMPROVEMENT_PLAN_2026-10-20.md](MASTER_IMPROVEMENT_PLAN_2026-10-20.md)
