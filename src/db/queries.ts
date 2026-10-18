import { db } from './index';
import {
  users,
  profiles,
  userSubscriptions,
  packages,
  memberResumes,
  profileRequirementsConfig,
  formBuilderConfigs,
} from './schema';
import { eq, desc, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import domainSeed from '../../seed-data/marriagemediausa_domain_seed.json';

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
    const subMap = new Map(dbSubs.map((s) => [s.sub.userId, s]));

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
              packageName: s.pkg.name,
              contactCreditsRemaining: s.sub.contactCreditsRemaining,
              status: s.sub.status,
            }
          : {
              packageName: 'Free Explorer',
              contactCreditsRemaining: 0,
              status: 'ACTIVE',
            },
      };
    });
  } catch (error) {
    console.error('Error fetching members from DB, falling back:', error);
    return [];
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
    return [];
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
  password: string;
  phoneNumber: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  maritalStatus?: 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
  countryLivingIn?: string;
  stateProvince?: string;
  city?: string;
  profession?: string;
  educationLevel?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  tier?: 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ELITE';
}

export async function provisionMemberInDb(input: ProvisionMemberInput) {
  try {
    // 1. Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 2. Insert into users table
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase().trim(),
        phoneNumber: input.phoneNumber.trim(),
        passwordHash,
        role: 'MEMBER',
        isActive: true,
        isVerified: true,
      })
      .returning();

    // 3. Compute age from DOB
    const birthDate = new Date(input.dateOfBirth);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // 4. Generate unique profile ID (e.g. '2026' + 6 random digits)
    const profileId = `2026${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Insert into profiles table
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        profileId,
        createdBy: 'Admin Direct Provisioning',
        createdFor: 'self',
        lookingFor: input.gender === 'MALE' ? 'FEMALE' : 'MALE',
        fullName: input.fullName.trim(),
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        age: age || 25,
        heightFeetInches: input.gender === 'MALE' ? `5' 10"` : `5' 4"`,
        heightCm: input.gender === 'MALE' ? 178 : 163,
        maritalStatus: input.maritalStatus || 'NEVER_MARRIED',
        countryLivingIn: input.countryLivingIn || 'United States (USA)',
        stateProvince: input.stateProvince || 'New York',
        city: input.city || 'New York',
        zipCode: '10001',
        educationLevel: input.educationLevel || "Bachelor's Degree",
        profession: input.profession || 'Software Professional',
        guardianName: input.guardianName || (input.gender === 'FEMALE' ? 'Verified Guardian' : 'Self/Family'),
        guardianRelation: input.guardianRelation || (input.gender === 'FEMALE' ? 'Father' : 'Self'),
        guardianPhone: input.guardianPhone || input.phoneNumber,
        guardianVerified: true,
        aboutMe: `Practicing Muslim dedicated to faith, character, and Sunnah marriage. Seeking a righteous life partner to build an Islamic household.`,
        whatIAmLookingFor: `Looking for a practicing, family-oriented partner with good moral character, mutual respect, and dedication to Deen.`,
        completionPercentage: 85,
        isApproved: true,
        isFeatured: false,
      })
      .returning();

    // 6. Find package matching chosen tier or default to 1 (Free)
    const tierName = input.tier || 'FREE';
    const allPkgs = await db.select().from(packages);
    const matchedPkg = allPkgs.find((p) => p.name.toUpperCase().includes(tierName)) || allPkgs[0];

    if (matchedPkg) {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + matchedPkg.durationMonths);

      await db.insert(userSubscriptions).values({
        userId: newUser.id,
        packageId: matchedPkg.id,
        status: 'ACTIVE',
        pricePaidUsd: matchedPkg.priceUsd,
        contactCreditsRemaining: matchedPkg.contactCredits,
        expiresAt: expires,
        paymentReference: `ADMIN_PROVISION_${Date.now()}`,
      });
    }

    return {
      success: true,
      user: newUser,
      profile: newProfile,
    };
  } catch (error: any) {
    console.error('Error provisioning member in DB:', error);
    return {
      success: false,
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

export async function assignUserSubscriptionTierInDb(userId: string, tierName: string) {
  try {
    const allPkgs = await db.select().from(packages);
    let matchedPkg = allPkgs.find((p) => p.name.toLowerCase().includes(tierName.toLowerCase()));
    if (!matchedPkg && allPkgs.length > 0) {
      matchedPkg = allPkgs[0];
    }
    const credits = matchedPkg ? matchedPkg.contactCredits : 25;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (matchedPkg?.durationMonths || 6));

    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));

    if (existing && matchedPkg) {
      await db
        .update(userSubscriptions)
        .set({
          packageId: matchedPkg.id,
          status: 'ACTIVE',
          contactCreditsRemaining: credits,
          expiresAt,
        })
        .where(eq(userSubscriptions.id, existing.id));
    } else if (matchedPkg) {
      await db.insert(userSubscriptions).values({
        userId,
        packageId: matchedPkg.id,
        status: 'ACTIVE',
        pricePaidUsd: matchedPkg.priceUsd,
        contactCreditsRemaining: credits,
        expiresAt,
      });
    }

    return { success: true, packageName: matchedPkg?.name || tierName };
  } catch (error) {
    console.error('Error assigning user subscription in DB:', error);
    return { success: false, error: 'Database update failed' };
  }
}


