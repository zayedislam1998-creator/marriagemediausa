import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  jsonb,
  serial,
  bigserial,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ============================================================================
// 0. ENUMS
// ============================================================================
export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'EDITOR', 'MODERATOR', 'MEMBER']);
export const genderEnum = pgEnum('gender_type', ['MALE', 'FEMALE']);
export const maritalStatusEnum = pgEnum('marital_status_type', ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER']);
export const bodyTypeEnum = pgEnum('body_type_enum', ['SLIM', 'AVERAGE', 'ATHLETIC', 'HEAVY']);
export const complexionEnum = pgEnum('complexion_enum', ['VERY_FAIR', 'FAIR', 'WHEATISH', 'WHEATISH_MEDIUM', 'WHEATISH_BROWN', 'DARK']);
export const religiousnessEnum = pgEnum('religiousness_enum', ['VERY_RELIGIOUS', 'RELIGIOUS', 'MODERATE', 'PRACTICING', 'AVERAGE', 'REVERT']);
export const prayEnum = pgEnum('pray_enum', ['ALWAYS', 'SOMETIMES', 'JUMUAH_ONLY', 'RARELY']);
export const dietEnum = pgEnum('diet_enum', ['STRICTLY_HALAL', 'HALAL_PREFERRED', 'VEGETARIAN', 'ANY']);
export const smokeDrinkEnum = pgEnum('smoke_drink_enum', ['NO', 'OCCASIONALLY', 'SOMETIMES', 'YES']);
export const residencyEnum = pgEnum('residency_enum', [
  'CITIZEN',
  'PERMANENT_RESIDENT',
  'WORK_PERMIT',
  'STUDENT_VISA',
  'BUSINESS_VISA',
  'MULTIPLE_VISA',
  'TEMPORARY_VISA',
  'OTHERS',
]);
export const proposalStatusEnum = pgEnum('proposal_status_enum', ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED']);
export const requestStatusEnum = pgEnum('request_status_enum', ['PENDING', 'APPROVED', 'REJECTED']);
export const kycDocTypeEnum = pgEnum('kyc_doc_type', ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'DEGREE_CERTIFICATE']);
export const kycStatusEnum = pgEnum('kyc_status_enum', ['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED']);
export const subscriptionStatusEnum = pgEnum('subscription_status_enum', ['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']);
export const paymentGatewayEnum = pgEnum('payment_gateway_enum', ['STRIPE', 'PAYPAL']);
export const gatewayModeEnum = pgEnum('gateway_mode_enum', ['TEST', 'LIVE']);
export const paymentStatusEnum = pgEnum('payment_status_enum', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);
export const paymentTypeEnum = pgEnum('payment_type_enum', ['MEMBERSHIP_SUBSCRIPTION', 'WALLET_TOPUP']);
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type_enum', [
  'PACKAGE_ALLOWANCE',
  'CREDIT_PURCHASE',
  'CONTACT_UNLOCK_DEBIT',
  'ADMIN_ADJUSTMENT',
  'REFUND_REVERSAL',
]);

