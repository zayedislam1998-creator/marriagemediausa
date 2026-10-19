import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    await clearSessionCookie();
    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
    res.cookies.set('mb_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to clear session' }, { status: 500 });
  }
}
