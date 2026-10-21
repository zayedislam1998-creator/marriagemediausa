import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getCurrentSession } from '@/lib/auth/session';

export async function getVerifiedSession() {
  const session = await getCurrentSession();
  if (!session) return null;
  const [user] = await db.select({ id: users.id, email: users.email, role: users.role, isActive: users.isActive })
    .from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user?.isActive) return null;
  return { ...session, email: user.email, role: user.role };
}
