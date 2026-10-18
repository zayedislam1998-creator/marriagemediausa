import bcrypt from 'bcryptjs';
import domainSeed from '../../seed-data/marriagemediausa_domain_seed.json';
import { db } from './index';
import {
  users,
  packages,
  profiles,
  partnerPreferences,
  userPhotos,
  userSubscriptions,
} from './schema';

async function runSeed() {
  console.log('🌱 Starting MarriageMediaUSA.com Domain Seeder...');

  try {
    // 1. Seed Super Admin
    const adminPasswordHash = await bcrypt.hash('Admin@MarriageMedia2026', 10);
    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@marriagemediausa.com',
        phoneNumber: '+1-202-555-0100',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Super Admin created or verified: ${adminUser?.email || 'admin@marriagemediausa.com'}`);

    // 2. Seed Packages ($0, $2000, $3000, $4000, $6500)
    console.log('📦 Seeding authentic packages...');
    for (const pkg of domainSeed.packages) {
      await db
        .insert(packages)
        .values({
          id: pkg.id,
          name: pkg.name,
          durationMonths: pkg.duration_months,
          priceUsd: pkg.price_usd.toString(),
          contactCredits: pkg.contact_credits,
          dailyProfileViewLimit: pkg.daily_profile_view_limit,
          badgeTitle: pkg.badge_title,
          featuresJson: pkg.features,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${domainSeed.packages.length} authentic packages.`);

    // 3. Seed Real Authentic Profiles
    console.log('👥 Seeding real authentic matrimonial profiles...');
    const defaultSuitorPassword = await bcrypt.hash('Salam2026!', 10);

    for (const p of domainSeed.real_profiles_seed) {
      // Create user
      const userEmail = `${p.nick_name?.toLowerCase() || p.profile_id}@example.com`;
      const [user] = await db
        .insert(users)
        .values({
          email: userEmail,
          phoneNumber: `+1-${p.guardian_phone}`,
          passwordHash: defaultSuitorPassword,
          role: 'MEMBER',
          isActive: true,
          isVerified: true,
        })
        .onConflictDoNothing()
        .returning();

      if (!user) {
        console.log(`⚠️ User ${userEmail} already exists, skipping profile insertion.`);
        continue;
      }

      // Create profile
      const [createdProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          profileId: p.profile_id,
          createdBy: 'self',
          createdFor: 'self',
          lookingFor: p.looking_for as 'MALE' | 'FEMALE',
          fullName: p.full_name,
          nickName: p.nick_name,
          gender: p.gender as 'MALE' | 'FEMALE',
          dateOfBirth: p.date_of_birth,
          age: p.age,
          maritalStatus: p.marital_status as any,
          haveChildren: p.have_children,
          childLivingStatus: p.child_living_status,
          familyValues: p.family_values,
          fatherStatus: p.father_status,
          motherStatus: p.mother_status,
          brothersCount: p.brothers_count,
          sistersCount: p.sisters_count,
          siblingPosition: p.sibling_position,
          heightFeetInches: p.height_feet_inches,
          heightCm: p.height_cm,
          weightKg: p.weight_kg,
          bodyType: p.body_type as any,
          complexion: p.complexion as any,
          eyesColor: p.eyes_color,
          hairColor: p.hair_color,
          bloodGroup: p.blood_group,
          disability: p.disability,
          eyeWear: p.eye_wear,
          religion: p.religion,
          sectMazhab: p.sect_mazhab,
          religiousness: p.religiousness as any,
          prayFrequency: p.pray_frequency as any,
          halalDiet: p.halal_diet as any,
          smoke: p.smoke as any,
          drink: p.drink as any,
          wearsHijabOrBeard: p.wears_hijab_or_beard,
          motherTongue: p.mother_tongue,
          educationLevel: p.education_level,
          institutionName: p.institution_name,
          fieldOfStudy: p.field_of_study,
          profession: p.profession,
          designation: p.designation,
          employerName: p.employer_name,
          experienceYears: p.experience_years,
          annualIncome: p.annual_income,
          nationality: p.nationality,
          countryLivingIn: p.country_living_in,
          stateProvince: p.state_province,
          city: p.city,
          zipCode: p.zip_code,
          residingStatus: p.residing_status as any,
          addressLine: p.address_line,
          guardianName: p.guardian_name,
          guardianRelation: p.guardian_relation,
          guardianPhoneCountryCode: p.guardian_phone_country_code,
          guardianPhone: p.guardian_phone,
          guardianVerified: p.guardian_verified,
          aboutMe: p.about_me,
          whatIAmLookingFor: p.what_i_am_looking_for,
          hobbiesInterests: p.hobbies_interests,
          photoPrivacy: p.photo_privacy,
          completionPercentage: p.completion_percentage,
          isFeatured: p.is_featured,
          kycStatus: p.kyc_status as any,
          isApproved: p.is_approved,
        })
        .returning();

      if (createdProfile) {
        // Create Partner Preferences
        await db
          .insert(partnerPreferences)
          .values({
            profileId: createdProfile.id,
            ageMin: Math.max(18, p.age - 5),
            ageMax: p.age + 5,
            preferredCountry: 'United States (USA)',
            preferredState: p.state_province,
            smoke: 'NO',
            drink: 'NO',
          })
          .onConflictDoNothing();

        // Create Photo Record (Full, Thumb, Purdah Blur)
        await db
          .insert(userPhotos)
          .values({
            profileId: createdProfile.id,
            urlFull: `/uploads/profiles/${p.profile_id}_full.webp`,
            urlThumb: `/uploads/profiles/${p.profile_id}_thumb.webp`,
            urlBlur: `/uploads/profiles/${p.profile_id}_blur.webp`,
            isPrimary: true,
            isApproved: true,
          })
          .onConflictDoNothing();
      }
    }

    console.log('✅ Real matrimonial profiles successfully seeded.');
    console.log('🎉 Domain Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
