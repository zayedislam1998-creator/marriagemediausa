import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR' | 'MEMBER';
export type MembershipTier = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ELITE';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  tier: MembershipTier;
  profileId?: string;
  contactCredits: number;
  dailyViewLimit: number;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'marriagemediausa-2026-sacred-production-secret-key-halal'
);

const COOKIE_NAME = 'mb_session';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Signs and encodes a JWT token containing session details
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns payload
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts session from NextRequest (for Edge Middleware)
 */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Retrieves the current session on the server
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Sets the HTTP-Only cookie on the response or cookies()
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
