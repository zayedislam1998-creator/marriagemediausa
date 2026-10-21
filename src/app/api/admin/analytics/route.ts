import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, profiles, userSubscriptions, packages, paymentTransactions } from '@/db/schema';
import { and, eq, gt, sql } from 'drizzle-orm';
import { getVerifiedSession } from '@/lib/auth/verifiedSession';

export async function GET() {
  try {
    const session = await getVerifiedSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Super admin access required.' }, { status: 401 });
    }

    const now = new Date();
    const [userCountRes] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [memberCountRes] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'MEMBER'));
    const [profileCountRes] = await db.select({ count: sql<number>`count(*)` }).from(profiles);
    const [verifiedCountRes] = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.kycStatus, 'VERIFIED'));
    const activeSubFilter = and(eq(userSubscriptions.status, 'ACTIVE'), gt(userSubscriptions.expiresAt, now));
    const [totalSubsRes] = await db.select({ count: sql<number>`count(*)` }).from(userSubscriptions);
    const [activeSubsRes] = await db.select({ count: sql<number>`count(*)` }).from(userSubscriptions).where(activeSubFilter);

    // Revenue and transaction telemetry
    const realCompletedPayment = and(
      eq(paymentTransactions.status, 'COMPLETED'),
      sql`coalesce(${paymentTransactions.rawPayload}->>'simulated', 'false') <> 'true'`,
    );
    const [totalTxRes] = await db.select({ count: sql<number>`count(*)` }).from(paymentTransactions);
    const [completedTxRes] = await db.select({ count: sql<number>`count(*)` }).from(paymentTransactions).where(eq(paymentTransactions.status, 'COMPLETED'));
    const [realTxRes] = await db.select({ count: sql<number>`count(*)` }).from(paymentTransactions).where(realCompletedPayment);
    const [simulatedTxRes] = await db.select({ count: sql<number>`count(*)` }).from(paymentTransactions).where(sql`coalesce(${paymentTransactions.rawPayload}->>'simulated', 'false') = 'true'`);
    const [revenueRes] = await db.select({ sum: sql<string>`coalesce(sum(${paymentTransactions.amount}), 0)` })
      .from(paymentTransactions).where(realCompletedPayment);

    const allPackages = await db.select().from(packages).where(eq(packages.isActive, true)).orderBy(packages.id);
    const subBreakdown = await db.select({ packageId: userSubscriptions.packageId, count: sql<number>`count(*)` })
      .from(userSubscriptions).where(activeSubFilter).groupBy(userSubscriptions.packageId);
    const paymentBreakdown = await db.select({ packageId: paymentTransactions.packageId, revenue: sql<string>`coalesce(sum(${paymentTransactions.amount}), 0)` })
      .from(paymentTransactions).where(and(realCompletedPayment, sql`${paymentTransactions.packageId} is not null`))
      .groupBy(paymentTransactions.packageId);

    const subscriberCounts = new Map(subBreakdown.map((row) => [row.packageId, Number(row.count)]));
    const packageRevenue = new Map(paymentBreakdown.map((row) => [row.packageId, Number(row.revenue)]));
    const packageBreakdown = allPackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      priceUsd: Number(pkg.priceUsd),
      badgeTitle: pkg.badgeTitle || 'Member',
      subscriberCount: subscriberCounts.get(pkg.id) || 0,
      revenue: packageRevenue.get(pkg.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: Number(userCountRes?.count ?? 0),
        totalMembers: Number(memberCountRes?.count ?? 0),
        totalProfiles: Number(profileCountRes?.count ?? 0),
        verifiedProfiles: Number(verifiedCountRes?.count ?? 0),
        totalSubscriptions: Number(totalSubsRes?.count ?? 0),
        activeSubscriptions: Number(activeSubsRes?.count ?? 0),
        totalPaymentTransactions: Number(totalTxRes?.count ?? 0),
        completedPaymentTransactions: Number(completedTxRes?.count ?? 0),
        realPaymentTransactions: Number(realTxRes?.count ?? 0),
        simulatedTransactions: Number(simulatedTxRes?.count ?? 0),
        totalRevenue: Number(revenueRes?.sum || 0),
        packageBreakdown,
        lastUpdated: now.toISOString(),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.digest === 'HANGING_PROMISE_REJECTION' || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ success: false, error: 'Could not load current database analytics.' }, { status: 500 });
  }
}