// ============================================================================
// 1. USERS TABLE
// ============================================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('MEMBER').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  inviteToken: varchar('invite_token', { length: 255 }),
  inviteExpiresAt: timestamp('invite_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 2. PACKAGES (SUBSCRIPTION DEFINITIONS)
// ============================================================================
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  durationMonths: integer('duration_months').notNull(),
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
  contactCredits: integer('contact_credits').notNull(),
  dailyProfileViewLimit: integer('daily_profile_view_limit').notNull(),
  featuresJson: jsonb('features_json').default([]).notNull(),
  badgeTitle: varchar('badge_title', { length: 50 }).default('Member'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 3. USER SUBSCRIPTIONS
// ============================================================================
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  packageId: integer('package_id').references(() => packages.id).notNull(),
  status: subscriptionStatusEnum('status').default('ACTIVE').notNull(),
  pricePaidUsd: numeric('price_paid_usd', { precision: 10, scale: 2 }).notNull(),
  contactCreditsRemaining: integer('contact_credits_remaining').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  paymentReference: varchar('payment_reference', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_active_user_subscription').on(table.userId).where(sql`${table.status} = 'ACTIVE'`),
]);

// ============================================================================
// 4. PROFILES (85+ FIELD BIODATA)
// ============================================================================
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
    profileId: varchar('profile_id', { length: 15 }).notNull().unique(), // e.g. '2026044925'
    
    // Creation meta
    createdBy: varchar('created_by', { length: 50 }).default('self').notNull(),
    createdFor: varchar('created_for', { length: 50 }).default('self').notNull(),
    lookingFor: genderEnum('looking_for').notNull(),
    
    // Personal & Names
    fullName: varchar('full_name', { length: 120 }).notNull(),
    nickName: varchar('nick_name', { length: 60 }),
    gender: genderEnum('gender').notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    age: integer('age').notNull(),
    maritalStatus: maritalStatusEnum('marital_status').default('NEVER_MARRIED').notNull(),
    
    // Family & Children
    haveChildren: varchar('have_children', { length: 10 }).default('No'),
    childLivingStatus: varchar('child_living_status', { length: 50 }).default('No Child'),
    familyValues: varchar('family_values', { length: 50 }).default('Religious'),
    fatherStatus: varchar('father_status', { length: 60 }).default('Employed'),
    motherStatus: varchar('mother_status', { length: 60 }).default('Homemaker'),
    brothersCount: varchar('brothers_count', { length: 10 }).default('0'),
    sistersCount: varchar('sisters_count', { length: 10 }).default('0'),
    siblingPosition: varchar('sibling_position', { length: 20 }).default('1'),
    
    // Physical & Health
    heightFeetInches: varchar('height_feet_inches', { length: 15 }).notNull(),
    heightCm: integer('height_cm').notNull(),
    weightKg: integer('weight_kg'),
    bodyType: bodyTypeEnum('body_type').default('AVERAGE'),
    complexion: complexionEnum('complexion').default('FAIR'),
    eyesColor: varchar('eyes_color', { length: 30 }).default('Black'),
    hairColor: varchar('hair_color', { length: 30 }).default('Black'),
    bloodGroup: varchar('blood_group', { length: 10 }),
    disability: varchar('disability', { length: 80 }).default('None'),
    eyeWear: varchar('eye_wear', { length: 30 }).default('None'),
    
    // Islamic Practice
    religion: varchar('religion', { length: 30 }).default('Islam').notNull(),
    sectMazhab: varchar('sect_mazhab', { length: 50 }).default('Sunni / Hanafi'),
    religiousness: religiousnessEnum('religiousness').default('RELIGIOUS'),
    prayFrequency: prayEnum('pray_frequency').default('ALWAYS'),
    halalDiet: dietEnum('halal_diet').default('STRICTLY_HALAL'),
    smoke: smokeDrinkEnum('smoke').default('NO'),
    drink: smokeDrinkEnum('drink').default('NO'),
    wearsHijabOrBeard: boolean('wears_hijab_or_beard').default(false),
    motherTongue: varchar('mother_tongue', { length: 50 }).default('English').notNull(),
    
    // Education & Career
    educationLevel: varchar('education_level', { length: 80 }).notNull(),
    institutionName: varchar('institution_name', { length: 150 }),
    fieldOfStudy: varchar('field_of_study', { length: 100 }),
    profession: varchar('profession', { length: 80 }).notNull(),
    designation: varchar('designation', { length: 100 }),
    employerName: varchar('employer_name', { length: 150 }),
    experienceYears: varchar('experience_years', { length: 20 }),
    annualIncome: varchar('annual_income', { length: 50 }),
    
    // Location & US Residency
    nationality: varchar('nationality', { length: 80 }).default('United States').notNull(),
    countryLivingIn: varchar('country_living_in', { length: 80 }).default('United States (USA)').notNull(),
    stateProvince: varchar('state_province', { length: 80 }).notNull(),
    city: varchar('city', { length: 80 }).notNull(),
    zipCode: varchar('zip_code', { length: 30 }).notNull(),
    residingStatus: residencyEnum('residing_status').default('CITIZEN').notNull(),
    addressLine: text('address_line'),
    
    // Wali / Guardian (Halal Obligation)
    guardianName: varchar('guardian_name', { length: 120 }).notNull(),
    guardianRelation: varchar('guardian_relation', { length: 60 }).notNull(),
    guardianPhoneCountryCode: varchar('guardian_phone_country_code', { length: 10 }).default('+1'),
    guardianPhone: varchar('guardian_phone', { length: 30 }).notNull(),
    guardianVerified: boolean('guardian_verified').default(false),
    
    // Narrative & Modesty
    aboutMe: text('about_me').notNull(),
    whatIAmLookingFor: text('what_i_am_looking_for').notNull(),
    hobbiesInterests: text('hobbies_interests'),
    photoPrivacy: varchar('photo_privacy', { length: 30 }).default('PUBLIC').notNull(), // PUBLIC, BLURRED_PURDAH, HIDDEN
    completionPercentage: integer('completion_percentage').default(20).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    kycStatus: kycStatusEnum('kyc_status').default('NOT_SUBMITTED').notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    coverPhotoUrl: text('cover_photo_url'),
    cvUrl: text('cv_url'),
    
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_profiles_search').on(table.gender, table.countryLivingIn, table.stateProvince, table.age),
    index('idx_profiles_profession').on(table.profession),
    index('idx_profiles_residing_status').on(table.residingStatus),
    index('idx_profiles_marital_status').on(table.maritalStatus),
    index('idx_profiles_approved_featured').on(table.isApproved, table.isFeatured),
  ]
);

