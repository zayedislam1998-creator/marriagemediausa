import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, profiles, userSubscriptions, packages, paymentTransactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' as any)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    // 1. Total Registered Members (excluding super admins)
    const [memberCountRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'MEMBER'));
    const totalMembers = Number(memberCountRes?.count ?? 0);

    // 2. Total Profiles in PostgreSQL
    const [profileCountRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles);
    const totalProfiles = Number(profileCountRes?.count ?? 0);

    // 3. Verified Profiles (KYC verified or approved by admin)
    const [verifiedCountRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(sql`${profiles.kycStatus} = 'VERIFIED' OR ${profiles.isApproved} = true`);
    const verifiedProfiles = Number(verifiedCountRes?.count ?? 0);

    // 4. Real Active Subscriptions
    const [activeSubsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.status, 'ACTIVE'));
    const activeSubscriptions = Number(activeSubsRes?.count ?? 0);

    // 5. Real Platform Revenue from completed payment transactions
    const [revenueRes] = await db
      .select({ sum: sql<string>`coalesce(sum(${paymentTransactions.amount}), 0)` })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'COMPLETED'));
    let totalRevenue = parseFloat(revenueRes?.sum || '0');

    // If no completed payment_transactions records exist yet, compute from active paid subscriptions
    if (totalRevenue === 0 && activeSubscriptions > 0) {
      const [subRevenueRes] = await db
        .select({ sum: sql<string>`coalesce(sum(${userSubscriptions.pricePaidUsd}), 0)` })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.status, 'ACTIVE'));
      totalRevenue = parseFloat(subRevenueRes?.sum || '0');
    }

    // 6. Real Economic Breakdown across active packages
    const allPackages = await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(packages.id);

    // Count subscriptions per package
    const subBreakdown = await db
      .select({
        packageId: userSubscriptions.packageId,
        count: sql<number>`count(*)`,
        totalPaid: sql<string>`coalesce(sum(${userSubscriptions.pricePaidUsd}), 0)`,
      })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.status, 'ACTIVE'))
      .groupBy(userSubscriptions.packageId);

    const breakdownMap = new Map<number, { count: number; totalPaid: number }>();
    subBreakdown.forEach((b) => {
      breakdownMap.set(b.packageId, { count: Number(b.count), totalPaid: parseFloat(b.totalPaid) });
    });

    const packageBreakdown = allPackages.map((pkg) => {
      const stats = breakdownMap.get(pkg.id) || { count: 0, totalPaid: 0 };
      const price = parseFloat(pkg.priceUsd);
      const computedRevenue = stats.totalPaid > 0 ? stats.totalPaid : price * stats.count;

      return {
        id: pkg.id,
        name: pkg.name,
        priceUsd: price,
        badgeTitle: pkg.badgeTitle || 'Member',
        subscriberCount: stats.count,
        revenue: computedRevenue,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalMembers: totalMembers > 0 ? totalMembers : totalProfiles,
        totalProfiles,
        verifiedProfiles,
        activeSubscriptions,
        totalRevenue,
        packageBreakdown,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
