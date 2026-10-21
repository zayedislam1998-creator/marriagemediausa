'use server';

import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import { AdminStore } from './store';
import { db } from '@/db';
import { users } from '@/db/schema';
import {
  getAllMembersForAdmin,
  submitSuccessStoryInDb,
  getAllCmsStoriesFromDb,
  toggleCmsStoryPublishInDb,
  deleteCmsStoryInDb,
  saveCmsArticleInDb,
  getCmsArticlesFromDb,
  toggleCmsArticlePublishInDb,
  deleteCmsArticleInDb,
  saveCmsPageSectionInDb,
  getCmsPageSectionFromDb,
  getAllCmsPageSectionsFromDb,
} from '@/db/queries';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

const ADMIN_ACCOUNT_ROLES = ['SUPER_ADMIN', 'EDITOR', 'MODERATOR'] as const;

export async function getAdminMembersAction() {
  const session = await getVerifiedSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false as const, error: 'Super Admin access is required.', members: [] };
  }

  const members = await getAllMembersForAdmin();
  return { success: true as const, members };
}

export async function createAdminAccountAction(formData: FormData) {
  const session = await getVerifiedSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false as const, error: 'Super Admin access is required.' };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const phoneNumber = String(formData.get('phoneNumber') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const roleValue = String(formData.get('role') || 'SUPER_ADMIN');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false as const, error: 'Enter a valid email address.' };
  }
  if (phoneNumber.replace(/\D/g, '').length < 7) {
    return { success: false as const, error: 'Enter a valid phone number with country code.' };
  }
  if (password.length < 12) {
    return { success: false as const, error: 'Use a password with at least 12 characters.' };
  }
  if (password !== confirmPassword) {
    return { success: false as const, error: 'The passwords do not match.' };
  }
  if (!ADMIN_ACCOUNT_ROLES.includes(roleValue as (typeof ADMIN_ACCOUNT_ROLES)[number])) {
    return { success: false as const, error: 'Choose a valid administrator role.' };
  }

  const role = roleValue as UserRole;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)))
      .limit(1);

    if (existing.length) {
      return { success: false as const, error: 'This email or phone number is already registered.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [createdUser] = await db
      .insert(users)
      .values({
        email,
        phoneNumber,
        passwordHash,
        role,
        isActive: true,
        isVerified: false,
      })
      .returning({ id: users.id, email: users.email, phoneNumber: users.phoneNumber, role: users.role });

    revalidatePath('/admin');
    return { success: true as const, user: { ...createdUser, role: createdUser.role as UserRole } };
  } catch (error) {
    console.error('Create admin account failed:', error);
    return { success: false as const, error: 'Could not create the account. Check the database and try again.' };
  }
}

export async function inviteSeatAction(prevState: any, formData: FormData) {
  const session = await getVerifiedSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin permissions required.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR';

  if (!name || !email || !role) {
    return { success: false, error: 'Name, Email and Role are required.' };
  }

  try {
    const seat = AdminStore.inviteSeat(name, email, role);
    return { success: true, seat };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to invite team seat.' };
  }
}

export async function toggleSeatStatusAction(seatId: string) {
  const session = await getVerifiedSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin permissions required.' };
  }

  const seat = AdminStore.toggleSeatStatus(seatId);
  if (!seat) {
    return { success: false, error: 'Seat not found.' };
  }

  return { success: true, seat };
}

export async function updateKycStatusAction(
  submissionId: string,
  status: 'VERIFIED' | 'REJECTED',
  notes?: string
) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MODERATOR')) {
    return { success: false, error: 'Unauthorized: Moderator permissions required.' };
  }

  const sub = AdminStore.updateKycStatus(submissionId, status, notes);
  if (!sub) {
    return { success: false, error: 'KYC submission not found.' };
  }

  return { success: true, submission: sub };
}