// ============================================================================
// 5. PARTNER PREFERENCES
// ============================================================================
export const partnerPreferences = pgTable('partner_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull().unique(),
  ageMin: integer('age_min').default(18).notNull(),
  ageMax: integer('age_max').default(50).notNull(),
  heightMinCm: integer('height_min_cm').default(120),
  heightMaxCm: integer('height_max_cm').default(220),
  maritalStatus: varchar('marital_status', { length: 60 }).default("Doesn't Matter"),
  childrenAcceptable: varchar('children_acceptable', { length: 30 }).default("Doesn't Matter"),
  educationMin: varchar('education_min', { length: 80 }).default("Doesn't Matter"),
  allowedProfessions: text('allowed_professions').default("Doesn't Matter"),
  preferredCountry: varchar('preferred_country', { length: 80 }).default('United States (USA)'),
  preferredState: varchar('preferred_state', { length: 80 }).default("Doesn't Matter"),
  preferredResidency: residencyEnum('preferred_residency'),
  religiousness: religiousnessEnum('religiousness'),
  diet: dietEnum('diet'),
  smoke: smokeDrinkEnum('smoke').default('NO'),
  drink: smokeDrinkEnum('drink').default('NO'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 6. USER PHOTOS (IMAGE MANAGEMENT & PURDAH MODESTY)
// ============================================================================
export const userPhotos = pgTable('user_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  urlFull: varchar('url_full', { length: 255 }).notNull(),
  urlThumb: varchar('url_thumb', { length: 255 }).notNull(),
  urlBlur: varchar('url_blur', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  isApproved: boolean('is_approved').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 7. KYC VERIFICATIONS (PASSPORT / NID / DEGREE)
// ============================================================================
export const kycVerifications = pgTable('kyc_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  docType: kycDocTypeEnum('doc_type').notNull(),
  docNumber: varchar('doc_number', { length: 80 }).notNull(),
  docFilePath: varchar('doc_file_path', { length: 255 }).notNull(),
  status: kycStatusEnum('status').default('PENDING').notNull(),
  moderatorNotes: text('moderator_notes'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 8. PROPOSALS ("EXPRESS INTEREST" PIPELINE)
// ============================================================================
export const proposals = pgTable(
  'proposals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    status: proposalStatusEnum('status').default('PENDING').notNull(),
    initialMessage: text('initial_message'),
    rejectionReason: text('rejection_reason'),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_proposals_receiver').on(table.receiverId, table.status),
    index('idx_proposals_sender').on(table.senderId, table.status),
    uniqueIndex('unique_active_proposal').on(table.senderId, table.receiverId),
  ]
);

// ============================================================================
// 9. CONTACT & PHOTO UNLOCK REQUESTS
// ============================================================================
export const contactUnlockRequests = pgTable(
  'contact_unlock_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    requesterId: uuid('requester_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    targetProfileId: uuid('target_profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    status: requestStatusEnum('status').default('PENDING').notNull(),
    creditDeducted: integer('credit_deducted').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_contact_unlock').on(table.requesterId, table.targetProfileId),
  ]
);

export const photoAccessRequests = pgTable(
  'photo_access_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    requesterId: uuid('requester_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    targetProfileId: uuid('target_profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    status: requestStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_photo_access').on(table.requesterId, table.targetProfileId),
  ]
);

// ============================================================================
// 10. SOCIAL INTERACTIONS & BOOKMARKS
// ============================================================================
export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    bookmarkedProfileId: uuid('bookmarked_profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_bookmark').on(table.userId, table.bookmarkedProfileId),
  ]
);

export const profileViews = pgTable(
  'profile_views',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    viewerId: uuid('viewer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    viewedProfileId: uuid('viewed_profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_profile_views_viewed').on(table.viewedProfileId, table.viewedAt),
  ]
);

// ============================================================================
// 11. MESSAGING & CHAT LOUNGE
// ============================================================================
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userOne: uuid('user_one').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    userTwo: uuid('user_two').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_conversation_pair').on(table.userOne, table.userTwo),
  ]
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
    senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_messages_conversation').on(table.conversationId, table.createdAt),
  ]
);

