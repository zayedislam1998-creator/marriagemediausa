'use server';

import { getCurrentSession } from '@/lib/auth/session';
import { updateMemberProfileInDb, getProfileRequirementsFromDb } from '@/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

/**
 * Calculates genuine dynamic completion percentage based on admin requirements
 */
async function computeCompletionPercentage(profile: any, gender: string) {
  try {
    const rules = await getProfileRequirementsFromDb();
    if (!rules || rules.length === 0) return 75;

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const rule of rules) {
      if (!rule.isActive) continue;
      if (rule.genderApplicable !== 'ALL' && rule.genderApplicable !== gender) continue;

      totalWeight += rule.completionWeightPercent;

      let isFilled = false;
      switch (rule.fieldKey) {
        case 'full_name':
          isFilled = !!profile.fullName && profile.fullName.trim().length > 0;
          break;
        case 'gender':
          isFilled = !!profile.gender;
          break;
        case 'date_of_birth':
          isFilled = !!profile.dateOfBirth;
          break;
        case 'marital_status':
          isFilled = !!profile.maritalStatus;
          break;
        case 'religion_sect':
          isFilled = !!profile.sectMazhab;
          break;
        case 'pray_frequency':
          isFilled = !!profile.prayFrequency;
          break;
        case 'education_level':
          isFilled = !!profile.educationLevel;
          break;
        case 'profession':
          isFilled = !!profile.profession;
          break;
        case 'country_city':
          isFilled = !!profile.countryLivingIn && !!profile.city;
          break;
        case 'guardian_wali':
          isFilled = !!profile.guardianName && !!profile.guardianPhone;
          break;
        case 'about_me':
          isFilled = !!profile.aboutMe && profile.aboutMe.length > 20;
          break;
        case 'cv_resume':
          isFilled = !!profile.cvUrl;
          break;
        default:
          isFilled = true;
          break;
      }

      if (isFilled) {
        earnedWeight += rule.completionWeightPercent;
      }
    }

    if (totalWeight === 0) return 100;
    return Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
  } catch (err) {
    console.error('Error computing completion percentage:', err);
    return 70;
  }
}

/**
 * Update Member Biodata Profile Fields
 */
export async function updateMemberBiodataAction(_prevState: any, formData: FormData) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required' };
    }

    const fullName = formData.get('fullName') as string;
    const nickName = formData.get('nickName') as string;
    const maritalStatus = formData.get('maritalStatus') as any;
    const heightFeetInches = formData.get('heightFeetInches') as string;
    const educationLevel = formData.get('educationLevel') as string;
    const profession = formData.get('profession') as string;
    const annualIncome = formData.get('annualIncome') as string;
    const countryLivingIn = formData.get('countryLivingIn') as string;
    const stateProvince = formData.get('stateProvince') as string;
    const city = formData.get('city') as string;
    const guardianName = formData.get('guardianName') as string;
    const guardianRelation = formData.get('guardianRelation') as string;
    const guardianPhone = formData.get('guardianPhone') as string;
    const aboutMe = formData.get('aboutMe') as string;
    const whatIAmLookingFor = formData.get('whatIAmLookingFor') as string;
    const sectMazhab = formData.get('sectMazhab') as string;
    const prayFrequency = formData.get('prayFrequency') as any;
    const photoPrivacy = formData.get('photoPrivacy') as string;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (nickName !== undefined) updateData.nickName = nickName;
    if (maritalStatus) updateData.maritalStatus = maritalStatus;
    if (heightFeetInches) updateData.heightFeetInches = heightFeetInches;
    if (educationLevel) updateData.educationLevel = educationLevel;
    if (profession) updateData.profession = profession;
    if (annualIncome !== undefined) updateData.annualIncome = annualIncome;
    if (countryLivingIn) updateData.countryLivingIn = countryLivingIn;
    if (stateProvince) updateData.stateProvince = stateProvince;
    if (city) updateData.city = city;
    if (guardianName) updateData.guardianName = guardianName;
    if (guardianRelation) updateData.guardianRelation = guardianRelation;
    if (guardianPhone) updateData.guardianPhone = guardianPhone;
    if (aboutMe) updateData.aboutMe = aboutMe;
    if (whatIAmLookingFor) updateData.whatIAmLookingFor = whatIAmLookingFor;
    if (sectMazhab) updateData.sectMazhab = sectMazhab;
    if (prayFrequency) updateData.prayFrequency = prayFrequency;
    if (photoPrivacy) updateData.photoPrivacy = photoPrivacy;

    // Recalculate dynamic completion percentage
    updateData.completionPercentage = await computeCompletionPercentage(
      updateData,
      session.role === 'MEMBER' ? 'ALL' : 'ALL'
    );

    const updated = await updateMemberProfileInDb(session.userId, updateData);
    revalidatePath('/dashboard');

    return {
      success: true,
      profile: updated,
      message: '✓ Biodata profile updated and saved to PostgreSQL successfully',
    };
  } catch (err: any) {
    console.error('Error updating member biodata:', err);
    return { success: false, error: err.message || 'Failed to update biodata' };
  }
}

/**
 * Upload Avatar or Cover Photo
 */
export async function uploadProfileMediaAction(_prevState: any, formData: FormData) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required' };
    }

    const mediaType = formData.get('mediaType') as 'avatar' | 'cover';
    const file = formData.get('mediaFile') as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: 'Please choose an image file' };
    }

    const folderName = mediaType === 'cover' ? 'covers' : 'avatars';
    const uploadsDir = join(process.cwd(), 'public', 'uploads', folderName);
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.userId}_${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const mediaUrl = `/uploads/${folderName}/${fileName}`;

    if (mediaType === 'cover') {
      await updateMemberProfileInDb(session.userId, { coverPhotoUrl: mediaUrl });
    }

    revalidatePath('/dashboard');

    return {
      success: true,
      mediaUrl,
      mediaType,
      message: `✓ ${mediaType === 'cover' ? 'Cover Banner' : 'Profile Avatar'} updated successfully!`,
    };
  } catch (err: any) {
    console.error('Error in uploadProfileMediaAction:', err);
    return { success: false, error: err.message || 'Failed to upload photo' };
  }
}
