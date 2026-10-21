import { db } from './index';
import {
  users,
  profiles,
  userSubscriptions,
  packages,
  memberResumes,
  profileRequirementsConfig,
  formBuilderConfigs,
  paymentGatewaysConfig,
  paymentTransactions,
  walletLedger,
  contactSubmissions,
  cmsArticles,
  successStories,
  cmsPageSections,
  auditLogs,
} from './schema';
import { eq, desc, and, sql, ilike, gte, lte, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import domainSeed from '../../seed-data/muslimbibah_domain_seed.json';
import { decryptCredential, encryptCredential } from '@/lib/payments/credentialEncryption';
import { AuthenticProfile } from './repository';

export interface AdminMemberRecord {
  userId: string;
  email: string;
  phoneNumber: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR' | 'MEMBER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  profile?: {
    id?: string;
    profileId: string;
    fullName: string;
    nickName?: string | null;
    gender: 'MALE' | 'FEMALE';
    dateOfBirth: string;
    age: number;
    maritalStatus: string;
    haveChildren: string;
    childLivingStatus: string;
    familyValues: string;
    fatherStatus: string;
    motherStatus: string;
    brothersCount: string;
    sistersCount: string;
    siblingPosition: string;
    heightFeetInches: string;
    heightCm: number;
    weightKg?: number | null;
    bodyType?: string | null;
    complexion?: string | null;
    religion: string;
    sectMazhab: string;
    religiousness: string;
    prayFrequency: string;
    halalDiet: string;
    smoke: string;
    drink: string;
    wearsHijabOrBeard: boolean;
    educationLevel: string;
    profession: string;
    annualIncome?: string | null;
    countryLivingIn: string;
    stateProvince: string;
    city: string;
    residingStatus: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    aboutMe: string;
    whatIAmLookingFor: string;
    kycStatus: string;
    photoPrivacy: string;
    completionPercentage: number;
    isApproved: boolean;
    isFeatured: boolean;
    coverPhotoUrl?: string | null;
    cvUrl?: string | null;
  };
  subscription?: {
    packageId: number;
    packageName: string;
    contactCreditsRemaining: number;
    status: string;
  };
}

/**
 * Retrieves all members with their full profiles and subscriptions from PostgreSQL
 */
export async function getAllMembersForAdmin(): Promise<AdminMemberRecord[]> {
  try {
    const dbUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const dbProfiles = await db.select().from(profiles);
    const dbSubs = await db
      .select({
        sub: userSubscriptions,
        pkg: packages,
      })
      .from(userSubscriptions)
      .leftJoin(packages, eq(userSubscriptions.packageId, packages.id));

    const profileMap = new Map(dbProfiles.map((p) => [p.userId, p]));
    const now = new Date();
    const subMap = new Map<string, (typeof dbSubs)[number]>();
    for (const row of dbSubs) {
      if (row.sub.status === 'ACTIVE' && row.sub.expiresAt > now) {
        const current = subMap.get(row.sub.userId);
        if (!current || row.sub.startedAt > current.sub.startedAt) subMap.set(row.sub.userId, row);
      }
    }

    return dbUsers.map((u) => {
      const p = profileMap.get(u.id);
      const s = subMap.get(u.id);

      return {
        userId: u.id,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role as AdminMemberRecord['role'],
        isActive: u.isActive,
        isVerified: u.isVerified,
        createdAt: u.createdAt.toISOString(),
        profile: p
          ? {
              id: p.id,
              profileId: p.profileId,
              fullName: p.fullName,
              nickName: p.nickName,
              gender: p.gender as 'MALE' | 'FEMALE',
              dateOfBirth: p.dateOfBirth,
              age: p.age,
              maritalStatus: p.maritalStatus,
              haveChildren: p.haveChildren || 'No',
              childLivingStatus: p.childLivingStatus || 'No Child',
              familyValues: p.familyValues || 'Religious',
              fatherStatus: p.fatherStatus || 'Employed',
              motherStatus: p.motherStatus || 'Homemaker',
              brothersCount: p.brothersCount || '0',
              sistersCount: p.sistersCount || '0',
              siblingPosition: p.siblingPosition || '1',
              heightFeetInches: p.heightFeetInches,
              heightCm: p.heightCm,
              weightKg: p.weightKg,
              bodyType: p.bodyType,
              complexion: p.complexion,
              religion: p.religion,
              sectMazhab: p.sectMazhab || 'Sunni / Hanafi',
              religiousness: p.religiousness || 'RELIGIOUS',
              prayFrequency: p.prayFrequency || 'ALWAYS',
              halalDiet: p.halalDiet || 'STRICTLY_HALAL',
              smoke: p.smoke || 'NO',
              drink: p.drink || 'NO',
              wearsHijabOrBeard: p.wearsHijabOrBeard ?? false,
              educationLevel: p.educationLevel,
              profession: p.profession,
              annualIncome: p.annualIncome,
              countryLivingIn: p.countryLivingIn,
              stateProvince: p.stateProvince,
              city: p.city,
              residingStatus: p.residingStatus,
              guardianName: p.guardianName,
              guardianRelation: p.guardianRelation,
              guardianPhone: p.guardianPhone,
              aboutMe: p.aboutMe,
              whatIAmLookingFor: p.whatIAmLookingFor,
              kycStatus: p.kycStatus,
              photoPrivacy: p.photoPrivacy,
              completionPercentage: p.completionPercentage,
              isApproved: p.isApproved,
              isFeatured: p.isFeatured,
              coverPhotoUrl: p.coverPhotoUrl,
              cvUrl: p.cvUrl,
            }
          : undefined,
        subscription: s?.pkg
          ? {
              packageId: s.pkg.id,
              packageName: s.pkg.name,
              contactCreditsRemaining: s.sub.contactCreditsRemaining,
              status: s.sub.status,
            }
          : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching members from DB:', error);
    throw error;
  }
}

/**
 * Retrieves a single member's profile for their dashboard
 */
export async function getMemberProfileByUserId(userId: string) {
  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || null;
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return null;
  }
}

/**
 * Retrieves all packages directly from PostgreSQL
 */
export async function getAllPackagesFromDb() {
  try {
    const rows = await db.select().from(packages).orderBy(packages.priceUsd);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      duration_months: r.durationMonths,
      durationMonths: r.durationMonths,
      price_usd: parseFloat(r.priceUsd),
      priceUsd: parseFloat(r.priceUsd),
      contact_credits: r.contactCredits,
      contactCredits: r.contactCredits,
      daily_profile_view_limit: r.dailyProfileViewLimit,
      dailyProfileViewLimit: r.dailyProfileViewLimit,
      badge_title: r.badgeTitle || 'Member',
      badgeTitle: r.badgeTitle || 'Member',
      features: Array.isArray(r.featuresJson) ? (r.featuresJson as string[]) : [],
      featuresJson: Array.isArray(r.featuresJson) ? (r.featuresJson as string[]) : [],
      isActive: r.isActive,
    }));
  } catch (error) {
    console.error('Error fetching packages from DB:', error);
    throw error;
  }
}

