'use server';

import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import { provisionMemberInDb, ProvisionMemberInput } from '@/db/queries';
import { revalidatePath } from 'next/cache';

/**
 * Super Admin Action to provision a verified member directly in PostgreSQL 18
 */
export async function adminProvisionMemberAction(_prevState: any, formData: FormData) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized: Super Admin access required' };
    }

    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const sendInviteLink = formData.get('sendInviteLink') === 'true' || formData.get('sendInviteLink') === 'on';
    const password = (formData.get('password') as string) || '';
    const phoneNumber = formData.get('phoneNumber') as string;
    const fullName = formData.get('fullName') as string;
    const gender = formData.get('gender') as 'MALE' | 'FEMALE';
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const packageId = Number(formData.get('packageId'));
    const profession = (formData.get('profession') as string) || '';
    const educationLevel = (formData.get('educationLevel') as string) || '';
    const countryLivingIn = (formData.get('countryLivingIn') as string) || '';
    const city = (formData.get('city') as string) || '';
    const stateProvince = (formData.get('stateProvince') as string) || '';
    const maritalStatus = (formData.get('maritalStatus')?.toString() || 'OTHER') as ProvisionMemberInput['maritalStatus'];
    const guardianName = formData.get('guardianName') as string | undefined;
    const guardianRelation = formData.get('guardianRelation') as string | undefined;
    const guardianPhone = formData.get('guardianPhone') as string | undefined;

    if (!email || (!sendInviteLink && !password) || !phoneNumber || !fullName || !dateOfBirth || !Number.isInteger(packageId) || packageId < 1 || !['MALE', 'FEMALE'].includes(gender)) {
      return { success: false, error: 'All core member details are required' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (!sendInviteLink && password.length < 8) || phoneNumber.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'Enter a valid email and phone number. If setting a password directly, it must be at least 8 characters.' };
    }
    if (!['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER'].includes(maritalStatus || '')) {
      return { success: false, error: 'Choose a valid marital status.' };
    }

    const input: ProvisionMemberInput = {
      email,
      password: sendInviteLink ? undefined : password,
      phoneNumber,
      fullName,
      gender: gender || 'MALE',
      dateOfBirth,
      maritalStatus,
      countryLivingIn,
      stateProvince,
      city,
      profession,
      educationLevel,
      guardianName,
      guardianRelation,
      guardianPhone,
      packageId,
      sendInviteLink,
    };

    const res = await provisionMemberInDb(input);
    if (!res.success || !('user' in res)) {
      return { success: false, error: ('error' in res ? res.error : 'Failed to provision member') };
    }

    revalidatePath('/admin');

    return {
      success: true,
      user: res.user,
      profile: res.profile,
      inviteToken: res.inviteToken,
      inviteUrl: res.inviteUrl,
      message: sendInviteLink
        ? `Member ${fullName} (${email}) created. A single-use 30-day setup invite was generated.`
        : `Member ${fullName} (${email}) created with direct password. The selected package was granted by an administrator.`,
    };
  } catch (err: any) {
    console.error('Error in adminProvisionMemberAction:', err);
    return { success: false, error: err.message || 'Failed to provision member' };
  }
}
