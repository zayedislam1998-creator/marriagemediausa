'use server';

import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import {
  getProfileRequirementsFromDb,
  updateProfileRequirementInDb,
  ProfileRequirementRecord,
} from '@/db/queries';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all profile requirements
 */
export async function getProfileRequirementsAction(): Promise<ProfileRequirementRecord[]> {
  return await getProfileRequirementsFromDb();
}

/**
 * Update an individual requirement rule
 */
export async function updateProfileRequirementAction(
  id: string,
  updates: Partial<ProfileRequirementRecord>
) {
  try {
    const session = await getVerifiedSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
      return { success: false, error: 'Unauthorized: Admin role required' };
    }

    const updated = await updateProfileRequirementInDb(id, updates);
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      requirement: updated,
    };
  } catch (err: any) {
    console.error('Error updating requirement:', err);
    return {
      success: false,
      error: err.message || 'Failed to update requirement rule',
    };
  }
}
