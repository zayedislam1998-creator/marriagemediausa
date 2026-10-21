'use server';

import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import {
  createPackageInDb,
  updatePackageInDb,
  togglePackageActiveInDb,
  deletePackageInDb,
  getAllPackagesFromDb,
  assignUserSubscriptionTierInDb,
} from '@/db/queries';
import { AdminStore } from './store';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new package in PostgreSQL
 */
export async function adminCreatePackageAction(prevState: any, formData: FormData) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized: Only Super Admin can create pricing packages.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const priceUsd = parseFloat((formData.get('priceUsd') as string) || '0');
    const durationMonths = parseInt((formData.get('durationMonths') as string) || '1', 10);
    const contactCredits = parseInt((formData.get('contactCredits') as string) || '0', 10);
    const dailyProfileViewLimit = parseInt((formData.get('dailyProfileViewLimit') as string) || '10', 10);
    const badgeTitle = (formData.get('badgeTitle') as string)?.trim() || 'Verified Member';
    const featuresRaw = (formData.get('features') as string) || '';

    if (!name || isNaN(priceUsd)) {
      return { success: false, error: 'Valid package name and price are required.' };
    }

    // Split features by newline or semicolon
    const featuresJson = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const created = await createPackageInDb({
      name,
      priceUsd,
      durationMonths,
      contactCredits,
      dailyProfileViewLimit,
      badgeTitle,
      featuresJson,
      isActive: true,
    });

    AdminStore.addAuditLog(
      'Package Created',
      session.email,
      `Created package "${name}" priced at $${priceUsd.toFixed(2)} USD in PostgreSQL`,
      'SUCCESS'
    );

    revalidatePath('/admin');
    revalidatePath('/membership-plan');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Package "${name}" created successfully in PostgreSQL!`,
      package: created,
    };
  } catch (error: any) {
    console.error('Error creating package:', error);
    return { success: false, error: error.message || 'Failed to create package in database.' };
  }
}

/**
 * Updates an existing package in PostgreSQL
 */
export async function adminUpdatePackageAction(id: number, formData: FormData) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized: Only Super Admin can modify pricing packages.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const priceUsd = parseFloat((formData.get('priceUsd') as string) || '0');
    const durationMonths = parseInt((formData.get('durationMonths') as string) || '1', 10);
    const contactCredits = parseInt((formData.get('contactCredits') as string) || '0', 10);
    const dailyProfileViewLimit = parseInt((formData.get('dailyProfileViewLimit') as string) || '10', 10);
    const badgeTitle = (formData.get('badgeTitle') as string)?.trim();
    const featuresRaw = (formData.get('features') as string) || '';

    const featuresJson = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const updated = await updatePackageInDb(id, {
      name,
      priceUsd,
      durationMonths,
      contactCredits,
      dailyProfileViewLimit,
      badgeTitle,
      featuresJson,
    });

    AdminStore.addAuditLog(
      'Package Updated',
      session.email,
      `Updated package #${id} (${name}) details in PostgreSQL`,
      'SUCCESS'
    );

    revalidatePath('/admin');
    revalidatePath('/membership-plan');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Package "${name}" updated successfully in PostgreSQL!`,
      package: updated,
    };
  } catch (error: any) {
    console.error('Error updating package:', error);
    return { success: false, error: error.message || 'Failed to update package in database.' };
  }
}

/**
 * Toggles a package's active status
 */
export async function adminTogglePackageAction(id: number, isActive: boolean) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized.' };
    }

    const updated = await togglePackageActiveInDb(id, isActive);

    AdminStore.addAuditLog(
      'Package Status Toggled',
      session.email,
      `Package #${id} status changed to ${isActive ? 'Active' : 'Inactive'}`,
      'INFO'
    );

    revalidatePath('/admin');
    revalidatePath('/membership-plan');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return { success: true, package: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update status.' };
  }
}

/**
 * Deletes a package from PostgreSQL
 */
export async function adminDeletePackageAction(id: number) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized.' };
    }

    await deletePackageInDb(id);

    AdminStore.addAuditLog(
      'Package Deleted',
      session.email,
      `Deleted package #${id} from PostgreSQL`,
      'WARNING'
    );

    revalidatePath('/admin');
    revalidatePath('/membership-plan');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return { success: true, message: `Package #${id} removed.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete package.' };
  }
}

/**
 * Assigns a membership tier mode (Gold, Bronze, Silver, Diamond, Elite) to a member in PostgreSQL & syncs
 */
export async function adminAssignMemberTierAction(
  userId: string,
  packageId: number
) {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized: Only Administrator can assign membership tiers.' };
    }

    const res = await assignUserSubscriptionTierInDb(userId, packageId);
    if ('error' in res) {
      return { success: false, error: res.error || 'Failed to update subscription in database.' };
    }

    AdminStore.addAuditLog(
      'Tier Mode Granted',
      session.email,
      `Granted package #${packageId} to member ${userId} (${res.packageName}) without recording payment`,
      'SUCCESS'
    );

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Successfully granted ${res.packageName} to member as an admin grant.`,
      packageName: res.packageName,
    };
  } catch (error: any) {
    console.error('Error assigning member tier:', error);
    return { success: false, error: error.message || 'Failed to assign tier mode.' };
  }
}
