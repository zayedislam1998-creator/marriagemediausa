import { client, db } from './index';
import bcrypt from 'bcryptjs';
import domainSeed from '../../seed-data/marriagemediausa_domain_seed.json';
import { packages, users } from './schema';
import { eq } from 'drizzle-orm';

let migrationPromise: Promise<void> | null = null;

export async function ensureDatabaseReady(): Promise<void> {
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
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
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
    const [existingAdmin] = await client`SELECT id FROM "users" WHERE email = 'admin@marriagemediausa.com' LIMIT 1`;
    if (!existingAdmin) {
      console.log('[Auto-Migrate] Creating default Super Admin (admin@marriagemediausa.com)...');
      const hash = await bcrypt.hash('Admin@MarriageMedia2026', 10);
      await client`
        INSERT INTO "users" (email, phone_number, password_hash, role, is_active, is_verified)
        VALUES ('admin@marriagemediausa.com', '+1-202-555-0100', ${hash}, 'SUPER_ADMIN', true, true)
        ON CONFLICT (email) DO NOTHING;
      `;
    }
  } catch (err) {
    console.warn('[Auto-Migrate] Admin seeding error:', err);
  }

  console.log('[Auto-Migrate] ✓ Database schema verified and ready.');
}
