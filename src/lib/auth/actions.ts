'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { and, desc, eq, gt, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, profiles, userSubscriptions, packages, userPhotos } from '@/db/schema';
import {
  setSessionCookie,
  getCurrentSession,
  UserRole,
  MembershipTier,
} from './session';

const signInSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone Number is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phoneNumber: z.string().min(7, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gender: z.enum(['MALE', 'FEMALE']),
  lookingFor: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth is required'),
});

/**
 * Real PostgreSQL Sign In Action
 */
export async function signInAction(prevState: any, formData: FormData) {
  const rawData = {
    identifier: formData.get('identifier')?.toString() || '',
    password: formData.get('password')?.toString() || '',
  };

  const validation = signInSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const idTrimmed = rawData.identifier.trim().toLowerCase();

  try {
    // 1. Look up user by email or phone number in PostgreSQL
    const foundUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.email, idTrimmed), eq(users.phoneNumber, idTrimmed)))
      .limit(1);

    const user = foundUsers[0];

    if (!user) {
      return {
        success: false,
        error: 'No registered account found with this email or phone number.',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
      };
    }

    // Passwords are accepted only when they match this account's password hash.
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(rawData.password, user.passwordHash);
    } catch {
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    // 3. Retrieve linked profile for Full Name and Profile ID
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    // 4. Retrieve active subscription
    const [sub] = await db
      .select({
        sub: userSubscriptions,
        pkg: packages,
      })
      .from(userSubscriptions)
      .leftJoin(packages, eq(userSubscriptions.packageId, packages.id))
      .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, 'ACTIVE'), gt(userSubscriptions.expiresAt, new Date())))
      .orderBy(desc(userSubscriptions.startedAt))
      .limit(1);

    const userRole = user.role as UserRole;
    let tier: MembershipTier = 'FREE';
    let contactCredits = 0;
    let dailyViewLimit = 15;

    if (userRole === 'SUPER_ADMIN') {
      tier = 'ELITE';
      contactCredits = 9999;
      dailyViewLimit = 9999;
    } else if (sub?.pkg) {
      contactCredits = sub.sub.contactCreditsRemaining;
      dailyViewLimit = sub.pkg.dailyProfileViewLimit;
      const packageName = sub.pkg.name.toUpperCase();
      if (packageName.includes('SILVER')) tier = 'SILVER';
      else if (packageName.includes('GOLD')) tier = 'GOLD';
      else if (packageName.includes('DIAMOND')) tier = 'PLATINUM';
      else if (packageName.includes('ELITE') || packageName.includes('ROYAL')) tier = 'ELITE';
    }

    // 5. Issue secure HTTP-Only JWT Cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: profile?.fullName || (userRole === 'SUPER_ADMIN' ? 'Chief Super Admin' : 'Valued Member'),
      role: userRole,
      tier,
      profileId: profile?.profileId,
      contactCredits,
      dailyViewLimit,
    });

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // 6. Direct to appropriate protected workspace
    let targetUrl = '/dashboard';
    if (userRole === 'SUPER_ADMIN') targetUrl = '/admin';
    else if (userRole === 'EDITOR') targetUrl = '/admin/cms';
    else if (userRole === 'MODERATOR') targetUrl = '/admin/kyc';

    redirect(targetUrl);
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Sign-in error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during sign in.',
    };
  }
}

/**
 * Legacy form-action signup path; keep its DB behavior aligned with API signup.
 */
