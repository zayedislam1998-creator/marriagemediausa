'use server';

import { getCurrentSession } from '@/lib/auth/session';
import {
  saveMemberResumeInDb,
  getMemberResumesFromDb,
  deleteMemberResumeInDb,
} from '@/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

/**
 * Upload existing Matrimonial CV / Resume file (PDF, DOCX, Image)
 */
export async function uploadResumeAction(_prevState: any, formData: FormData) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required' };
    }

    const file = formData.get('resumeFile') as File | null;
    const title = (formData.get('title') as string) || 'Matrimonial Resume & Biodata';

    if (!file || file.size === 0) {
      return { success: false, error: 'Please select a valid resume document' };
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadsDir, { recursive: true });

    // Sanitize filename and create unique timestamped name
    const ext = file.name.split('.').pop() || 'pdf';
    const cleanName = `${session.userId}_${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, cleanName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/resumes/${cleanName}`;

    const resume = await saveMemberResumeInDb({
      userId: session.userId,
      resumeType: 'UPLOADED_FILE',
      title,
      fileName: file.name,
      fileUrl,
      fileSizeBytes: file.size,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      resume,
      message: 'Matrimonial CV uploaded and verified successfully',
    };
  } catch (err: any) {
    console.error('Error in uploadResumeAction:', err);
    return { success: false, error: err.message || 'Failed to upload CV' };
  }
}

/**
 * Save Word-Style Matrimonial CV Document
 */
export async function saveRichCvAction(_prevState: any, formData: FormData) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required' };
    }

    const title = (formData.get('title') as string) || 'Executive Islamic Matrimonial CV';
    const documentContent = formData.get('documentContent') as string;

    if (!documentContent || documentContent.trim().length === 0) {
      return { success: false, error: 'Document content cannot be empty' };
    }

    const resume = await saveMemberResumeInDb({
      userId: session.userId,
      resumeType: 'RICH_BUILDER',
      title,
      documentContent,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      resume,
      message: 'Matrimonial CV saved and formatted successfully',
    };
  } catch (err: any) {
    console.error('Error in saveRichCvAction:', err);
    return { success: false, error: err.message || 'Failed to save CV' };
  }
}

/**
 * Delete a CV
 */
export async function deleteResumeAction(resumeId: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required' };
    }

    await deleteMemberResumeInDb(resumeId, session.userId);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteResumeAction:', err);
    return { success: false, error: err.message || 'Failed to delete CV' };
  }
}

/**
 * Fetch member resumes
 */
export async function getMemberResumesAction() {
  try {
    const session = await getCurrentSession();
    if (!session || !session.userId) {
      return [];
    }

    return await getMemberResumesFromDb(session.userId);
  } catch (err) {
    console.error('Error fetching resumes:', err);
    return [];
  }
}
