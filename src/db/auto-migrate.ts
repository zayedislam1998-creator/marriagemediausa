import { client, db } from './index';
import bcrypt from 'bcryptjs';
import domainSeed from '../../seed-data/muslimbibah_domain_seed.json';
import { packages, users } from './schema';
import { eq } from 'drizzle-orm';

let migrationPromise: Promise<void> | null = null;

export async function ensureDatabaseReady(): Promise<void> {
  // Prevent build-time or static prerender workers from executing DDL against database
  if (
    process.env.SKIP_BUILD_MIGRATIONS === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = runAutoMigration().catch((err) => {
      migrationPromise = null; // allow retry on subsequent attempts if failed
      throw err;
    });
  }
  return migrationPromise;
}

export async function runAutoMigration(): Promise<void> {
  console.log('[Auto-Migrate] Checking and initializing database schema...');

  // 1. Extensions
  await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.catch(() => {});
  await client`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`.catch(() => {});

  // 2. Safe Enums
  const safeEnums = [
    { name: 'body_type_enum', values: ['SLIM', 'AVERAGE', 'ATHLETIC', 'HEAVY'] },
    { name: 'complexion_enum', values: ['VERY_FAIR', 'FAIR', 'WHEATISH', 'WHEATISH_MEDIUM', 'WHEATISH_BROWN', 'DARK'] },
    { name: 'diet_enum', values: ['STRICTLY_HALAL', 'HALAL_PREFERRED', 'VEGETARIAN', 'ANY'] },
    { name: 'gateway_mode_enum', values: ['TEST', 'LIVE'] },
    { name: 'gender_type', values: ['MALE', 'FEMALE'] },
    { name: 'kyc_doc_type', values: ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'DEGREE_CERTIFICATE'] },
    { name: 'kyc_status_enum', values: ['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED'] },
    { name: 'marital_status_type', values: ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER'] },
    { name: 'payment_gateway_enum', values: ['STRIPE', 'PAYPAL'] },
    { name: 'payment_status_enum', values: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
    { name: 'payment_type_enum', values: ['MEMBERSHIP_SUBSCRIPTION', 'WALLET_TOPUP'] },
    { name: 'pray_enum', values: ['ALWAYS', 'SOMETIMES', 'JUMUAH_ONLY', 'RARELY'] },
    { name: 'proposal_status_enum', values: ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED'] },
    { name: 'religiousness_enum', values: ['VERY_RELIGIOUS', 'RELIGIOUS', 'MODERATE', 'PRACTICING', 'AVERAGE', 'REVERT'] },
    { name: 'request_status_enum', values: ['PENDING', 'APPROVED', 'REJECTED'] },
    { name: 'residency_enum', values: ['CITIZEN', 'PERMANENT_RESIDENT', 'WORK_PERMIT', 'STUDENT_VISA', 'BUSINESS_VISA', 'MULTIPLE_VISA', 'TEMPORARY_VISA', 'OTHERS'] },
    { name: 'smoke_drink_enum', values: ['NO', 'OCCASIONALLY', 'SOMETIMES', 'YES'] },
    { name: 'subscription_status_enum', values: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'] },
    { name: 'user_role', values: ['SUPER_ADMIN', 'EDITOR', 'MODERATOR', 'MEMBER'] },
    { name: 'wallet_transaction_type_enum', values: ['PACKAGE_ALLOWANCE', 'CREDIT_PURCHASE', 'CONTACT_UNLOCK_DEBIT', 'ADMIN_ADJUSTMENT', 'REFUND_REVERSAL'] },
  ];

  for (const e of safeEnums) {
    const valString = e.values.map((v) => `'${v}'`).join(', ');
    await client.unsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${e.name}') THEN
          CREATE TYPE "${e.name}" AS ENUM(${valString});
        END IF;
      END $$;
    `).catch((err) => console.warn(`[Auto-Migrate] Enum ${e.name} warning:`, err?.message || err));
  }

  // 3. Tables
  // Table: users
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "phone_number" varchar(30) NOT NULL UNIQUE,
      "password_hash" varchar(255) NOT NULL,
      "role" "user_role" DEFAULT 'MEMBER' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "is_verified" boolean DEFAULT false NOT NULL,
      "email_verified_at" timestamp with time zone,
      "phone_verified_at" timestamp with time zone,
      "last_login_at" timestamp with time zone,
      "invite_token" varchar(255),
      "invite_expires_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  await client.unsafe(`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invite_token" varchar(255);
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invite_expires_at" timestamp with time zone;
  `).catch(console.error);

  // Table: packages
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "packages" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar(100) NOT NULL,
      "duration_months" integer NOT NULL,
      "price_usd" numeric(10, 2) NOT NULL,
      "contact_credits" integer NOT NULL,
      "daily_profile_view_limit" integer NOT NULL,
      "features_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "badge_title" varchar(50) DEFAULT 'Member',
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: profiles
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "profiles" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
      "profile_id" varchar(15) NOT NULL UNIQUE,
      "created_by" varchar(50) DEFAULT 'self' NOT NULL,
      "created_for" varchar(50) DEFAULT 'self' NOT NULL,
      "looking_for" "gender_type" NOT NULL,
      "full_name" varchar(120) NOT NULL,
      "nick_name" varchar(60),
      "gender" "gender_type" NOT NULL,
      "date_of_birth" date NOT NULL,
      "age" integer NOT NULL,
      "marital_status" "marital_status_type" DEFAULT 'NEVER_MARRIED' NOT NULL,
      "have_children" varchar(10) DEFAULT 'No',
      "child_living_status" varchar(50) DEFAULT 'No Child',
      "family_values" varchar(50) DEFAULT 'Religious',
      "father_status" varchar(60) DEFAULT 'Employed',
      "mother_status" varchar(60) DEFAULT 'Homemaker',
      "brothers_count" varchar(10) DEFAULT '0',
      "sisters_count" varchar(10) DEFAULT '0',
      "sibling_position" varchar(20) DEFAULT '1',
      "height_feet_inches" varchar(15) NOT NULL,
      "height_cm" integer NOT NULL,
      "weight_kg" integer,
      "body_type" "body_type_enum" DEFAULT 'AVERAGE',
      "complexion" "complexion_enum" DEFAULT 'FAIR',
      "eyes_color" varchar(30) DEFAULT 'Black',
      "hair_color" varchar(30) DEFAULT 'Black',
      "blood_group" varchar(10),
      "disability" varchar(80) DEFAULT 'None',
      "eye_wear" varchar(30) DEFAULT 'None',
      "religion" varchar(30) DEFAULT 'Islam' NOT NULL,
      "sect_mazhab" varchar(50) DEFAULT 'Sunni / Hanafi',
      "religiousness" "religiousness_enum" DEFAULT 'RELIGIOUS',
      "pray_frequency" "pray_enum" DEFAULT 'ALWAYS',
      "halal_diet" "diet_enum" DEFAULT 'STRICTLY_HALAL',
      "smoke" "smoke_drink_enum" DEFAULT 'NO',
      "drink" "smoke_drink_enum" DEFAULT 'NO',
      "wears_hijab_or_beard" boolean DEFAULT false,
      "mother_tongue" varchar(50) DEFAULT 'English' NOT NULL,
      "education_level" varchar(80) NOT NULL,
      "institution_name" varchar(150),
      "field_of_study" varchar(100),
      "profession" varchar(80) NOT NULL,
      "designation" varchar(100),
      "employer_name" varchar(150),
      "experience_years" varchar(20),
      "annual_income" varchar(50),
      "nationality" varchar(80) DEFAULT 'United States' NOT NULL,
      "country_living_in" varchar(80) DEFAULT 'United States (USA)' NOT NULL,
      "state_province" varchar(80) NOT NULL,
      "city" varchar(80) NOT NULL,
      "zip_code" varchar(30) NOT NULL,
      "residing_status" "residency_enum" DEFAULT 'CITIZEN' NOT NULL,
      "address_line" text,
      "guardian_name" varchar(120) NOT NULL,
      "guardian_relation" varchar(60) NOT NULL,
      "guardian_phone_country_code" varchar(10) DEFAULT '+1',
      "guardian_phone" varchar(30) NOT NULL,
      "guardian_verified" boolean DEFAULT false,
      "about_me" text NOT NULL,
      "what_i_am_looking_for" text NOT NULL,
      "hobbies_interests" text,
      "photo_privacy" varchar(30) DEFAULT 'PUBLIC' NOT NULL,
      "completion_percentage" integer DEFAULT 20 NOT NULL,
      "is_featured" boolean DEFAULT false NOT NULL,
      "kyc_status" "kyc_status_enum" DEFAULT 'NOT_SUBMITTED' NOT NULL,
      "is_approved" boolean DEFAULT false NOT NULL,
      "cover_photo_url" text,
      "cv_url" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: user_subscriptions
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "user_subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "package_id" integer NOT NULL REFERENCES "packages"("id"),
      "status" "subscription_status_enum" DEFAULT 'ACTIVE' NOT NULL,
      "price_paid_usd" numeric(10, 2) NOT NULL,
      "contact_credits_remaining" integer NOT NULL,
      "started_at" timestamp with time zone DEFAULT now() NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "payment_reference" varchar(100),
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: partner_preferences
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "partner_preferences" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "profile_id" uuid NOT NULL UNIQUE REFERENCES "profiles"("id") ON DELETE CASCADE,
      "age_min" integer DEFAULT 18 NOT NULL,
      "age_max" integer DEFAULT 50 NOT NULL,
      "height_min_cm" integer DEFAULT 120,
      "height_max_cm" integer DEFAULT 220,
      "marital_status" varchar(60) DEFAULT 'Doesn''t Matter',
      "children_acceptable" varchar(30) DEFAULT 'Doesn''t Matter',
      "education_min" varchar(80) DEFAULT 'Doesn''t Matter',
      "allowed_professions" text DEFAULT 'Doesn''t Matter',
      "preferred_country" varchar(80) DEFAULT 'United States (USA)',
      "preferred_state" varchar(80) DEFAULT 'Doesn''t Matter',
      "preferred_residency" "residency_enum",
      "religiousness" "religiousness_enum",
      "diet" "diet_enum",
      "smoke" "smoke_drink_enum" DEFAULT 'NO',
      "drink" "smoke_drink_enum" DEFAULT 'NO',
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: user_photos
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "user_photos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "url_full" varchar(255) NOT NULL,
      "url_thumb" varchar(255) NOT NULL,
      "url_blur" varchar(255) NOT NULL,
      "is_primary" boolean DEFAULT false NOT NULL,
      "is_approved" boolean DEFAULT true NOT NULL,
      "sort_order" integer DEFAULT 0,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: audit_logs
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" bigserial PRIMARY KEY NOT NULL,
      "actor_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "action" varchar(80) NOT NULL,
      "entity_name" varchar(80) NOT NULL,
      "entity_id" varchar(80),
      "meta" jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: proposals
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "proposals" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "receiver_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "status" "proposal_status_enum" DEFAULT 'PENDING' NOT NULL,
      "initial_message" text,
      "rejection_reason" text,
      "responded_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: conversations
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "conversations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_one" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "user_two" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: messages
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
      "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "content" text NOT NULL,
      "is_read" boolean DEFAULT false NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: member_resumes
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "member_resumes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "resume_type" varchar(30) NOT NULL,
      "file_name" varchar(255),
      "file_url" text,
      "file_size_bytes" integer,
      "document_content" text,
      "title" varchar(255) DEFAULT 'Matrimonial Biodata & CV' NOT NULL,
      "is_primary" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: profile_requirements_config
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "profile_requirements_config" (
      "id" varchar(64) PRIMARY KEY NOT NULL,
      "field_key" varchar(64) NOT NULL UNIQUE,
      "field_label" varchar(128) NOT NULL,
      "category" varchar(32) NOT NULL,
      "is_required_for_registration" boolean DEFAULT false NOT NULL,
      "is_required_for_profile" boolean DEFAULT true NOT NULL,
      "completion_weight_percent" integer DEFAULT 5 NOT NULL,
      "gender_applicable" varchar(16) DEFAULT 'ALL' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: form_builder_configs
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "form_builder_configs" (
      "form_id" varchar(64) PRIMARY KEY NOT NULL,
      "title" varchar(128) NOT NULL,
      "theme" varchar(64) DEFAULT 'emerald' NOT NULL,
      "border_radius" varchar(32) DEFAULT '12px' NOT NULL,
      "button_text" varchar(128) NOT NULL,
      "fields_json" jsonb NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: payment_gateways_config
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "payment_gateways_config" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "gateway" "payment_gateway_enum" NOT NULL UNIQUE,
      "mode" "gateway_mode_enum" DEFAULT 'TEST' NOT NULL,
      "is_active" boolean DEFAULT false NOT NULL,
      "public_key" varchar(255) NOT NULL,
      "encrypted_secret_key" text NOT NULL,
      "encrypted_webhook_secret" text NOT NULL,
      "webhook_id" varchar(120),
      "settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "last_tested_at" timestamp with time zone,
      "test_status" varchar(30) DEFAULT 'UNTESTED',
      "last_test_message" text,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: payment_transactions
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "payment_transactions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "gateway" "payment_gateway_enum" NOT NULL,
      "gateway_transaction_id" varchar(255) NOT NULL UNIQUE,
      "gateway_event_id" varchar(255),
      "amount" numeric(10, 2) NOT NULL,
      "fee_amount" numeric(10, 2) DEFAULT '0.00',
      "net_amount" numeric(10, 2),
      "currency" varchar(3) DEFAULT 'USD' NOT NULL,
      "status" "payment_status_enum" DEFAULT 'PENDING' NOT NULL,
      "payment_type" "payment_type_enum" NOT NULL,
      "package_id" integer REFERENCES "packages"("id") ON DELETE SET NULL,
      "credits_purchased" integer DEFAULT 0 NOT NULL,
      "raw_payload" jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: wallet_ledger
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "wallet_ledger" (
      "id" bigserial PRIMARY KEY NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "transaction_type" "wallet_transaction_type_enum" NOT NULL,
      "amount" integer NOT NULL,
      "reference_id" uuid,
      "notes" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: processed_webhook_events
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "processed_webhook_events" (
      "event_id" varchar(255) PRIMARY KEY NOT NULL,
      "gateway" "payment_gateway_enum" NOT NULL,
      "event_type" varchar(100) NOT NULL,
      "processed_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: bookmarks
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "bookmarks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "bookmarked_profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: profile_views
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "profile_views" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "viewer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "viewed_profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "viewed_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: photo_access_requests
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "photo_access_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "requester_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "target_profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "status" "request_status_enum" DEFAULT 'PENDING' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: contact_unlock_requests
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "contact_unlock_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "requester_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "target_profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "status" "request_status_enum" DEFAULT 'PENDING' NOT NULL,
      "credit_deducted" integer DEFAULT 1 NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: kyc_verifications
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "kyc_verifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "doc_type" "kyc_doc_type" NOT NULL,
      "doc_number" varchar(80) NOT NULL,
      "doc_file_path" varchar(255) NOT NULL,
      "status" "kyc_status_enum" DEFAULT 'PENDING' NOT NULL,
      "moderator_notes" text,
      "reviewed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "reviewed_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: moderation_reports
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "moderation_reports" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "reporter_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "reported_profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
      "reason" varchar(100) NOT NULL,
      "details" text,
      "status" varchar(30) DEFAULT 'OPEN' NOT NULL,
      "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: success_stories
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "success_stories" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar(200) NOT NULL,
      "couple_names" varchar(150) NOT NULL,
      "wedding_date" date,
      "image_url" varchar(255),
      "story_body" text NOT NULL,
      "is_published" boolean DEFAULT true NOT NULL,
      "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: contact_submissions (Durable inbox for Contact & Wedding inquiries)
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "contact_submissions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "type" varchar(50) DEFAULT 'CONTACT' NOT NULL,
      "full_name" varchar(150) NOT NULL,
      "email" varchar(255) NOT NULL,
      "phone_number" varchar(50) NOT NULL,
      "subject" varchar(255),
      "city_state" varchar(150),
      "service_type" varchar(100),
      "message" text NOT NULL,
      "status" varchar(30) DEFAULT 'NEW' NOT NULL,
      "admin_notes" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: cms_articles (Durable CMS articles and Islamic advice hub)
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "cms_articles" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar(255) NOT NULL,
      "slug" varchar(255) UNIQUE NOT NULL,
      "category" varchar(100) NOT NULL,
      "author" varchar(120) DEFAULT 'Editorial Board' NOT NULL,
      "excerpt" text NOT NULL,
      "content" text NOT NULL,
      "reads_count" integer DEFAULT 0 NOT NULL,
      "is_published" boolean DEFAULT true NOT NULL,
      "is_featured" boolean DEFAULT false NOT NULL,
      "published_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `).catch(console.error);

  // Table: cms_page_sections (Durable CMS content for all pages, FAQs, banners, and SEO)
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "cms_page_sections" (
      "id" serial PRIMARY KEY NOT NULL,
      "page_key" varchar(80) NOT NULL,
      "section_key" varchar(80) NOT NULL,
      "title" varchar(255),
      "content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "is_published" boolean DEFAULT true NOT NULL,
      "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "unique_page_section" ON "cms_page_sections" ("page_key", "section_key");
  `).catch(console.error);

  // Add column migrations for users (one-time setup invite token)
  await client.unsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invite_token" varchar(255);`).catch(() => {});
  await client.unsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invite_expires_at" timestamp with time zone;`).catch(() => {});


  // Essential Indexes (Safe)
  // Enforce one active membership per account. Fail startup if legacy duplicates exist so
  // the conflict is repaired explicitly instead of silently running without the invariant.
  await client.unsafe('CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_user_subscription" ON "user_subscriptions" ("user_id") WHERE "status" = \'ACTIVE\'');
  const safeIndexes = [
    'CREATE UNIQUE INDEX IF NOT EXISTS "unique_bookmark" ON "bookmarks" ("user_id", "bookmarked_profile_id")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "unique_contact_unlock" ON "contact_unlock_requests" ("requester_id", "target_profile_id")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "unique_conversation_pair" ON "conversations" ("user_one", "user_two")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "unique_photo_access" ON "photo_access_requests" ("requester_id", "target_profile_id")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_proposal" ON "proposals" ("sender_id", "receiver_id")',
    'CREATE INDEX IF NOT EXISTS "idx_messages_conversation" ON "messages" ("conversation_id", "created_at")',
    'CREATE INDEX IF NOT EXISTS "idx_transactions_user" ON "payment_transactions" ("user_id", "created_at")',
    'CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "payment_transactions" ("status", "created_at")',
    'CREATE INDEX IF NOT EXISTS "idx_profile_views_viewed" ON "profile_views" ("viewed_profile_id", "viewed_at")',
    'CREATE INDEX IF NOT EXISTS "idx_profiles_search" ON "profiles" ("gender", "country_living_in", "state_province", "age")',
    'CREATE INDEX IF NOT EXISTS "idx_proposals_receiver" ON "proposals" ("receiver_id", "status")',
    'CREATE INDEX IF NOT EXISTS "idx_proposals_sender" ON "proposals" ("sender_id", "status")',
    'CREATE INDEX IF NOT EXISTS "idx_wallet_ledger_user" ON "wallet_ledger" ("user_id", "created_at")',
  ];

  for (const idxSql of safeIndexes) {
    await client.unsafe(idxSql).catch(() => {});
  }

  // 4. Default Package Seeding
  try {
    const pkgCount = await client`SELECT count(*) FROM "packages"`;
    if (parseInt(pkgCount[0]?.count || '0') === 0) {
      console.log('[Auto-Migrate] Seeding authentic packages from seed JSON...');
      for (const p of domainSeed.packages) {
        await client`
          INSERT INTO "packages" (id, name, duration_months, price_usd, contact_credits, daily_profile_view_limit, features_json, badge_title, is_active)
          VALUES (
            ${p.id},
            ${p.name},
            ${p.duration_months},
            ${p.price_usd},
            ${p.contact_credits},
            ${p.daily_profile_view_limit},
            ${JSON.stringify(p.features)},
            ${p.badge_title},
            true
          )
          ON CONFLICT (id) DO NOTHING;
        `.catch(console.warn);
      }
      // reset serial sequence
      await client`SELECT setval(pg_get_serial_sequence('packages', 'id'), coalesce(max(id), 1)) FROM "packages";`.catch(() => {});
    }
  } catch (err) {
    console.warn('[Auto-Migrate] Package seeding error:', err);
  }

  // 5. Default Super Admin Seeding
  try {
    const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const phone = process.env.INITIAL_ADMIN_PHONE?.trim();
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    if (email && phone && password && password.length >= 12) {
      const [existingAdmin] = await client`SELECT id FROM "users" WHERE email = ${email} LIMIT 1`;
      if (!existingAdmin) {
        const hash = await bcrypt.hash(password, 12);
      await client`
        INSERT INTO "users" (email, phone_number, password_hash, role, is_active, is_verified)
        VALUES (${email}, ${phone}, ${hash}, 'SUPER_ADMIN', true, false)
        ON CONFLICT (email) DO NOTHING;
      `;
      }
    } else {
      console.info('[Auto-Migrate] No initial administrator bootstrap credentials set; skipping admin creation.');
    }
  } catch (err) {
    console.warn('[Auto-Migrate] Admin seeding error:', err);
  }

  // 6. Default Form Builder Configs Seeding
  try {
    const formCount = await client`SELECT count(*) FROM "form_builder_configs"`;
    if (parseInt(formCount[0]?.count || '0') === 0) {
      console.log('[Auto-Migrate] Seeding default Form Builder configurations...');
      const forms = [
        {
          form_id: 'login',
          title: 'Member & Admin Login Portal',
          theme: 'emerald',
          border_radius: '12px',
          button_text: 'Sign In to Marriage Media USA',
          fields_json: JSON.stringify([
            { id: 'f_email', fieldKey: 'email', label: 'Email Address', placeholder: 'your.email@example.com', type: 'email', required: true, width: 'full', order: 1 },
            { id: 'f_password', fieldKey: 'password', label: 'Security Password', placeholder: '••••••••••••', type: 'password', required: true, width: 'full', order: 2 },
          ]),
        },
        {
          form_id: 'register',
          title: 'Authentic 100% Halal Registration',
          theme: 'emerald',
          border_radius: '12px',
          button_text: 'Create Verified Halal Account',
          fields_json: JSON.stringify([
            { id: 'f_reg_name', fieldKey: 'full_name', label: 'Full Legal Name', placeholder: 'e.g. Shahidul Islam', type: 'text', required: true, width: 'half', order: 1 },
            { id: 'f_reg_email', fieldKey: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email', required: true, width: 'half', order: 2 },
            { id: 'f_reg_phone', fieldKey: 'phone_number', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true, width: 'half', order: 3 },
            { id: 'f_reg_pass', fieldKey: 'password', label: 'Account Password', placeholder: 'Minimum 8 characters', type: 'password', required: true, width: 'half', order: 4 },
          ]),
        },
      ];
      for (const f of forms) {
        await client`
          INSERT INTO "form_builder_configs" (form_id, title, theme, border_radius, button_text, fields_json)
          VALUES (${f.form_id}, ${f.title}, ${f.theme}, ${f.border_radius}, ${f.button_text}, ${f.fields_json}::jsonb)
          ON CONFLICT (form_id) DO NOTHING;
        `.catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Auto-Migrate] Form builder seeding error:', err);
  }

  // 7. Default Success Stories Seeding
  try {
    const storyCount = await client`SELECT count(*) FROM "success_stories"`;
    if (parseInt(storyCount[0]?.count || '0') === 0) {
      console.log('[Auto-Migrate] Seeding authentic initial success stories into database...');
      const stories = [
        {
          title: 'Blessed Nikah in Dallas, Texas',
          couple_names: 'Dr. Tariq & Fatima',
          wedding_date: '2025-08-15',
          image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          story_body: 'Both sets of parents met via MuslimBibah after Wali verification. Alhamdulillah, solemnized within 6 months with full family barakah.',
        },
        {
          title: 'Finding Sunnah Peace in Chicago',
          couple_names: 'Zayan & Maryam',
          wedding_date: '2025-11-20',
          image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
          story_body: 'Connected under Gold Membership. The Purdah blur photo shield provided full comfort before formal family engagement and Nikah.',
        },
        {
          title: 'Silicon Valley & New York Doctor Match',
          couple_names: 'Farhan & Dr. Sarah',
          wedding_date: '2026-01-10',
          image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
          story_body: 'Direct Wali-to-Wali communication ensured complete transparency and barakah across state lines. Married with Sunnah simplicity.',
        },
      ];
      for (const s of stories) {
        await client`
          INSERT INTO "success_stories" (title, couple_names, wedding_date, image_url, story_body, is_published)
          VALUES (${s.title}, ${s.couple_names}, ${s.wedding_date}, ${s.image_url}, ${s.story_body}, true)
        `.catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Auto-Migrate] Success stories seeding error:', err);
  }

  // 8. Default CMS Articles Seeding
  try {
    const articleCount = await client`SELECT count(*) FROM "cms_articles"`;
    if (parseInt(articleCount[0]?.count || '0') === 0) {
      console.log('[Auto-Migrate] Seeding authentic CMS articles into database...');
      const articles = [
        {
          title: 'The Sunnah of Choosing a Spouse in Islam',
          slug: 'sunnah-of-choosing-a-spouse',
          category: 'Sunnah Ethics',
          author: 'Shaykh Matrimonial Advisor',
          excerpt: 'Fundamental guidelines from Quran and authentic Sunnah on prioritizing piety, character, and mutual compatibility.',
          content: 'The Prophet Muhammad (peace be upon him) guided us to seek righteousness above all. When both parties place Allah at the centre of their marriage, love and mercy flow naturally.',
          reads_count: 1420,
        },
        {
          title: 'Rights and Responsibilities of the Wali (Guardian)',
          slug: 'rights-and-responsibilities-of-the-wali',
          category: 'Islamic Fiqh',
          author: 'Council of North American Imams',
          excerpt: 'Understanding the protective, honorable role of the Wali in the matrimonial process and safeguarding modesty.',
          content: 'The Wali serves as a protective guardian ensuring transparency, authentic background verification, and respect throughout courtship and Nikah negotiation.',
          reads_count: 980,
        },
        {
          title: 'Navigating US Immigration, Visas & EAD in Matrimony',
          slug: 'navigating-us-immigration-visas-ead',
          category: 'Diaspora Guide',
          author: 'Diaspora Legal Counsel',
          excerpt: 'A practical, halal roadmap for couples navigating dual residency, green cards, and work permits in the United States.',
          content: 'Cross-border and diaspora marriages require practical foresight. Clear legal consultation and halal transparency ensure peace of mind for both families.',
          reads_count: 2150,
        },
      ];
      for (const a of articles) {
        await client`
          INSERT INTO "cms_articles" (title, slug, category, author, excerpt, content, reads_count, is_published)
          VALUES (${a.title}, ${a.slug}, ${a.category}, ${a.author}, ${a.excerpt}, ${a.content}, ${a.reads_count}, true)
          ON CONFLICT (slug) DO NOTHING;
        `.catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Auto-Migrate] CMS articles seeding error:', err);
  }

  // 9. Default CMS Page Sections & Site Content Seeding
  try {
    const secCount = await client`SELECT count(*) FROM "cms_page_sections"`;
    if (parseInt(secCount[0]?.count || '0') === 0) {
      console.log('[Auto-Migrate] Seeding authentic CMS page sections and FAQs into database...');
      const defaultSections = [
        {
          page_key: 'faq',
          section_key: 'general_faq',
          title: 'Frequently Asked Questions',
          content_json: [
            {
              id: 'FAQ-01',
              category: 'Wali & Fiqh',
              question: 'Why is Wali (Guardian) contact mandatory for female biodatas?',
              answer: 'In accordance with authentic Prophetic Sunnah and Islamic jurisprudence, MuslimBibah ensures every sister is represented with dignity and family oversight through a verified Wali (Father, Brother, or Legal Guardian).',
              active: true,
            },
            {
              id: 'FAQ-02',
              category: 'Purdah Privacy',
              question: 'How does the 24px Purdah Gaussian Blur photo shield protect my privacy?',
              answer: 'When BLURRED_PURDAH is active, our Sharp media engine generates a 24px Gaussian blurred WebP image on the server. Raw unblurred photo URLs are never exposed to unauthorized visitors without your explicit approval.',
              active: true,
            },
            {
              id: 'FAQ-03',
              category: 'KYC & Safety',
              question: 'Where are my US Passport, State ID, and Degree certificates stored?',
              answer: 'All KYC verification documents are stored strictly outside the public web root in /uploads/private/kyc/ and can only be inspected by authorized Trust & Safety Moderators.',
              active: true,
            },
            {
              id: 'FAQ-04',
              category: 'Membership & Credits',
              question: 'How do Contact Unlock Credits work across Silver ($2,000) and Gold ($3,000) tiers?',
              answer: 'Each verified contact unlock deducts 1 credit atomically and reveals the suitor and Wali telephone numbers immediately, while logging the unlock for mutual accountability.',
              active: true,
            },
          ],
        },
        {
          page_key: 'home',
          section_key: 'hero_banners',
          title: 'Promotional Campaigns & Hero Ribbons',
          content_json: [
            {
              id: 'CMP-01',
              name: 'US Medical & Engineering Suitors Spotlight',
              placement: 'Homepage Hero Ribbon',
              targetRegion: 'USA & Canada',
              active: true,
            },
            {
              id: 'CMP-02',
              name: '100% Wali-Verified Blessed Nikkah Drive',
              placement: 'Search Workspace Top Banner',
              targetRegion: 'Global Diaspora',
              active: true,
            },
            {
              id: 'CMP-03',
              name: 'US Elite Concierge ($6,500) Matchmaker Desk',
              placement: 'Member Dashboard Upgrade Card',
              targetRegion: 'NY, TX, CA, IL, VA',
              active: true,
            },
          ],
        },
        {
          page_key: 'contact',
          section_key: 'support_info',
          title: 'Concierge Support & Verification Office',
          content_json: {
            phone: '+1 (718) 555-HALAL',
            email: 'support@muslimbibah.com',
            officeAddress: '545 5th Ave, Suite 900, New York, NY 10017',
            officeHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
          },
        },
        {
          page_key: 'seo',
          section_key: 'meta_defaults',
          title: 'Platform SEO & Meta Standards',
          content_json: {
            titleTemplate: '%s | MuslimBibah.com — USA & Global Halal Matrimonial Platform',
            defaultDescription: 'Authentic 100% Halal Islamic Matrimonial Platform for Practicing Muslims in the United States, Canada, and Worldwide. Verified Wali oversight, Purdah privacy, and zero dating culture.',
            canonicalDomain: 'https://muslimbibah.com',
          },
        },
      ];

      for (const s of defaultSections) {
        await client`
          INSERT INTO "cms_page_sections" (page_key, section_key, title, content_json, is_published)
          VALUES (${s.page_key}, ${s.section_key}, ${s.title}, ${JSON.stringify(s.content_json)}, true)
          ON CONFLICT (page_key, section_key) DO NOTHING;
        `.catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Auto-Migrate] CMS page sections seeding error:', err);
  }

  console.log('[Auto-Migrate] ✓ Database schema verified and ready.');
}
