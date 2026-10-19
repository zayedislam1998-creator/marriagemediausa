import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  // 1. Guard /admin (Super Admin only - except CMS and KYC subpaths which have their own rules)
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/cms') &&
    !pathname.startsWith('/admin/kyc')
  ) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'admin_unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard /admin/cms (Super Admin and Editor)
  if (pathname.startsWith('/admin/cms')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'editor_unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guard /admin/kyc (Super Admin and Moderator)
  if (pathname.startsWith('/admin/kyc')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'SUPER_ADMIN' && session.role !== 'MODERATOR') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'moderator_unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Guard /dashboard (Authenticated Member or Admin)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Handling /login or /register requests
  if (pathname === '/login' || pathname === '/register') {
    const searchParams = req.nextUrl.searchParams;
    const hasErrorParam = searchParams.has('error');
    const hasLogoutParam = searchParams.has('logout') || searchParams.has('logged_out');

    // If explicit logout or error parameter is present, ensure mb_session is purged
    if (hasErrorParam || hasLogoutParam) {
      const response = NextResponse.next();
      response.cookies.set('mb_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        expires: new Date(0),
      });
      response.cookies.delete('mb_session');
      return response;
    }

    // Allow user to access /login and /register directly without forced auto-redirection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
