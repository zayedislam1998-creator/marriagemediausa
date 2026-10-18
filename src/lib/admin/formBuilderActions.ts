'use server';

import { getCurrentSession } from '@/lib/auth/session';
import {
  getFormBuilderConfigsFromDb,
  getFormBuilderConfigById,
  saveFormBuilderConfigInDb,
  FormBuilderField,
} from '@/db/queries';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all form builder configurations
 */
export async function getFormBuilderConfigsAction() {
  return await getFormBuilderConfigsFromDb();
}

/**
 * Save form builder configuration
 */
export async function saveFormBuilderConfigAction(
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
    const session = await getCurrentSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
      return { success: false, error: 'Unauthorized: Admin role required' };
    }

    const saved = await saveFormBuilderConfigInDb(formId, data);
    revalidatePath('/admin');

    return {
      success: true,
      config: saved,
      message: '✓ Form layout & theme published successfully',
    };
  } catch (err: any) {
    console.error('Error saving form builder config:', err);
    return {
      success: false,
      error: err.message || 'Failed to save form configuration',
    };
  }
}
