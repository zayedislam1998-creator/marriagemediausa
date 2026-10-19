import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { users, profiles, userSubscriptions, packages } from '@/db/schema';
import { setSessionCookie, UserRole } from '@/lib/auth/session';
import { ensureDatabaseReady } from '@/db/auto-migrate';

export async function POST(req: NextRequest) {
  try {
    // Ensure all tables and seed exist
    await ensureDatabaseReady();

    const body = await req.json();

    const fullName = (body.fullName || '').toString().trim();
    const email = (body.email || '').toString().trim().toLowerCase();
    const phoneNumber = (body.phoneNumber || '').toString().trim();
    const password = (body.password || '').toString();
    const gender = (body.gender || 'FEMALE').toString().toUpperCase() as 'MALE' | 'FEMALE';
    const lookingFor = (body.lookingFor || (gender === 'FEMALE' ? 'MALE' : 'FEMALE')).toString().toUpperCase() as 'MALE' | 'FEMALE';
    const country = (body.country || 'United States').toString().trim();
    const stateProvince = (body.stateProvince || '').toString().trim();
    const city = (body.city || '').toString().trim();
    const profileCreatedFor = (body.profileCreatedFor || 'Self').toString().trim();
    const adminPasscode = (body.adminPasscode || '').toString().trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ success: false, error: 'Full legal name is required.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json({ success: false, error: 'A valid phone number is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email or phone number already exists. Please log in.' },
        { status: 409 }
      );
    }

    // 2. Role Determination
    let assignedRole: UserRole = 'MEMBER';
    if (adminPasscode === 'MB-ADMIN-2026') {
      assignedRole = 'SUPER_ADMIN';
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        phoneNumber,
        passwordHash,
        role: assignedRole,
        isActive: true,
        isVerified: assignedRole === 'SUPER_ADMIN',
      })
      .returning();

    // 5. Create Profile with location details
    const profileId = `2026${Math.floor(100000 + Math.random() * 900000)}`;
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        profileId,
        fullName,
        gender,
        lookingFor,
        dateOfBirth: '1998-01-01',
        age: 28,
        heightFeetInches: "5'6\"",
        heightCm: 168,
        maritalStatus: 'NEVER_MARRIED',
        religion: 'Islam',
        sectMazhab: 'Sunni / Hanafi',
        religiousness: 'RELIGIOUS',
        prayFrequency: 'ALWAYS',
        halalDiet: 'STRICTLY_HALAL',
        educationLevel: "Bachelor's Degree",
        profession: 'Professional',
        countryLivingIn: country,
        stateProvince: stateProvince || 'New York',
        city: city || 'New York',
        zipCode: '10001',
        guardianName: 'Family Guardian',
        guardianRelation: profileCreatedFor === 'Self' ? 'Father' : profileCreatedFor,
        guardianPhone: phoneNumber,
        aboutMe: 'Practicing Muslim looking for a pious, kind-hearted life partner to complete half our deen.',
        whatIAmLookingFor: 'A God-fearing companion with good character and Islamic moral values.',
        completionPercentage: 65,
        isApproved: true,
        kycStatus: 'NOT_SUBMITTED',
        photoPrivacy: 'PUBLIC',
      })
      .returning();

    // 6. Free Subscription
    const freePackages = await db.select().from(packages).where(eq(packages.id, 1)).limit(1);
    if (freePackages.length > 0) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await db.insert(userSubscriptions).values({
        userId: newUser.id,
        packageId: 1,
        status: 'ACTIVE',
        pricePaidUsd: '0.00',
        contactCreditsRemaining: assignedRole === 'SUPER_ADMIN' ? 9999 : 0,
        expiresAt,
      });
    }

    // 7. Establish Secure Session
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      fullName: newProfile.fullName,
      role: assignedRole,
      tier: assignedRole === 'SUPER_ADMIN' ? 'ELITE' : 'FREE',
      profileId: newProfile.profileId,
      contactCredits: assignedRole === 'SUPER_ADMIN' ? 9999 : 0,
      dailyViewLimit: assignedRole === 'SUPER_ADMIN' ? 9999 : 15,
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: newUser.id,
        email: newUser.email,
        fullName: newProfile.fullName,
        role: assignedRole,
        tier: assignedRole === 'SUPER_ADMIN' ? 'ELITE' : 'FREE',
        profileId: newProfile.profileId,
      },
    });
  } catch (error: any) {
    console.error('API /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