export async function signUpAction(prevState: any, formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phoneNumber: formData.get('phoneNumber')?.toString() || '',
    password: formData.get('password')?.toString() || '',
    dateOfBirth: formData.get('dateOfBirth')?.toString() || '',
    gender: formData.get('gender')?.toString() || 'FEMALE',
    lookingFor: formData.get('lookingFor')?.toString() || 'MALE',
    country: formData.get('country')?.toString() || 'United States',
    stateProvince: formData.get('stateProvince')?.toString() || '',
    city: formData.get('city')?.toString() || '',
    profileCreatedFor: formData.get('profileCreatedFor')?.toString() || 'Self',
  };

  const validation = signUpSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  const emailLower = rawData.email.toLowerCase().trim();
  const phoneDigits = rawData.phoneNumber.replace(/\D/g, '');
  const phoneClean = `+${phoneDigits}`;
  const birthDate = new Date(`${rawData.dateOfBirth}T00:00:00.000Z`);
  const today = new Date();
  const validBirthDate = !Number.isNaN(birthDate.getTime()) && birthDate.toISOString().slice(0, 10) === rawData.dateOfBirth;
  const age = today.getUTCFullYear() - birthDate.getUTCFullYear() -
    (today.getUTCMonth() < birthDate.getUTCMonth() || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate()) ? 1 : 0);
  if (phoneDigits.length < 7 || phoneDigits.length > 15) return { success: false, error: 'Enter a valid phone number.' };
  if (!validBirthDate || age < 18 || birthDate > today) return { success: false, error: 'A valid date of birth is required; members must be at least 18 years old.' };

  try {
    // 1. Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, emailLower), sql`regexp_replace(${users.phoneNumber}, '[^0-9]', '', 'g') = ${phoneDigits}`))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: 'An account with this email or phone number already exists. Please log in instead.',
      };
    }

    const assignedRole: UserRole = 'MEMBER';

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(rawData.password, 10);

    const { newUser, newProfile, freePackage } = await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({
        email: emailLower, phoneNumber: phoneClean, passwordHash, role: assignedRole, isActive: true, isVerified: false,
      }).returning();
      if (!newUser) throw new Error('The account could not be created.');
      const profileId = `MB${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;
      const [newProfile] = await tx.insert(profiles).values({
        userId: newUser.id, profileId, createdBy: 'self', createdFor: rawData.profileCreatedFor,
        fullName: rawData.fullName.trim(), gender: rawData.gender as 'MALE' | 'FEMALE',
        lookingFor: rawData.lookingFor as 'MALE' | 'FEMALE', dateOfBirth: rawData.dateOfBirth, age,
        heightFeetInches: 'Not provided', heightCm: 0, maritalStatus: 'OTHER',
        haveChildren: null, childLivingStatus: null, familyValues: null, fatherStatus: null, motherStatus: null,
        brothersCount: null, sistersCount: null, siblingPosition: null,
        bodyType: null, complexion: null, eyesColor: null, hairColor: null, disability: null, eyeWear: null,
        religion: 'Not provided', sectMazhab: null, religiousness: null, prayFrequency: null, halalDiet: null,
        smoke: null, drink: null, wearsHijabOrBeard: null, motherTongue: 'Not provided',
        countryLivingIn: rawData.country.trim(), stateProvince: rawData.stateProvince.trim(), city: rawData.city.trim(),
        zipCode: '', educationLevel: 'Not provided', profession: '', nationality: 'Not provided', residingStatus: 'OTHERS',
        guardianName: '', guardianRelation: '', guardianPhone: '', guardianPhoneCountryCode: null,
        aboutMe: '', whatIAmLookingFor: '', photoPrivacy: 'HIDDEN',
        completionPercentage: 10, isApproved: false, kycStatus: 'NOT_SUBMITTED',
      }).returning();
      if (!newProfile) throw new Error('The member profile could not be created.');
      const [freePackage] = await tx.select().from(packages)
        .where(and(eq(packages.isActive, true), sql`${packages.priceUsd} = 0`)).orderBy(packages.id).limit(1);
      if (!freePackage) throw new Error('The free membership package is unavailable.');
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + freePackage.durationMonths);
      await tx.insert(userSubscriptions).values({
        userId: newUser.id,
        packageId: freePackage.id,
        status: 'ACTIVE',
        pricePaidUsd: '0.00',
        contactCreditsRemaining: freePackage.contactCredits,
        expiresAt,
      });
      return { newUser, newProfile, freePackage };
    });

    // 7. Establish Secure Session
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      fullName: newProfile.fullName,
      role: assignedRole,
      tier: 'FREE',
      profileId: newProfile.profileId,
      contactCredits: freePackage.contactCredits,
      dailyViewLimit: freePackage.dailyProfileViewLimit,
    });

    // 8. Redirect to appropriate destination
    redirect('/dashboard?registered=true');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Sign-up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create your account. Please try again.',
    };
  }
}

/**
 * Member Profile Update Action (from Member Dashboard)
 */
export async function updateMemberProfileAction(prevState: any, formData: FormData) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Authentication required.' };
  }

  try {
    const fullName = formData.get('fullName')?.toString() || session.fullName;
    const age = parseInt(formData.get('age')?.toString() || '28', 10);
    const heightFeetInches = formData.get('heightFeetInches')?.toString() || "5'6\"";
    const maritalStatus = formData.get('maritalStatus')?.toString() || 'NEVER_MARRIED';
    const prayFrequency = formData.get('prayFrequency')?.toString() || 'ALWAYS';
    const halalDiet = formData.get('halalDiet')?.toString() || 'STRICTLY_HALAL';
    const sectMazhab = formData.get('sectMazhab')?.toString() || 'Sunni / Hanafi';
    const educationLevel = formData.get('educationLevel')?.toString() || "Bachelor's Degree";
    const profession = formData.get('profession')?.toString() || 'Professional';
    const annualIncome = formData.get('annualIncome')?.toString() || '$75,000+';
    const city = formData.get('city')?.toString() || 'New York';
    const stateProvince = formData.get('stateProvince')?.toString() || 'New York';
    const guardianName = formData.get('guardianName')?.toString() || 'Guardian';
    const guardianRelation = formData.get('guardianRelation')?.toString() || 'Father';
    const guardianPhone = formData.get('guardianPhone')?.toString() || '+1-555-0100';
    const aboutMe = formData.get('aboutMe')?.toString() || '';
    const whatIAmLookingFor = formData.get('whatIAmLookingFor')?.toString() || '';
    const photoPrivacy = formData.get('photoPrivacy')?.toString() || 'PUBLIC';
    const photoUrl = formData.get('photoUrl')?.toString();
    const photoThumbUrl = formData.get('photoThumbUrl')?.toString();
    const photoBlurUrl = formData.get('photoBlurUrl')?.toString();

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        fullName,
        age,
        heightFeetInches,
        maritalStatus: maritalStatus as any,
        prayFrequency: prayFrequency as any,
        halalDiet: halalDiet as any,
        sectMazhab,
        educationLevel,
        profession,
        annualIncome,
        city,
        stateProvince,
        guardianName,
        guardianRelation,
        guardianPhone,
        aboutMe,
        whatIAmLookingFor,
        photoPrivacy,
        coverPhotoUrl: photoUrl || undefined,
        completionPercentage: 90,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.userId))
      .returning();

    if (updatedProfile && photoUrl) {
      await db.insert(userPhotos).values({
        profileId: updatedProfile.id,
        urlFull: photoUrl,
        urlThumb: photoThumbUrl || photoUrl,
        urlBlur: photoBlurUrl || photoUrl,
        isPrimary: true,
        isApproved: true,
      });
    }

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message || 'Failed to update profile.' };
  }
}

/**
 * Super Admin: Change Any User's Role (Promote / Demote)
 */
export async function adminChangeUserRoleAction(userId: string, newRole: UserRole) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin permissions required.' };
  }

  try {
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
    return { success: true, message: `Role updated to ${newRole} successfully.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update role.' };
  }
}