// ============================================================================
// 12. CMS CONTENT (SUCCESS STORIES)
// ============================================================================
export const successStories = pgTable('success_stories', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  coupleNames: varchar('couple_names', { length: 150 }).notNull(),
  weddingDate: date('wedding_date'),
  imageUrl: varchar('image_url', { length: 255 }),
  storyBody: text('story_body').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 13. AUDIT & MODERATION
// ============================================================================
export const moderationReports = pgTable('moderation_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportedProfileId: uuid('reported_profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  details: text('details'),
  status: varchar('status', { length: 30 }).default('OPEN').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 80 }).notNull(),
  entityName: varchar('entity_name', { length: 80 }).notNull(),
  entityId: varchar('entity_id', { length: 80 }),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 14. RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  subscriptions: many(userSubscriptions),
  sentProposals: many(proposals, { relationName: 'sentProposals' }),
  receivedProposals: many(proposals, { relationName: 'receivedProposals' }),
  bookmarks: many(bookmarks),
  views: many(profileViews),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  partnerPreferences: one(partnerPreferences, { fields: [profiles.id], references: [partnerPreferences.profileId] }),
  photos: many(userPhotos),
  kycVerifications: many(kycVerifications),
  bookmarks: many(bookmarks),
  views: many(profileViews),
}));

export const partnerPreferencesRelations = relations(partnerPreferences, ({ one }) => ({
  profile: one(profiles, { fields: [partnerPreferences.profileId], references: [profiles.id] }),
}));

