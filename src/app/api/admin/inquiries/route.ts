import { NextResponse } from 'next/server';
import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import { getContactSubmissionsForAdmin, updateContactSubmissionStatusInDb } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getVerifiedSession();
    if (!session || !(['SUPER_ADMIN', 'EDITOR', 'MODERATOR'] as const).includes(session.role as any)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDatabaseReady();
    const inquiries = await getContactSubmissionsForAdmin();

    return NextResponse.json(
      { success: true, inquiries },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error fetching admin inquiries:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED']),
  adminNotes: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getVerifiedSession();
    if (!session || !(['SUPER_ADMIN', 'EDITOR', 'MODERATOR'] as const).includes(session.role as any)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDatabaseReady();
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const res = await updateContactSubmissionStatusInDb(
      parsed.data.id,
      parsed.data.status,
      parsed.data.adminNotes
    );

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'Failed to update' }, { status: 400 });
    }

    return NextResponse.json({ success: true, submission: res.submission });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error updating inquiry status:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
