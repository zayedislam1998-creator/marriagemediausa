import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to clear session' }, { status: 500 });
  }
}