export async function updateFraudStatusAction(
  ticketId: string,
  status: 'OPEN' | 'WARNED' | 'SUSPENDED' | 'BANNED'
) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MODERATOR')) {
    return { success: false, error: 'Unauthorized: Moderator permissions required.' };
  }

  const ticket = AdminStore.updateFraudStatus(ticketId, status);
  if (!ticket) {
    return { success: false, error: 'Fraud ticket not found.' };
  }

  return { success: true, ticket };
}

export async function createCmsStoryAction(prevState: any, formData: FormData) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const couple = (formData.get('couple') as string)?.trim();
  const date = (formData.get('date') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();
  const excerpt = (formData.get('excerpt') as string)?.trim();
  const photoUrl = (formData.get('photoUrl') as string)?.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

  if (!title || !couple || !excerpt) {
    return { success: false, error: 'Story title, couple names, and testimonial body are required.' };
  }

  const combinedStoryBody = location ? `${excerpt}\n\nLocation: ${location}` : excerpt;

  const res = await submitSuccessStoryInDb({
    title,
    coupleNames: couple,
    weddingDate: date || undefined,
    imageUrl: photoUrl,
    storyBody: combinedStoryBody,
    isPublished: true,
  });

  if (!res.success || !res.story) {
    return { success: false, error: res.error || 'Failed to save couple story in PostgreSQL.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/stories');
  revalidatePath('/');

  return { success: true, story: res.story };
}

export async function toggleCmsStoryPublishAction(id: number, isPublished: boolean) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const res = await toggleCmsStoryPublishInDb(id, isPublished);
  if (!res.success) {
    return { success: false, error: res.error || 'Failed to update story status.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/stories');
  revalidatePath('/');

  return { success: true, story: res.story };
}

export async function deleteCmsStoryAction(id: number) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const res = await deleteCmsStoryInDb(id);
  if (!res.success) {
    return { success: false, error: res.error || 'Failed to delete story.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/stories');
  revalidatePath('/');

  return { success: true };
}

export async function createCmsArticleAction(prevState: any, formData: FormData) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const category = ((formData.get('category') as string) || 'Sunnah Ethics').trim();
  const author = ((formData.get('author') as string) || 'MuslimBibah Editorial Desk').trim();
  const excerpt = ((formData.get('excerpt') as string) || title).trim();
  const content = ((formData.get('content') as string) || excerpt).trim();

  if (!title) {
    return { success: false, error: 'Article title is required.' };
  }

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100) + '-' + Date.now().toString().slice(-4);

  const res = await saveCmsArticleInDb({
    title,
    slug,
    category,
    author,
    excerpt,
    content,
    isPublished: true,
  });

  if (!res.success || !res.article) {
    return { success: false, error: res.error || 'Failed to save CMS article in PostgreSQL.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/');

  return { success: true, article: res.article };
}

export async function toggleCmsArticlePublishAction(id: number, isPublished: boolean) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const res = await toggleCmsArticlePublishInDb(id, isPublished);
  if (!res.success) {
    return { success: false, error: res.error || 'Failed to update article status.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/');

  return { success: true, article: res.article };
}

export async function deleteCmsArticleAction(id: number) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const res = await deleteCmsArticleInDb(id);
  if (!res.success) {
    return { success: false, error: res.error || 'Failed to delete article.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/');

  return { success: true };
}

export async function saveCmsPageSectionAction(data: {
  pageKey: string;
  sectionKey: string;
  title?: string;
  contentJson: any;
  isPublished?: boolean;
}) {
  const session = await getVerifiedSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const res = await saveCmsPageSectionInDb({
    pageKey: data.pageKey,
    sectionKey: data.sectionKey,
    title: data.title,
    contentJson: data.contentJson,
    isPublished: data.isPublished,
    userId: session.userId,
  });

  if (!res.success) {
    return { success: false, error: res.error || 'Failed to save page section.' };
  }

  revalidatePath('/admin/cms');
  revalidatePath('/');
  revalidatePath('/how-it-works');
  revalidatePath('/why-us');
  revalidatePath('/services');
  revalidatePath('/contact');

  return { success: true, section: res.section };
}

