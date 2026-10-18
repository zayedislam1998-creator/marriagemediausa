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

  // 5. Already logged in users accessing /login or /register
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      if (session.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      if (session.role === 'EDITOR') {
        return NextResponse.redirect(new URL('/admin/cms', req.url));
      }
      if (session.role === 'MODERATOR') {
        return NextResponse.redirect(new URL('/admin/kyc', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
