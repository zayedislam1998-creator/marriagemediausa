CREATE TYPE "public"."body_type_enum" AS ENUM('SLIM', 'AVERAGE', 'ATHLETIC', 'HEAVY');--> statement-breakpoint
CREATE TYPE "public"."complexion_enum" AS ENUM('VERY_FAIR', 'FAIR', 'WHEATISH', 'WHEATISH_MEDIUM', 'WHEATISH_BROWN', 'DARK');--> statement-breakpoint
CREATE TYPE "public"."diet_enum" AS ENUM('STRICTLY_HALAL', 'HALAL_PREFERRED', 'VEGETARIAN', 'ANY');--> statement-breakpoint
CREATE TYPE "public"."gateway_mode_enum" AS ENUM('TEST', 'LIVE');--> statement-breakpoint
CREATE TYPE "public"."gender_type" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."kyc_doc_type" AS ENUM('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'DEGREE_CERTIFICATE');--> statement-breakpoint
CREATE TYPE "public"."kyc_status_enum" AS ENUM('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."marital_status_type" AS ENUM('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway_enum" AS ENUM('STRIPE', 'PAYPAL');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_type_enum" AS ENUM('MEMBERSHIP_SUBSCRIPTION', 'WALLET_TOPUP');--> statement-breakpoint
CREATE TYPE "public"."pray_enum" AS ENUM('ALWAYS', 'SOMETIMES', 'JUMUAH_ONLY', 'RARELY');--> statement-breakpoint
CREATE TYPE "public"."proposal_status_enum" AS ENUM('PENDING', 'SHORTLISTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."religiousness_enum" AS ENUM('VERY_RELIGIOUS', 'RELIGIOUS', 'MODERATE', 'PRACTICING', 'AVERAGE', 'REVERT');--> statement-breakpoint
CREATE TYPE "public"."request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."residency_enum" AS ENUM('CITIZEN', 'PERMANENT_RESIDENT', 'WORK_PERMIT', 'STUDENT_VISA', 'BUSINESS_VISA', 'MULTIPLE_VISA', 'TEMPORARY_VISA', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."smoke_drink_enum" AS ENUM('NO', 'OCCASIONALLY', 'SOMETIMES', 'YES');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'EDITOR', 'MODERATOR', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type_enum" AS ENUM('PACKAGE_ALLOWANCE', 'CREDIT_PURCHASE', 'CONTACT_UNLOCK_DEBIT', 'ADMIN_ADJUSTMENT', 'REFUND_REVERSAL');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_name" varchar(80) NOT NULL,
	"entity_id" varchar(80),
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bookmarked_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_unlock_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"target_profile_id" uuid NOT NULL,
	"status" "request_status_enum" DEFAULT 'PENDING' NOT NULL,
	"credit_deducted" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_one" uuid NOT NULL,
	"user_two" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_builder_configs" (
	"form_id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"theme" varchar(64) DEFAULT 'emerald' NOT NULL,
	"border_radius" varchar(32) DEFAULT '12px' NOT NULL,
	"button_text" varchar(128) NOT NULL,
	"fields_json" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"doc_type" "kyc_doc_type" NOT NULL,
	"doc_number" varchar(80) NOT NULL,
	"doc_file_path" varchar(255) NOT NULL,
	"status" "kyc_status_enum" DEFAULT 'PENDING' NOT NULL,
	"moderator_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reported_profile_id" uuid NOT NULL,
	"reason" varchar(100) NOT NULL,
	"details" text,
	"status" varchar(30) DEFAULT 'OPEN' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
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
--> statement-breakpoint
CREATE TABLE "partner_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partner_preferences_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "payment_gateways_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway" "payment_gateway_enum" NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_gateways_config_gateway_unique" UNIQUE("gateway")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gateway" "payment_gateway_enum" NOT NULL,
	"gateway_transaction_id" varchar(255) NOT NULL,
	"gateway_event_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"fee_amount" numeric(10, 2) DEFAULT '0.00',
	"net_amount" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "payment_status_enum" DEFAULT 'PENDING' NOT NULL,
	"payment_type" "payment_type_enum" NOT NULL,
	"package_id" integer,
	"credits_purchased" integer DEFAULT 0 NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_gateway_transaction_id_unique" UNIQUE("gateway_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "photo_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"target_profile_id" uuid NOT NULL,
	"status" "request_status_enum" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_webhook_events" (
	"event_id" varchar(255) PRIMARY KEY NOT NULL,
	"gateway" "payment_gateway_enum" NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_requirements_config" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"field_key" varchar(64) NOT NULL,
	"field_label" varchar(128) NOT NULL,
	"category" varchar(32) NOT NULL,
	"is_required_for_registration" boolean DEFAULT false NOT NULL,
	"is_required_for_profile" boolean DEFAULT true NOT NULL,
	"completion_weight_percent" integer DEFAULT 5 NOT NULL,
	"gender_applicable" varchar(16) DEFAULT 'ALL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_requirements_config_field_key_unique" UNIQUE("field_key")
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewer_id" uuid NOT NULL,
	"viewed_profile_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" varchar(15) NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"status" "proposal_status_enum" DEFAULT 'PENDING' NOT NULL,
	"initial_message" text,
	"rejection_reason" text,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"couple_names" varchar(150) NOT NULL,
	"wedding_date" date,
	"image_url" varchar(255),
	"story_body" text NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"url_full" varchar(255) NOT NULL,
	"url_thumb" varchar(255) NOT NULL,
	"url_blur" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"package_id" integer NOT NULL,
	"status" "subscription_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"price_paid_usd" numeric(10, 2) NOT NULL,
	"contact_credits_remaining" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"payment_reference" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'MEMBER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "wallet_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_type" "wallet_transaction_type_enum" NOT NULL,
	"amount" integer NOT NULL,
	"reference_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_bookmarked_profile_id_profiles_id_fk" FOREIGN KEY ("bookmarked_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_unlock_requests" ADD CONSTRAINT "contact_unlock_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_unlock_requests" ADD CONSTRAINT "contact_unlock_requests_target_profile_id_profiles_id_fk" FOREIGN KEY ("target_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_one_users_id_fk" FOREIGN KEY ("user_one") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_two_users_id_fk" FOREIGN KEY ("user_two") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_resumes" ADD CONSTRAINT "member_resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reported_profile_id_profiles_id_fk" FOREIGN KEY ("reported_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_preferences" ADD CONSTRAINT "partner_preferences_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_access_requests" ADD CONSTRAINT "photo_access_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_access_requests" ADD CONSTRAINT "photo_access_requests_target_profile_id_profiles_id_fk" FOREIGN KEY ("target_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewed_profile_id_profiles_id_fk" FOREIGN KEY ("viewed_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_stories" ADD CONSTRAINT "success_stories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bookmark" ON "bookmarks" USING btree ("user_id","bookmarked_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_contact_unlock" ON "contact_unlock_requests" USING btree ("requester_id","target_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_conversation_pair" ON "conversations" USING btree ("user_one","user_two");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_user" ON "payment_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "payment_transactions" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_photo_access" ON "photo_access_requests" USING btree ("requester_id","target_profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_views_viewed" ON "profile_views" USING btree ("viewed_profile_id","viewed_at");--> statement-breakpoint
CREATE INDEX "idx_profiles_search" ON "profiles" USING btree ("gender","country_living_in","state_province","age");--> statement-breakpoint
CREATE INDEX "idx_profiles_profession" ON "profiles" USING btree ("profession");--> statement-breakpoint
CREATE INDEX "idx_profiles_residing_status" ON "profiles" USING btree ("residing_status");--> statement-breakpoint
CREATE INDEX "idx_profiles_marital_status" ON "profiles" USING btree ("marital_status");--> statement-breakpoint
CREATE INDEX "idx_profiles_approved_featured" ON "profiles" USING btree ("is_approved","is_featured");--> statement-breakpoint
CREATE INDEX "idx_proposals_receiver" ON "proposals" USING btree ("receiver_id","status");--> statement-breakpoint
CREATE INDEX "idx_proposals_sender" ON "proposals" USING btree ("sender_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_proposal" ON "proposals" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_ledger_user" ON "wallet_ledger" USING btree ("user_id","created_at");