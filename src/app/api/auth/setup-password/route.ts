import { NextResponse } from 'next/server';
import { verifyInviteTokenFromDb, setupPasswordWithInviteTokenInDb } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token query parameter missing.' }, { status: 400 });
    }

    const verification = await verifyInviteTokenFromDb(token);
    if (!verification.valid) {
      return NextResponse.json({ success: false, error: verification.error || 'Invalid or expired token.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: verification.user,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error verifying invite token in /api/auth/setup-password:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify invitation.' }, { status: 500 });
  }
}

const setupPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid token'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();

    const parsed = setupPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const res = await setupPasswordWithInviteTokenInDb(parsed.data.token, parsed.data.password);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'Failed to setup password' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: res.email,
      message: 'Password successfully created! You may now sign in to your MuslimBibah account.',
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error setting up password in /api/auth/setup-password:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to complete password setup.' }, { status: 500 });
  }
}