/**
 * Creates a new package in PostgreSQL
 */
export async function createPackageInDb(data: {
  name: string;
  durationMonths: number;
  priceUsd: number;
  contactCredits: number;
  dailyProfileViewLimit: number;
  featuresJson: string[];
  badgeTitle?: string;
  isActive?: boolean;
}) {
  try {
    const [created] = await db
      .insert(packages)
      .values({
        name: data.name,
        durationMonths: data.durationMonths,
        priceUsd: data.priceUsd.toFixed(2),
        contactCredits: data.contactCredits,
        dailyProfileViewLimit: data.dailyProfileViewLimit,
        featuresJson: data.featuresJson,
        badgeTitle: data.badgeTitle || 'Member',
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Error creating package in DB:', error);
    throw error;
  }
}

/**
 * Updates an existing package in PostgreSQL
 */
export async function updatePackageInDb(
  id: number,
  data: {
    name?: string;
    durationMonths?: number;
    priceUsd?: number;
    contactCredits?: number;
    dailyProfileViewLimit?: number;
    featuresJson?: string[];
    badgeTitle?: string;
    isActive?: boolean;
  }
) {
  try {
    const updateValues: Record<string, any> = {};
    if (data.name !== undefined) updateValues.name = data.name;
    if (data.durationMonths !== undefined) updateValues.durationMonths = data.durationMonths;
    if (data.priceUsd !== undefined) updateValues.priceUsd = data.priceUsd.toFixed(2);
    if (data.contactCredits !== undefined) updateValues.contactCredits = data.contactCredits;
    if (data.dailyProfileViewLimit !== undefined) updateValues.dailyProfileViewLimit = data.dailyProfileViewLimit;
    if (data.featuresJson !== undefined) updateValues.featuresJson = data.featuresJson;
    if (data.badgeTitle !== undefined) updateValues.badgeTitle = data.badgeTitle;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;

    const [updated] = await db
      .update(packages)
      .set(updateValues)
      .where(eq(packages.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Error updating package in DB:', error);
    throw error;
  }
}

/**
 * Toggles active state of a package
 */
export async function togglePackageActiveInDb(id: number, isActive: boolean) {
  try {
    const [updated] = await db
      .update(packages)
      .set({ isActive })
      .where(eq(packages.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Error toggling package active status:', error);
    throw error;
  }
}

/**
 * Deletes a package from PostgreSQL
 */
export async function deletePackageInDb(id: number) {
  try {
    const [referencedSubscription] = await db.select({ id: userSubscriptions.id })
      .from(userSubscriptions).where(eq(userSubscriptions.packageId, id)).limit(1);
    if (referencedSubscription) {
      throw new Error('This package is part of membership history and cannot be deleted. Deactivate it instead.');
    }
    await db.delete(packages).where(eq(packages.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting package from DB:', error);
    throw error;
  }
}

// ============================================================================
// PROFILE & REGISTRATION REQUIREMENTS CONFIG
// ============================================================================

export interface ProfileRequirementRecord {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  category: string;
  isRequiredForRegistration: boolean;
  isRequiredForProfile: boolean;
  completionWeightPercent: number;
  genderApplicable: string;
  isActive: boolean;
  updatedAt: Date;
}

export async function getProfileRequirementsFromDb(): Promise<ProfileRequirementRecord[]> {
  try {
    const list = await db
      .select()
      .from(profileRequirementsConfig)
      .orderBy(desc(profileRequirementsConfig.completionWeightPercent));
    return list;
  } catch (error) {
    console.error('Error fetching profile requirements from DB:', error);
    return [];
  }
}

export async function updateProfileRequirementInDb(
  id: string,
  updates: Partial<ProfileRequirementRecord>
) {
  try {
    const updateObj: Record<string, any> = { updatedAt: new Date() };
    if (updates.fieldLabel !== undefined) updateObj.fieldLabel = updates.fieldLabel;
    if (updates.isRequiredForRegistration !== undefined)
      updateObj.isRequiredForRegistration = updates.isRequiredForRegistration;
    if (updates.isRequiredForProfile !== undefined)
      updateObj.isRequiredForProfile = updates.isRequiredForProfile;
    if (updates.completionWeightPercent !== undefined)
      updateObj.completionWeightPercent = updates.completionWeightPercent;
    if (updates.genderApplicable !== undefined)
      updateObj.genderApplicable = updates.genderApplicable;
    if (updates.isActive !== undefined) updateObj.isActive = updates.isActive;

    const [updated] = await db
      .update(profileRequirementsConfig)
      .set(updateObj)
      .where(eq(profileRequirementsConfig.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Error updating profile requirement in DB:', error);
    throw error;
  }
}

// ============================================================================
// MATRIMONIAL CV & RESUME STUDIO QUERIES
// ============================================================================

export interface MemberResumeRecord {
  id: string;
  userId: string;
  resumeType: string;
  fileName?: string | null;
  fileUrl?: string | null;
  fileSizeBytes?: number | null;
  documentContent?: string | null;
  title: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getMemberResumesFromDb(userId: string): Promise<MemberResumeRecord[]> {
  try {
    const list = await db
      .select()
      .from(memberResumes)
      .where(eq(memberResumes.userId, userId))
      .orderBy(desc(memberResumes.createdAt));
    return list;
  } catch (error) {
    console.error('Error fetching member resumes from DB:', error);
    return [];
  }
}

export async function saveMemberResumeInDb(data: {
  userId: string;
  resumeType: 'UPLOADED_FILE' | 'RICH_BUILDER';
  title: string;
  fileName?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  documentContent?: string;
}) {
  try {
    // If saving as primary, ensure existing resumes don't clash
    await db
      .update(memberResumes)
      .set({ isPrimary: false })
      .where(eq(memberResumes.userId, data.userId));

    const [resume] = await db
      .insert(memberResumes)
      .values({
        userId: data.userId,
        resumeType: data.resumeType,
        title: data.title,
        fileName: data.fileName || null,
        fileUrl: data.fileUrl || null,
        fileSizeBytes: data.fileSizeBytes || null,
        documentContent: data.documentContent || null,
        isPrimary: true,
      })
      .returning();

    // Also link resume URL / content to profile
    if (data.fileUrl) {
      await db
        .update(profiles)
        .set({ cvUrl: data.fileUrl, updatedAt: new Date() })
        .where(eq(profiles.userId, data.userId));
    }

    return resume;
  } catch (error) {
    console.error('Error saving member resume in DB:', error);
    throw error;
  }
}

export async function deleteMemberResumeInDb(resumeId: string, userId: string) {
  try {
    await db
      .delete(memberResumes)
      .where(and(eq(memberResumes.id, resumeId), eq(memberResumes.userId, userId)));
    return true;
  } catch (error) {
    console.error('Error deleting member resume from DB:', error);
    throw error;
  }
}

// ============================================================================
// PROFILE UPDATE & MEDIA QUERIES
// ============================================================================

export async function updateMemberProfileInDb(
  userId: string,
  data: Partial<typeof profiles.$inferInsert>
) {
  try {
    const [updated] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Error updating profile in DB:', error);
    throw error;
  }
}

// ============================================================================
// ADMIN MEMBER PROVISIONING
// ============================================================================

export interface ProvisionMemberInput {
  email: string;
  password?: string;
  phoneNumber: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  maritalStatus?: 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'OTHER';
  countryLivingIn?: string;
  stateProvince?: string;
  city?: string;
  profession?: string;
  educationLevel?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  packageId: number;
  sendInviteLink?: boolean;
}

export async function provisionMemberInDb(input: ProvisionMemberInput) {
  try {
    const email = input.email.trim().toLowerCase();
    const phoneDigits = input.phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) throw new Error('Enter a valid phone number.');
    const phoneNumber = `+${phoneDigits}`;

    // Generate secure single-use 30-day invite setup token
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30); // 30-day expiry window

    const rawPassword = input.password && !input.sendInviteLink
      ? input.password
      : `Tmp!${crypto.randomBytes(16).toString('hex')}`;
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const birthDate = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth) || Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== input.dateOfBirth || birthDate >= new Date()) {
      throw new Error('Enter a valid date of birth.');
    }
    const today = new Date();
    const age = today.getUTCFullYear() - birthDate.getUTCFullYear() -
      (today.getUTCMonth() < birthDate.getUTCMonth() || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate()) ? 1 : 0);
    if (age < 18) throw new Error('Members must be at least 18 years old.');

    const created = await db.transaction(async (tx) => {
      const duplicate = await tx.execute(sql`select id from users where lower(email) = ${email} or regexp_replace(phone_number, '[^0-9]', '', 'g') = ${phoneDigits} limit 1`);
      if (duplicate.length) throw new Error('An account with this email or phone number already exists.');
      const [matchedPkg] = await tx.select().from(packages).where(and(eq(packages.id, input.packageId), eq(packages.isActive, true))).limit(1);
      if (!matchedPkg) throw new Error('The selected package is unavailable. Refresh packages and try again.');
      const [newUser] = await tx.insert(users).values({
        email,
        phoneNumber,
        passwordHash,
        inviteToken,
        inviteExpiresAt,
        role: 'MEMBER',
        isActive: true,
        isVerified: false,
      }).returning();
      if (!newUser) throw new Error('The member account could not be created.');

      const profileId = `MB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
      const [newProfile] = await tx.insert(profiles).values({
        userId: newUser.id,
        profileId,
        createdBy: 'Admin Direct Provisioning',
        createdFor: 'self',
        lookingFor: input.gender === 'MALE' ? 'FEMALE' : 'MALE',
        fullName: input.fullName.trim(),
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        age,
        heightFeetInches: 'Not provided',
        heightCm: 0,
        maritalStatus: input.maritalStatus || 'OTHER',
        haveChildren: null,
        childLivingStatus: null,
        familyValues: null,
        fatherStatus: null,
        motherStatus: null,
        brothersCount: null,
        sistersCount: null,
        siblingPosition: null,
        bodyType: null,
        complexion: null,
        eyesColor: null,
        hairColor: null,
        disability: null,
        eyeWear: null,
        religion: 'Not provided',
        sectMazhab: null,
        religiousness: null,
        prayFrequency: null,
        halalDiet: null,
        smoke: null,
        drink: null,
        wearsHijabOrBeard: null,
        motherTongue: 'Not provided',
        countryLivingIn: input.countryLivingIn || '',
        stateProvince: input.stateProvince || '',
        city: input.city || '',
        zipCode: '',
        educationLevel: input.educationLevel || 'Not provided',
        profession: input.profession || 'Not provided',
        nationality: 'Not provided',
        residingStatus: 'OTHERS',
        guardianPhoneCountryCode: null,
        guardianName: input.guardianName || '',
        guardianRelation: input.guardianRelation || '',
        guardianPhone: input.guardianPhone || '',
        guardianVerified: false,
        aboutMe: '',
        whatIAmLookingFor: '',
        photoPrivacy: 'HIDDEN',
        completionPercentage: 0,
        isApproved: false,
        isFeatured: false,
        kycStatus: 'NOT_SUBMITTED',
      }).returning();
      if (!newProfile) throw new Error('The member profile could not be created.');

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + matchedPkg.durationMonths);
      await tx.insert(userSubscriptions).values({
        userId: newUser.id,
        packageId: matchedPkg.id,
        status: 'ACTIVE',
        pricePaidUsd: '0.00',
        contactCreditsRemaining: matchedPkg.contactCredits,
        expiresAt,
        paymentReference: `ADMIN_GRANT:${newUser.id}`,
      });

      return {
        user: newUser,
        profile: newProfile,
        packageName: matchedPkg.name,
        inviteToken,
        inviteUrl: `/setup-password?token=${inviteToken}`,
      };
    });
    return { success: true as const, ...created };
  } catch (error: any) {
    console.error('Error provisioning member in DB:', error);
    return {
      success: false as const,
      error: error.message || 'Failed to provision member',
    };
  }
}

// ============================================================================
// FORM BUILDER DYNAMIC CONFIG QUERIES
// ============================================================================

export interface FormBuilderField {
  id: string;
  fieldKey: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'date' | 'select' | 'checkbox' | 'textarea' | 'static_header' | 'rich_block';
  required: boolean;
  width?: 'full' | 'half';
  order: number;
  options?: string[];
}

export interface FormBuilderConfigRecord {
  formId: string;
  title: string;
  theme: string;
  borderRadius: string;
  buttonText: string;
  fieldsJson: FormBuilderField[];
  updatedAt: Date;
}

export async function getFormBuilderConfigsFromDb(): Promise<FormBuilderConfigRecord[]> {
  try {
    const list = await db.select().from(formBuilderConfigs);
    return list.map((item) => ({
      ...item,
      fieldsJson: (item.fieldsJson as any) || [],
    }));
  } catch (error) {
    console.error('Error fetching form builder configs from DB:', error);
    return [];
  }
}

export async function getFormBuilderConfigById(formId: string): Promise<FormBuilderConfigRecord | null> {
  try {
    const [config] = await db
      .select()
      .from(formBuilderConfigs)
      .where(eq(formBuilderConfigs.formId, formId));
    if (!config) return null;
    return {
      ...config,
      fieldsJson: (config.fieldsJson as any) || [],
    };
  } catch (error) {
    console.error('Error fetching form builder config by id:', error);
    return null;
  }
}

export async function saveFormBuilderConfigInDb(
  formId: string,
  data: {
    title?: string;
    theme?: string;
    borderRadius?: string;
    buttonText?: string;
    fieldsJson?: FormBuilderField[];
  }
) {
  try {
    const updateObj: Record<string, any> = { updatedAt: new Date() };
    if (data.title !== undefined) updateObj.title = data.title;
    if (data.theme !== undefined) updateObj.theme = data.theme;
    if (data.borderRadius !== undefined) updateObj.borderRadius = data.borderRadius;
    if (data.buttonText !== undefined) updateObj.buttonText = data.buttonText;
    if (data.fieldsJson !== undefined) updateObj.fieldsJson = data.fieldsJson;

    const [updated] = await db
      .insert(formBuilderConfigs)
      .values({
        formId,
        title: data.title || 'Form',
        theme: data.theme || 'emerald',
        borderRadius: data.borderRadius || '12px',
        buttonText: data.buttonText || 'Submit',
        fieldsJson: data.fieldsJson || [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: formBuilderConfigs.formId,
        set: updateObj,
      })
      .returning();

    return {
      ...updated,
      fieldsJson: (updated.fieldsJson as any) || [],
    };
  } catch (error) {
    console.error('Error saving form builder config in DB:', error);
    throw error;
  }
}

export async function assignUserSubscriptionTierInDb(userId: string, packageId: number) {
  try {
    return await db.transaction(async (tx) => {
      const [targetUser] = await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for('update').limit(1);
      if (!targetUser) throw new Error('Member account not found.');
      const [matchedPkg] = await tx.select().from(packages).where(and(eq(packages.id, packageId), eq(packages.isActive, true))).limit(1);
      if (!matchedPkg) throw new Error('The selected package is unavailable.');
      const now = new Date();
      await tx.update(userSubscriptions).set({ status: 'EXPIRED' }).where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, 'ACTIVE')));
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + matchedPkg.durationMonths);
      await tx.insert(userSubscriptions).values({
        userId, packageId: matchedPkg.id, status: 'ACTIVE', pricePaidUsd: '0.00',
        contactCreditsRemaining: matchedPkg.contactCredits, startedAt: now, expiresAt,
        paymentReference: `ADMIN_GRANT:${userId}:${now.getTime()}`,
      });
      return { success: true, packageName: matchedPkg.name };
    });
  } catch (error) {
    console.error('Error assigning user subscription in DB:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database update failed' };
  }
}

// ============================================================================
// PAYMENT GATEWAYS & LEDGER QUERIES
// ============================================================================

export async function getAllGatewayConfigsFromDb() {
  try {
    const rows = await db.select().from(paymentGatewaysConfig);
    return rows.map((r) => {
      const secretKey = r.encryptedSecretKey || '';
      const webhookSecret = r.encryptedWebhookSecret || '';
      const publicKey = r.publicKey || '';

      const isPlaceholder = secretKey.includes('placeholder');
      const maskedSecret = isPlaceholder ? '' : secretKey ? '••••••••' : '';
      const maskedWebhook = webhookSecret.includes('placeholder') ? '' : webhookSecret ? '••••••••' : '';

      return {
        id: r.id,
        gateway: r.gateway,
        mode: r.mode,
        isActive: r.isActive,
        publicKey: publicKey.includes('placeholder') ? '' : publicKey,
        secretKeyMasked: maskedSecret,
        hasSecretKey: Boolean(secretKey && !isPlaceholder),
        webhookSecretMasked: maskedWebhook,
        hasWebhookSecret: Boolean(webhookSecret && !webhookSecret.includes('placeholder')),
        webhookId: r.webhookId || '',
        settingsJson: (r.settingsJson as Record<string, any>) || {},
        lastTestedAt: r.lastTestedAt,
        testStatus: r.testStatus,
        lastTestMessage: r.lastTestMessage,
      };
    });
  } catch (error) {
    console.error('Error fetching admin gateway configs from DB:', error);
    throw error;
  }
}

export async function getGatewayConfigFromDb(gateway: 'STRIPE' | 'PAYPAL') {
  try {
    const [record] = await db
      .select()
      .from(paymentGatewaysConfig)
      .where(eq(paymentGatewaysConfig.gateway, gateway));

    if (!record) return null;

    let secretKey = decryptCredential(record.encryptedSecretKey);
    let publicKey = record.publicKey;
    let webhookSecret = decryptCredential(record.encryptedWebhookSecret);

    if (gateway === 'STRIPE') {
      if ((!secretKey || secretKey.includes('placeholder')) && process.env.STRIPE_SECRET_KEY) {
        secretKey = process.env.STRIPE_SECRET_KEY;
      }
      if ((!publicKey || publicKey.includes('placeholder')) && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      }
      if ((!webhookSecret || webhookSecret.includes('placeholder')) && process.env.STRIPE_WEBHOOK_SECRET) {
        webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      }
    } else if (gateway === 'PAYPAL') {
      if ((!publicKey || publicKey.includes('placeholder')) && process.env.PAYPAL_CLIENT_ID) {
        publicKey = process.env.PAYPAL_CLIENT_ID;
      }
      if ((!secretKey || secretKey.includes('placeholder')) && process.env.PAYPAL_CLIENT_SECRET) {
        secretKey = process.env.PAYPAL_CLIENT_SECRET;
      }
    }

    return {
      gateway: record.gateway,
      mode: record.mode,
      isActive: record.isActive,
      publicKey: publicKey || '',
      secretKey: secretKey || '',
      webhookSecret: webhookSecret || '',
      webhookId: record.webhookId,
      settingsJson: (record.settingsJson as Record<string, any>) || {},
      lastTestedAt: record.lastTestedAt,
      testStatus: record.testStatus,
      lastTestMessage: record.lastTestMessage,
    };
  } catch (error) {
    console.error(`Error retrieving gateway config from DB for ${gateway}:`, error);
    return null;
  }
}

export async function saveGatewayConfigInDb(
  gateway: 'STRIPE' | 'PAYPAL',
  data: {
    mode: 'TEST' | 'LIVE';
    isActive: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret?: string;
    webhookId?: string;
    settingsJson?: Record<string, any>;
  }
) {
  try {
    const [current] = await db.select().from(paymentGatewaysConfig).where(eq(paymentGatewaysConfig.gateway, gateway)).limit(1);
    if (!current) throw new Error(`${gateway} configuration row is missing; run database initialization first.`);
    const currentSecret = decryptCredential(current.encryptedSecretKey);
    const currentWebhookSecret = decryptCredential(current.encryptedWebhookSecret);
    const credentialsChanged = (Boolean(data.secretKey) && data.secretKey !== currentSecret) ||
      (data.publicKey !== current.publicKey) || (data.mode !== current.mode) ||
      (data.webhookSecret !== undefined && data.webhookSecret !== '' && data.webhookSecret !== currentWebhookSecret);
    const hasRequiredKeys = gateway === 'STRIPE'
      ? Boolean(data.secretKey || currentSecret) && Boolean(data.publicKey || current.publicKey) && Boolean(data.webhookSecret || currentWebhookSecret)
      : Boolean(data.secretKey || currentSecret) && Boolean(data.publicKey || current.publicKey);
    const updateData: Record<string, any> = {
      mode: data.mode,
      isActive: data.isActive && !credentialsChanged && hasRequiredKeys && current.testStatus === 'SUCCESS',
      publicKey: data.publicKey,
      testStatus: credentialsChanged ? 'UNTESTED' : current.testStatus,
      lastTestMessage: credentialsChanged ? 'Credentials or mode changed; run a fresh connection test before activation.' : current.lastTestMessage,
      updatedAt: new Date(),
    };

    if (data.secretKey) {
      updateData.encryptedSecretKey = encryptCredential(data.secretKey);
    }
    if (data.webhookSecret) {
      updateData.encryptedWebhookSecret = encryptCredential(data.webhookSecret);
    }
    if (data.webhookId !== undefined) {
      updateData.webhookId = data.webhookId;
    }
    if (data.settingsJson !== undefined) {
      updateData.settingsJson = data.settingsJson;
    }

    const [updated] = await db
      .update(paymentGatewaysConfig)
      .set(updateData)
      .where(eq(paymentGatewaysConfig.gateway, gateway))
      .returning();

    return { success: true, record: updated };
  } catch (error: any) {
    console.error(`Error saving gateway config in DB for ${gateway}:`, error);
    return { success: false, error: error.message };
  }
}

export async function updateGatewayTestStatusInDb(
  gateway: 'STRIPE' | 'PAYPAL',
  status: 'SUCCESS' | 'FAILED',
  message: string
) {
  try {
    await db
      .update(paymentGatewaysConfig)
      .set({
        lastTestedAt: new Date(),
        testStatus: status,
        lastTestMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(paymentGatewaysConfig.gateway, gateway));
  } catch (e) {
    console.error('Failed to update gateway test status in DB:', e);
  }
}

// ============================================================================
// PUBLIC PROFILES QUERIES (CANONICAL POSTGRESQL TRUTH)
// ============================================================================

export function mapDbProfileToAuthentic(
  p: typeof profiles.$inferSelect,
  packageName?: string | null
): AuthenticProfile {
  return {
    profile_id: p.profileId,
    full_name: p.fullName,
    nick_name: p.nickName || undefined,
    gender: p.gender,
    date_of_birth: p.dateOfBirth,
    age: p.age,
    looking_for: p.lookingFor,
    marital_status: p.maritalStatus,
    have_children: p.haveChildren || 'No',
    child_living_status: p.childLivingStatus || 'No Child',
    family_values: p.familyValues || 'Religious',
    father_status: p.fatherStatus || 'Employed',
    mother_status: p.motherStatus || 'Homemaker',
    brothers_count: p.brothersCount || '0',
    sisters_count: p.sistersCount || '0',
    sibling_position: p.siblingPosition || '1',
    height_feet_inches: p.heightFeetInches,
    height_cm: p.heightCm,
    weight_kg: p.weightKg || 0,
    body_type: p.bodyType || 'AVERAGE',
    complexion: p.complexion || 'FAIR',
    eyes_color: p.eyesColor || 'Black',
    hair_color: p.hairColor || 'Black',
    blood_group: p.bloodGroup || '',
    disability: p.disability || 'None',
    eye_wear: p.eyeWear || 'None',
    religion: p.religion,
    sect_mazhab: p.sectMazhab || 'Sunni / Hanafi',
    religiousness: p.religiousness || 'RELIGIOUS',
    pray_frequency: p.prayFrequency || 'ALWAYS',
    halal_diet: p.halalDiet || 'STRICTLY_HALAL',
    smoke: p.smoke || 'NO',
    drink: p.drink || 'NO',
    wears_hijab_or_beard: Boolean(p.wearsHijabOrBeard),
    mother_tongue: p.motherTongue,
    education_level: p.educationLevel,
    institution_name: p.institutionName || '',
    field_of_study: p.fieldOfStudy || '',
    profession: p.profession,
    designation: p.designation || '',
    employer_name: p.employerName || '',
    experience_years: p.experienceYears || '',
    annual_income: p.annualIncome || '',
    nationality: p.nationality,
    country_living_in: p.countryLivingIn,
    state_province: p.stateProvince,
    city: p.city,
    zip_code: p.zipCode || '',
    residing_status: p.residingStatus || 'Citizen',
    guardian_name: p.guardianName || '',
    guardian_relation: p.guardianRelation || '',
    guardian_phone_country_code: p.guardianPhoneCountryCode || '+1',
    guardian_phone: p.guardianPhone || '',
    guardian_verified: Boolean(p.guardianVerified),
    about_me: p.aboutMe || '',
    what_i_am_looking_for: p.whatIAmLookingFor || '',
    photo_privacy: (p.photoPrivacy as any) || 'PUBLIC',
    completion_percentage: p.completionPercentage || 85,
    is_featured: Boolean(p.isFeatured),
    kyc_status: p.kycStatus || 'APPROVED',
    is_approved: Boolean(p.isApproved),
    package_name: packageName || 'Member',
    photo_url: p.coverPhotoUrl || `/uploads/avatars/${p.profileId}.webp`,
  };
}

export interface ProfileDbFilters {
  gender?: 'MALE' | 'FEMALE';
  country?: string;
  state?: string;
  city?: string;
  minAge?: number;
  maxAge?: number;
  profession?: string;
  educationLevel?: string;
  maritalStatus?: string;
  sectMazhab?: string;
  residingStatus?: string;
  query?: string;
}

export async function getPublicProfilesFromDb(filters?: ProfileDbFilters): Promise<AuthenticProfile[]> {
  try {
    const conditions = [
      eq(users.isActive, true),
      eq(profiles.isApproved, true),
    ];

    if (filters?.gender) {
      conditions.push(eq(profiles.gender, filters.gender));
    }
    if (filters?.minAge) {
      conditions.push(gte(profiles.age, filters.minAge));
    }
    if (filters?.maxAge) {
      conditions.push(lte(profiles.age, filters.maxAge));
    }
    if (filters?.country && filters.country !== 'All' && filters.country !== "Doesn't Matter") {
      conditions.push(ilike(profiles.countryLivingIn, `%${filters.country}%`));
    }
    if (filters?.state && filters.state !== 'All' && filters.state !== "Doesn't Matter") {
      conditions.push(ilike(profiles.stateProvince, `%${filters.state}%`));
    }
    if (filters?.profession && filters.profession !== 'All') {
      conditions.push(ilike(profiles.profession, `%${filters.profession}%`));
    }
    if (filters?.educationLevel && filters.educationLevel !== 'All') {
      conditions.push(ilike(profiles.educationLevel, `%${filters.educationLevel}%`));
    }
    if (filters?.maritalStatus && filters.maritalStatus !== 'All' && filters.maritalStatus !== "Doesn't Matter") {
      conditions.push(eq(profiles.maritalStatus, filters.maritalStatus as any));
    }
    if (filters?.sectMazhab && filters.sectMazhab !== 'All') {
      conditions.push(ilike(profiles.sectMazhab, `%${filters.sectMazhab}%`));
    }
    if (filters?.query) {
      const q = filters.query.trim();
      if (q) {
        conditions.push(
          or(
            ilike(profiles.fullName, `%${q}%`),
            ilike(profiles.city, `%${q}%`),
            ilike(profiles.profession, `%${q}%`),
            ilike(profiles.aboutMe, `%${q}%`),
            ilike(profiles.profileId, `%${q}%`)
          )!
        );
      }
    }

    const rows = await db
      .select({
        profile: profiles,
        user: users,
        sub: userSubscriptions,
        pkg: packages,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .leftJoin(userSubscriptions, and(eq(userSubscriptions.userId, users.id), eq(userSubscriptions.status, 'ACTIVE')))
      .leftJoin(packages, eq(userSubscriptions.packageId, packages.id))
      .where(and(...conditions))
      .orderBy(desc(profiles.isFeatured), desc(profiles.createdAt));

    return rows.map((r) => mapDbProfileToAuthentic(r.profile, r.pkg?.name));
  } catch (error) {
    console.error('Error in getPublicProfilesFromDb:', error);
    return [];
  }
}

export async function getPublicProfileByIdFromDb(profileIdOrId: string): Promise<AuthenticProfile | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileIdOrId);
    const condition = isUuid
      ? or(eq(profiles.profileId, profileIdOrId), eq(profiles.id, profileIdOrId))
      : eq(profiles.profileId, profileIdOrId);

    const [row] = await db
      .select({
        profile: profiles,
        user: users,
        pkg: packages,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .leftJoin(userSubscriptions, and(eq(userSubscriptions.userId, users.id), eq(userSubscriptions.status, 'ACTIVE')))
      .leftJoin(packages, eq(userSubscriptions.packageId, packages.id))
      .where(and(condition, eq(users.isActive, true)))
      .limit(1);

    if (!row) return null;
    return mapDbProfileToAuthentic(row.profile, row.pkg?.name);
  } catch (error) {
    console.error('Error in getPublicProfileByIdFromDb:', error);
    return null;
  }
}

// ============================================================================
// DURABLE CONTACT SUBMISSIONS & INBOX
// ============================================================================

export interface CreateContactSubmissionInput {
  type?: 'CONTACT' | 'WEDDING_SERVICE' | 'GENERAL';
  fullName: string;
  email: string;
  phoneNumber: string;
  subject?: string;
  cityState?: string;
  serviceType?: string;
  message: string;
}

export async function submitContactInquiryInDb(input: CreateContactSubmissionInput) {
  try {
    const [created] = await db
      .insert(contactSubmissions)
      .values({
        type: input.type || 'CONTACT',
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phoneNumber: input.phoneNumber.trim(),
        subject: input.subject || null,
        cityState: input.cityState || null,
        serviceType: input.serviceType || null,
        message: input.message.trim(),
        status: 'NEW',
      })
      .returning();

    return { success: true, submission: created };
  } catch (error: any) {
    console.error('Error saving contact submission in DB:', error);
    return { success: false, error: error.message || 'Failed to record submission' };
  }
}

export async function getContactSubmissionsForAdmin() {
  try {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  } catch (error) {
    console.error('Error fetching contact submissions for admin:', error);
    return [];
  }
}

export async function updateContactSubmissionStatusInDb(
  id: string,
  status: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED',
  adminNotes?: string
) {
  try {
    const updateObj: Record<string, any> = { status, updatedAt: new Date() };
    if (adminNotes !== undefined) updateObj.adminNotes = adminNotes;
    const [updated] = await db
      .update(contactSubmissions)
      .set(updateObj)
      .where(eq(contactSubmissions.id, id))
      .returning();
    return { success: true, submission: updated };
  } catch (error: any) {
    console.error('Error updating contact submission status in DB:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SUCCESS STORIES & CMS ARTICLES
// ============================================================================

export async function getSuccessStoriesFromDb() {
  try {
    return await db
      .select()
      .from(successStories)
      .where(eq(successStories.isPublished, true))
      .orderBy(desc(successStories.createdAt));
  } catch (error) {
    console.error('Error fetching success stories from DB:', error);
    return [];
  }
}

export async function submitSuccessStoryInDb(data: {
  title: string;
  coupleNames: string;
  weddingDate?: string;
  imageUrl?: string;
  storyBody: string;
  isPublished?: boolean;
}) {
  try {
    const [created] = await db
      .insert(successStories)
      .values({
        title: data.title.trim(),
        coupleNames: data.coupleNames.trim(),
        weddingDate: data.weddingDate || null,
        imageUrl: data.imageUrl || null,
        storyBody: data.storyBody.trim(),
        isPublished: data.isPublished !== undefined ? data.isPublished : false, // Needs admin approval by default
      })
      .returning();
    return { success: true, story: created };
  } catch (error: any) {
    console.error('Error submitting success story in DB:', error);
    return { success: false, error: error.message };
  }
}

export async function getCmsArticlesFromDb(includeDrafts = false) {
  try {
    if (includeDrafts) {
      return await db.select().from(cmsArticles).orderBy(desc(cmsArticles.publishedAt));
    }
    return await db
      .select()
      .from(cmsArticles)
      .where(eq(cmsArticles.isPublished, true))
      .orderBy(desc(cmsArticles.publishedAt));
  } catch (error) {
    console.error('Error fetching CMS articles from DB:', error);
    return [];
  }
}

export async function saveCmsArticleInDb(article: {
  title: string;
  slug: string;
  category: string;
  author?: string;
  excerpt: string;
  content: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  try {
    const [saved] = await db
      .insert(cmsArticles)
      .values({
        title: article.title.trim(),
        slug: article.slug.trim().toLowerCase(),
        category: article.category.trim(),
        author: article.author?.trim() || 'Editorial Board',
        excerpt: article.excerpt.trim(),
        content: article.content.trim(),
        isPublished: article.isPublished !== undefined ? article.isPublished : true,
        isFeatured: article.isFeatured !== undefined ? article.isFeatured : false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cmsArticles.slug,
        set: {
          title: article.title.trim(),
          category: article.category.trim(),
          author: article.author?.trim() || 'Editorial Board',
          excerpt: article.excerpt.trim(),
          content: article.content.trim(),
          isPublished: article.isPublished !== undefined ? article.isPublished : true,
          isFeatured: article.isFeatured !== undefined ? article.isFeatured : false,
          updatedAt: new Date(),
        },
      })
      .returning();
    return { success: true, article: saved };
  } catch (error: any) {
    console.error('Error saving CMS article in DB:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllCmsStoriesFromDb(includeUnpublished = true) {
  try {
    if (includeUnpublished) {
      return await db.select().from(successStories).orderBy(desc(successStories.createdAt));
    }
    return await db
      .select()
      .from(successStories)
      .where(eq(successStories.isPublished, true))
      .orderBy(desc(successStories.createdAt));
  } catch (error) {
    console.error('Error fetching CMS stories from DB:', error);
    return [];
  }
}

export async function toggleCmsStoryPublishInDb(id: number, isPublished: boolean) {
  try {
    const [updated] = await db
      .update(successStories)
      .set({ isPublished })
      .where(eq(successStories.id, id))
      .returning();
    return { success: true, story: updated };
  } catch (error: any) {
    console.error('Error toggling CMS story in DB:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCmsStoryInDb(id: number) {
  try {
    await db.delete(successStories).where(eq(successStories.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting CMS story from DB:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleCmsArticlePublishInDb(id: number, isPublished: boolean) {
  try {
    const [updated] = await db
      .update(cmsArticles)
      .set({ isPublished, updatedAt: new Date() })
      .where(eq(cmsArticles.id, id))
      .returning();
    return { success: true, article: updated };
  } catch (error: any) {
    console.error('Error toggling CMS article publish in DB:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCmsArticleInDb(id: number) {
  try {
    await db.delete(cmsArticles).where(eq(cmsArticles.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting CMS article from DB:', error);
    return { success: false, error: error.message };
  }
}

export async function getCmsPageSectionFromDb(pageKey: string, sectionKey: string, onlyPublished = true) {
  try {
    const conditions = [
      eq(cmsPageSections.pageKey, pageKey),
      eq(cmsPageSections.sectionKey, sectionKey),
    ];
    if (onlyPublished) {
      conditions.push(eq(cmsPageSections.isPublished, true));
    }
    const [section] = await db
      .select()
      .from(cmsPageSections)
      .where(and(...conditions))
      .limit(1);
    return section || null;
  } catch (error) {
    console.error(`Error fetching CMS page section (${pageKey}/${sectionKey}):`, error);
    return null;
  }
}

export async function getAllCmsPageSectionsFromDb(pageKey?: string) {
  try {
    if (pageKey) {
      return await db
        .select()
        .from(cmsPageSections)
        .where(eq(cmsPageSections.pageKey, pageKey))
        .orderBy(desc(cmsPageSections.updatedAt));
    }
    return await db.select().from(cmsPageSections).orderBy(desc(cmsPageSections.updatedAt));
  } catch (error) {
    console.error('Error fetching all CMS page sections:', error);
    return [];
  }
}

export async function saveCmsPageSectionInDb(data: {
  pageKey: string;
  sectionKey: string;
  title?: string;
  contentJson: any;
  isPublished?: boolean;
  userId?: string;
}) {
  try {
    const [saved] = await db
      .insert(cmsPageSections)
      .values({
        pageKey: data.pageKey.trim().toLowerCase(),
        sectionKey: data.sectionKey.trim().toLowerCase(),
        title: data.title?.trim() || null,
        contentJson: data.contentJson,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        updatedBy: data.userId || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [cmsPageSections.pageKey, cmsPageSections.sectionKey],
        set: {
          title: data.title?.trim() || null,
          contentJson: data.contentJson,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          updatedBy: data.userId || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return { success: true, section: saved };
  } catch (error: any) {
    console.error('Error saving CMS page section in DB:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ADMIN BULK MEMBER IMPORT & INVITE PASSWORD SETUP
// ============================================================================

export interface BulkImportMemberInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string; // YYYY-MM-DD
  countryLivingIn?: string;
  stateProvince?: string;
  city?: string;
  profession?: string;
  educationLevel?: string;
  sectMazhab?: string;
  maritalStatus?: 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'OTHER';
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  packageId?: number;
}

export interface BulkImportResult {
  totalProcessed: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  errors: Array<{ row: number; email: string; reason: string }>;
  importedMembers: Array<{
    userId: string;
    email: string;
    fullName: string;
    profileId: string;
    inviteToken: string;
    inviteLink: string;
  }>;
}

export async function bulkImportMembersInDb(
  members: BulkImportMemberInput[],
  adminActorId?: string
): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    totalProcessed: members.length,
    importedCount: 0,
    skippedDuplicatesCount: 0,
    errors: [],
    importedMembers: [],
  };

  if (!members || members.length === 0) return result;

  // 1. Preload active packages to ensure valid package assignment
  const activePackages = await db.select().from(packages).where(eq(packages.isActive, true));
  const freePkg = activePackages.find((p) => p.priceUsd === '0.00' || Number(p.priceUsd) === 0) || activePackages[0];

  const seenEmailsInBatch = new Set<string>();
  const seenPhonesInBatch = new Set<string>();

  for (let i = 0; i < members.length; i++) {
    const rowNum = i + 1;
    const item = members[i];

    const fullName = (item.fullName || '').trim();
    const rawEmail = (item.email || '').trim().toLowerCase();
    const rawPhone = (item.phoneNumber || '').trim();
    const phoneDigits = rawPhone.replace(/\D/g, '');

    if (!fullName) {
      result.errors.push({ row: rowNum, email: rawEmail || 'N/A', reason: 'Full name is required.' });
      continue;
    }
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      result.errors.push({ row: rowNum, email: rawEmail, reason: 'A valid email address is required.' });
      continue;
    }
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      result.errors.push({ row: rowNum, email: rawEmail, reason: 'Valid phone digits (7-15 digits) required.' });
      continue;
    }
    const normalizedPhone = `+${phoneDigits}`;

    if (seenEmailsInBatch.has(rawEmail)) {
      result.skippedDuplicatesCount++;
      result.errors.push({ row: rowNum, email: rawEmail, reason: 'Duplicate email inside this import batch.' });
      continue;
    }
    if (seenPhonesInBatch.has(normalizedPhone)) {
      result.skippedDuplicatesCount++;
      result.errors.push({ row: rowNum, email: rawEmail, reason: 'Duplicate phone number inside this import batch.' });
      continue;
    }

    const birthDate = new Date(`${item.dateOfBirth}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.dateOfBirth) || Number.isNaN(birthDate.getTime()) || birthDate >= new Date()) {
      result.errors.push({ row: rowNum, email: rawEmail, reason: 'Valid date of birth (YYYY-MM-DD) required.' });
      continue;
    }
    const today = new Date();
    const age =
      today.getUTCFullYear() -
      birthDate.getUTCFullYear() -
      (today.getUTCMonth() < birthDate.getUTCMonth() ||
      (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate())
        ? 1
        : 0);

    if (age < 18) {
      result.errors.push({ row: rowNum, email: rawEmail, reason: `Age is ${age}. Member must be at least 18.` });
      continue;
    }

    const gender = item.gender === 'MALE' ? 'MALE' : 'FEMALE';
    const targetPkg = item.packageId ? activePackages.find((p) => p.id === item.packageId) || freePkg : freePkg;

    try {
      const imported = await db.transaction(async (tx) => {
        // Uniqueness check in DB
        const [existing] = await tx
          .select({ id: users.id })
          .from(users)
          .where(
            or(
              eq(sql`lower(${users.email})`, rawEmail),
              eq(sql`regexp_replace(${users.phoneNumber}, '[^0-9]', '', 'g')`, phoneDigits)
            )
          )
          .limit(1);

        if (existing) {
          throw new Error('DUPLICATE_ACCOUNT');
        }

        const inviteToken = crypto.randomBytes(24).toString('hex');
        const inviteExpiresAt = new Date();
        inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30); // 30-day secure invite token
        const dummyPasswordHash = await bcrypt.hash(`INVITED_${inviteToken}`, 10);

        const [newUser] = await tx
          .insert(users)
          .values({
            email: rawEmail,
            phoneNumber: normalizedPhone,
            passwordHash: dummyPasswordHash,
            role: 'MEMBER',
            isActive: true,
            isVerified: false,
            inviteToken,
            inviteExpiresAt,
          })
          .returning();

        const profileId = `MB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
        const [newProfile] = await tx
          .insert(profiles)
          .values({
            userId: newUser.id,
            profileId,
            createdBy: 'Admin Bulk CSV Import',
            createdFor: 'self',
            lookingFor: gender === 'MALE' ? 'FEMALE' : 'MALE',
            fullName,
            gender,
            dateOfBirth: item.dateOfBirth,
            age,
            heightFeetInches: 'Not provided',
            heightCm: 0,
            maritalStatus: item.maritalStatus || 'NEVER_MARRIED',
            religion: 'Islam',
            sectMazhab: item.sectMazhab || 'Sunni / Hanafi',
            motherTongue: 'English',
            countryLivingIn: item.countryLivingIn || 'United States (USA)',
            stateProvince: item.stateProvince || 'New York',
            city: item.city || '',
            zipCode: '',
            profession: item.profession || 'Not provided',
            educationLevel: item.educationLevel || 'Not provided',
            guardianName: item.guardianName || '',
            guardianRelation: item.guardianRelation || '',
            guardianPhone: item.guardianPhone || '',
            aboutMe: '',
            whatIAmLookingFor: '',
            photoPrivacy: 'HIDDEN',
            completionPercentage: 35,
            isApproved: true,
            isFeatured: false,
            kycStatus: 'NOT_SUBMITTED',
          })
          .returning();

        const subExpiresAt = new Date();
        subExpiresAt.setMonth(subExpiresAt.getMonth() + targetPkg.durationMonths);
        await tx.insert(userSubscriptions).values({
          userId: newUser.id,
          packageId: targetPkg.id,
          status: 'ACTIVE',
          pricePaidUsd: '0.00',
          contactCreditsRemaining: targetPkg.contactCredits,
          expiresAt: subExpiresAt,
          paymentReference: `BULK_IMPORT_GRANT:${newUser.id}`,
        });

        // Audit log
        await tx.insert(auditLogs).values({
          actorId: adminActorId || null,
          action: 'BULK_MEMBER_IMPORT',
          entityName: 'users',
          entityId: newUser.id,
          meta: { email: rawEmail, profileId, assignedPackage: targetPkg.name },
        });

        return {
          userId: newUser.id,
          email: newUser.email,
          fullName: newProfile.fullName,
          profileId: newProfile.profileId,
          inviteToken,
          inviteLink: `/setup-password?token=${inviteToken}`,
        };
      });

      seenEmailsInBatch.add(rawEmail);
      seenPhonesInBatch.add(normalizedPhone);
      result.importedCount++;
      result.importedMembers.push(imported);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_ACCOUNT') {
        result.skippedDuplicatesCount++;
        result.errors.push({ row: rowNum, email: rawEmail, reason: 'An account with this email or phone number already exists.' });
      } else {
        result.errors.push({ row: rowNum, email: rawEmail, reason: err.message || 'Database transaction error.' });
      }
    }
  }

  return result;
}

export async function verifyInviteTokenFromDb(token: string) {
  try {
    if (!token || typeof token !== 'string') return { valid: false, error: 'Token missing.' };
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        inviteExpiresAt: users.inviteExpiresAt,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.inviteToken, token))
      .limit(1);

    if (!user) return { valid: false, error: 'Invalid or already utilized invite link.' };
    if (user.inviteExpiresAt && user.inviteExpiresAt < new Date()) {
      return { valid: false, error: 'This invitation link has expired. Please contact support.' };
    }

    const [profile] = await db
      .select({ fullName: profiles.fullName, profileId: profiles.profileId })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.fullName || 'Valued Member',
        profileId: profile?.profileId || '',
      },
    };
  } catch (error) {
    console.error('Error verifying invite token in DB:', error);
    return { valid: false, error: 'Internal verification failure.' };
  }
}

export async function setupPasswordWithInviteTokenInDb(token: string, newPassword: string) {
  try {
    if (!token || !newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const verification = await verifyInviteTokenFromDb(token);
    if (!verification.valid || !verification.user) {
      return { success: false, error: verification.error || 'Invalid invite link.' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash,
        inviteToken: null,
        inviteExpiresAt: null,
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, verification.user.id));

    return { success: true, email: verification.user.email };
  } catch (error: any) {
    console.error('Error setting password with invite token in DB:', error);
    return { success: false, error: error.message || 'Password setup failed.' };
  }
}



