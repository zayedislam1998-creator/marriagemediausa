import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        tier: session.tier,
        profileId: session.profileId,
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