export const userPhotosRelations = relations(userPhotos, ({ one }) => ({
  profile: one(profiles, { fields: [userPhotos.profileId], references: [profiles.id] }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  sender: one(users, { fields: [proposals.senderId], references: [users.id], relationName: 'sentProposals' }),
  receiver: one(users, { fields: [proposals.receiverId], references: [users.id], relationName: 'receivedProposals' }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  firstUser: one(users, { fields: [conversations.userOne], references: [users.id] }),
  secondUser: one(users, { fields: [conversations.userTwo], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// ============================================================================
// 15. MEMBER RESUMES & MATRIMONIAL CV STUDIO
// ============================================================================
export const memberResumes = pgTable('member_resumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  resumeType: varchar('resume_type', { length: 30 }).notNull(), // 'UPLOADED_FILE' | 'RICH_BUILDER'
  fileName: varchar('file_name', { length: 255 }),
  fileUrl: text('file_url'),
  fileSizeBytes: integer('file_size_bytes'),
  documentContent: text('document_content'), // Rich HTML or formatted text for Word-style CV
  title: varchar('title', { length: 255 }).default('Matrimonial Biodata & CV').notNull(),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const memberResumesRelations = relations(memberResumes, ({ one }) => ({
  user: one(users, { fields: [memberResumes.userId], references: [users.id] }),
}));

// ============================================================================
// 16. PROFILE & REGISTRATION REQUIREMENTS CONFIG
// ============================================================================
export const profileRequirementsConfig = pgTable('profile_requirements_config', {
  id: varchar('id', { length: 64 }).primaryKey(),
  fieldKey: varchar('field_key', { length: 64 }).notNull().unique(),
  fieldLabel: varchar('field_label', { length: 128 }).notNull(),
  category: varchar('category', { length: 32 }).notNull(), // 'PERSONAL', 'RELIGIOUS', 'EDUCATION', 'FAMILY', 'WALI', 'CV'
  isRequiredForRegistration: boolean('is_required_for_registration').default(false).notNull(),
  isRequiredForProfile: boolean('is_required_for_profile').default(true).notNull(),
  completionWeightPercent: integer('completion_weight_percent').default(5).notNull(),
  genderApplicable: varchar('gender_applicable', { length: 16 }).default('ALL').notNull(), // 'ALL', 'MALE', 'FEMALE'
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 17. FORM BUILDER DYNAMIC CONFIGS (LOGIN, REGISTER, PROFILE, CV)
// ============================================================================
export const formBuilderConfigs = pgTable('form_builder_configs', {
  formId: varchar('form_id', { length: 64 }).primaryKey(), // 'login', 'register', 'profile', 'cv'
  title: varchar('title', { length: 128 }).notNull(),
  theme: varchar('theme', { length: 64 }).default('emerald').notNull(), // 'emerald', 'gold', 'minimal', 'dark'
  borderRadius: varchar('border_radius', { length: 32 }).default('12px').notNull(),
  buttonText: varchar('button_text', { length: 128 }).notNull(),
  fieldsJson: jsonb('fields_json').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 18. PAYMENT GATEWAY CONFIGURATIONS VAULT
// ============================================================================
export const paymentGatewaysConfig = pgTable('payment_gateways_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  gateway: paymentGatewayEnum('gateway').notNull().unique(), // 'STRIPE' | 'PAYPAL'
  mode: gatewayModeEnum('mode').default('TEST').notNull(),    // 'TEST' | 'LIVE'
  isActive: boolean('is_active').default(false).notNull(),
  publicKey: varchar('public_key', { length: 255 }).notNull(),
  encryptedSecretKey: text('encrypted_secret_key').notNull(),
  encryptedWebhookSecret: text('encrypted_webhook_secret').notNull(),
  webhookId: varchar('webhook_id', { length: 120 }), // PayPal Webhook ID
  settingsJson: jsonb('settings_json').default({}).notNull(),
  lastTestedAt: timestamp('last_tested_at', { withTimezone: true }),
  testStatus: varchar('test_status', { length: 30 }).default('UNTESTED'), // 'SUCCESS' | 'FAILED' | 'UNTESTED'
  lastTestMessage: text('last_test_message'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 19. PAYMENT TRANSACTIONS LEDGER
// ============================================================================
export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    gateway: paymentGatewayEnum('gateway').notNull(),
    gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }).notNull().unique(),
    gatewayEventId: varchar('gateway_event_id', { length: 255 }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    feeAmount: numeric('fee_amount', { precision: 10, scale: 2 }).default('0.00'),
    netAmount: numeric('net_amount', { precision: 10, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    paymentType: paymentTypeEnum('payment_type').notNull(), // 'MEMBERSHIP_SUBSCRIPTION' | 'WALLET_TOPUP'
    packageId: integer('package_id').references(() => packages.id, { onDelete: 'set null' }),
    creditsPurchased: integer('credits_purchased').default(0).notNull(),
    rawPayload: jsonb('raw_payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_transactions_user').on(table.userId, table.createdAt),
    index('idx_transactions_status').on(table.status, table.createdAt),
  ]
);

// ============================================================================
// 20. WALLET DOUBLE-ENTRY LEDGER (CONTACT UNLOCK CREDITS)
// ============================================================================
export const walletLedger = pgTable(
  'wallet_ledger',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    transactionType: walletTransactionTypeEnum('transaction_type').notNull(),
    amount: integer('amount').notNull(), // Positive for additions, negative for deductions
    referenceId: uuid('reference_id'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_wallet_ledger_user').on(table.userId, table.createdAt),
  ]
);

// ============================================================================
// 21. PROCESSED WEBHOOK EVENTS (IDEMPOTENCY LOG)
// ============================================================================
export const processedWebhookEvents = pgTable('processed_webhook_events', {
  eventId: varchar('event_id', { length: 255 }).primaryKey(),
  gateway: paymentGatewayEnum('gateway').notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 22. CONTACT & WEDDING SERVICE INQUIRIES (DURABLE INBOX)
// ============================================================================
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 50 }).default('CONTACT').notNull(), // 'CONTACT' | 'WEDDING_SERVICE' | 'GENERAL'
  fullName: varchar('full_name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  cityState: varchar('city_state', { length: 150 }),
  serviceType: varchar('service_type', { length: 100 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 30 }).default('NEW').notNull(), // 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 23. CMS ARTICLES & ADVICE HUB
// ============================================================================
export const cmsArticles = pgTable('cms_articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  author: varchar('author', { length: 120 }).default('Editorial Board').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  readsCount: integer('reads_count').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// 24. CMS PAGE SECTIONS & EDITABLE SITE CONTENT
// ============================================================================
export const cmsPageSections = pgTable(
  'cms_page_sections',
  {
    id: serial('id').primaryKey(),
    pageKey: varchar('page_key', { length: 80 }).notNull(), // 'home', 'services', 'how-it-works', 'why-us', 'contact', 'faq', 'seo'
    sectionKey: varchar('section_key', { length: 80 }).notNull(), // 'hero', 'faq_list', 'contact_details', 'seo_meta', etc.
    title: varchar('title', { length: 255 }),
    contentJson: jsonb('content_json').default({}).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_page_section').on(table.pageKey, table.sectionKey),
  ]
);



