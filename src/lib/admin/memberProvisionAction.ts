'use server';

import { getCurrentSession } from '@/lib/auth/session';
import { provisionMemberInDb, ProvisionMemberInput } from '@/db/queries';
import { revalidatePath } from 'next/cache';

/**
 * Super Admin Action to provision a verified member directly in PostgreSQL 18
 */
export async function adminProvisionMemberAction(_prevState: any, formData: FormData) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized: Super Admin access required' };
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const fullName = formData.get('fullName') as string;
    const gender = formData.get('gender') as 'MALE' | 'FEMALE';
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const tier = (formData.get('tier') as any) || 'FREE';
    const profession = (formData.get('profession') as string) || 'Professional';
    const educationLevel = (formData.get('educationLevel') as string) || "Bachelor's Degree";
    const countryLivingIn = (formData.get('countryLivingIn') as string) || 'United States (USA)';
    const city = (formData.get('city') as string) || 'New York';
    const stateProvince = (formData.get('stateProvince') as string) || 'New York';
    const maritalStatus = (formData.get('maritalStatus') as any) || 'NEVER_MARRIED';
    const guardianName = formData.get('guardianName') as string | undefined;
    const guardianRelation = formData.get('guardianRelation') as string | undefined;
    const guardianPhone = formData.get('guardianPhone') as string | undefined;

    if (!email || !password || !phoneNumber || !fullName || !dateOfBirth) {
      return { success: false, error: 'All core member details are required' };
    }

    const input: ProvisionMemberInput = {
      email,
      password,
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
      tier,
    };

    const res = await provisionMemberInDb(input);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath('/admin');

    return {
      success: true,
      user: res.user,
      profile: res.profile,
      message: `✓ Member ${fullName} (${email}) provisioned successfully with ${tier} tier!`,
    };
  } catch (err: any) {
    console.error('Error in adminProvisionMemberAction:', err);
    return { success: false, error: err.message || 'Failed to provision member' };
  }
}