/**
 * Super Admin: Toggle User Active Status (Ban / Activate)
 */
export async function adminToggleUserActiveAction(userId: string, isActive: boolean) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin permissions required.' };
  }

  try {
    await db.update(users).set({ isActive }).where(eq(users.id, userId));
    return { success: true, message: `Account status updated to ${isActive ? 'Active' : 'Suspended'}.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user status.' };
  }
}

/**
 * Super Admin: Verify / Reject Member's KYC
 */
export async function adminUpdateMemberKycAction(userId: string, kycStatus: 'VERIFIED' | 'REJECTED' | 'PENDING') {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MODERATOR')) {
    return { success: false, error: 'Unauthorized: Admin or Moderator permissions required.' };
  }

  try {
    await db.update(profiles).set({ kycStatus }).where(eq(profiles.userId, userId));
    return { success: true, message: `KYC status updated to ${kycStatus}.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update KYC status.' };
  }
}

/**
 * Development Fast Role Switcher
 */
export async function switchDevSeatAction(role: UserRole, tier: MembershipTier = 'FREE') {
  let email = 'demo@example.com';
  let fullName = 'Brother Farhan (Free Explorer)';
  let profileId = undefined;
  let contactCredits = 0;
  let dailyViewLimit = 15;

  if (role === 'SUPER_ADMIN') {
    email = 'admin@marriagemediausa.com';
    fullName = 'Chief Super Admin';
    contactCredits = 9999;
    dailyViewLimit = 9999;
  } else if (role === 'EDITOR') {
    email = 'editor@marriagemediausa.com';
    fullName = 'Content & Stories Editor';
    contactCredits = 500;
    dailyViewLimit = 500;
  } else if (role === 'MODERATOR') {
    email = 'moderator@marriagemediausa.com';
    fullName = 'Trust & KYC Moderator';
    contactCredits = 200;
    dailyViewLimit = 200;
  } else if (tier === 'GOLD') {
    email = 'ayesha@example.com';
    fullName = 'Dr. Ayesha Siddiqa';
    profileId = '2026044925';
    contactCredits = 60;
    dailyViewLimit = 150;
  } else if (tier === 'PLATINUM') {
    email = 'shahid@example.com';
    fullName = 'Shahidur Rahman';
    profileId = '2018054077';
    contactCredits = 120;
    dailyViewLimit = 500;
  }

  await setSessionCookie({
    userId: crypto.randomUUID(),
    email,
    fullName,
    role,
    tier,
    profileId,
    contactCredits,
    dailyViewLimit,
  });

  if (role === 'SUPER_ADMIN') redirect('/admin');
  if (role === 'EDITOR') redirect('/admin/cms');
  if (role === 'MODERATOR') redirect('/admin/kyc');
  redirect('/dashboard');
}
