'use server';

import { getCurrentSession } from '@/lib/auth/session';
import { AdminStore } from './store';

export async function inviteSeatAction(prevState: any, formData: FormData) {
  const session = await getCurrentSession();
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
  const session = await getCurrentSession();
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
  const session = await getCurrentSession();
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
  const session = await getCurrentSession();
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
  const session = await getCurrentSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const title = formData.get('title') as string;
  const couple = formData.get('couple') as string;
  const date = formData.get('date') as string;
  const location = formData.get('location') as string;
  const excerpt = formData.get('excerpt') as string;
  const photoUrl = (formData.get('photoUrl') as string) || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

  if (!title || !couple || !date || !excerpt) {
    return { success: false, error: 'Please fill in all story fields.' };
  }

  const story = AdminStore.addStory({
    title,
    couple,
    date,
    location: location || 'United States',
    excerpt,
    photoUrl,
    status: 'PUBLISHED',
  });

  return { success: true, story };
}

export async function createCmsArticleAction(prevState: any, formData: FormData) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
    return { success: false, error: 'Unauthorized: Editor permissions required.' };
  }

  const title = formData.get('title') as string;
  const category = (formData.get('category') as string) || 'Islamic Guidance';
  const author = (formData.get('author') as string) || 'Marriage Media USA Editorial Desk';

  if (!title) {
    return { success: false, error: 'Article title is required.' };
  }

  const article = AdminStore.addArticle({
    title,
    category,
    author,
    publishedDate: new Date().toISOString().split('T')[0],
    status: 'PUBLISHED',
  });

  return { success: true, article };
}
