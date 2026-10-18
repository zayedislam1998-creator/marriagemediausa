'use server';

import { biodataSchema, calculateCompletionScore } from './schema';
import { getCurrentSession } from '@/lib/auth/session';
import { storageDriver } from '@/lib/storage/LocalStorageDriver';
import { redirect } from 'next/navigation';

export async function saveBiodataAction(prevState: any, formData: FormData) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Please sign in to save your matrimonial biodata.' };
  }

  // Parse fields from formData into object
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  // Convert boolean fields
  if (rawData.wearsHijabOrBeard !== undefined) {
    rawData.wearsHijabOrBeard = rawData.wearsHijabOrBeard === 'true' || rawData.wearsHijabOrBeard === 'on';
  }
  if (rawData.guardianVerified !== undefined) {
    rawData.guardianVerified = rawData.guardianVerified === 'true' || rawData.guardianVerified === 'on';
  }

  const validation = biodataSchema.safeParse(rawData);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.format());
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Please check all required fields.',
    };
  }

  const validData = validation.data;
  const completionScore = calculateCompletionScore(validData);

  console.log(`✅ Biodata validated for ${validData.fullName}. Completion score: ${completionScore}%`);

  redirect('/dashboard?biodata_saved=true');
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const file = formData.get('photo') as File;
    if (!file || file.size === 0) {
      return { success: false, error: 'No image file provided.' };
    }

    // Verify MIME type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be a valid image (JPEG, PNG, WebP).' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storageDriver.uploadAvatar(buffer, file.name);

    return {
      success: true,
      fullUrl: result.fullUrl,
      thumbUrl: result.thumbUrl,
      blurUrl: result.blurUrl,
      fileName: result.fileName,
    };
  } catch (err: any) {
    console.error('Avatar upload failed:', err);
    return { success: false, error: err.message || 'Image processing failed.' };
  }
}

export async function uploadKycDocumentAction(formData: FormData) {
  try {
    const file = formData.get('kycFile') as File;
    if (!file || file.size === 0) {
      return { success: false, error: 'No KYC document provided.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const privatePath = await storageDriver.uploadPrivateKyc(buffer, file.name);

    return {
      success: true,
      privatePath,
    };
  } catch (err: any) {
    console.error('KYC upload failed:', err);
    return { success: false, error: err.message || 'Document upload failed.' };
  }
}
