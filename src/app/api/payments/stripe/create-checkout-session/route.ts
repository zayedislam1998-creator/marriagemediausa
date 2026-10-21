import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';
import { getCurrentSession } from '@/lib/auth/session';
import { db } from '@/db';
import { packages, paymentTransactions, users } from '@/db/schema';

const walletPacks: Record<number, number> = { 10: 15, 30: 35, 80: 75, 200: 150 };

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, error: 'Please sign in before checkout.' }, { status: 401 });
    const [user] = await db.select().from(users).where(and(eq(users.id, session.userId), eq(users.isActive, true))).limit(1);
    if (!user) return NextResponse.json({ success: false, error: 'Account is unavailable.' }, { status: 403 });

    const body = await req.json();
    const { type, packageId, credits } = body;
    let title: string;
    let description: string;
    let amountUsd: number;
    let targetCredits = 0;
    let selectedPackage: typeof packages.$inferSelect | null = null;

    if (type === 'MEMBERSHIP_SUBSCRIPTION') {
      const id = Number(packageId);
      if (!Number.isInteger(id) || id < 1) return NextResponse.json({ success: false, error: 'Choose a valid membership package.' }, { status: 400 });
      const [pkg] = await db.select().from(packages).where(and(eq(packages.id, id), eq(packages.isActive, true))).limit(1);
      if (!pkg) return NextResponse.json({ success: false, error: 'This membership package is unavailable.' }, { status: 404 });
      if (Number(pkg.priceUsd) <= 0) return NextResponse.json({ success: false, error: 'Free packages do not need payment checkout.' }, { status: 400 });
      selectedPackage = pkg;
      title = `MuslimBibah: ${pkg.name}`;
      description = `${pkg.durationMonths} month(s) • ${pkg.contactCredits} contact credits • ${pkg.dailyProfileViewLimit} daily profile views`;
      amountUsd = Number(pkg.priceUsd);
      targetCredits = pkg.contactCredits;
    } else if (type === 'WALLET_TOPUP') {
      targetCredits = Number(credits);
      if (!walletPacks[targetCredits]) return NextResponse.json({ success: false, error: 'Choose one of the available credit packs.' }, { status: 400 });
      amountUsd = walletPacks[targetCredits];
      title = `MuslimBibah: ${targetCredits} Contact Credits`;
      description = 'Contact unlock credits';
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payment type.' }, { status: 400 });
    }

    const config = await GatewayConfigService.getGatewayConfig('STRIPE');
    if (!config?.isActive || !config.secretKey || !config.webhookSecret || config.secretKey.toLowerCase().includes('placeholder')) {
      return NextResponse.json({ success: false, error: 'Stripe is not configured for checkout. An administrator must add and verify the gateway credentials.' }, { status: 503 });
    }
    const expectedPrefix = config.mode === 'LIVE' ? 'sk_live_' : 'sk_test_';
    if (!config.secretKey.startsWith(expectedPrefix)) {
      return NextResponse.json({ success: false, error: `Stripe ${config.mode} mode does not match the configured secret key.` }, { status: 503 });
    }

    const stripe = new Stripe(config.secretKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price_data: { currency: 'usd', product_data: { name: title, description }, unit_amount: Math.round(amountUsd * 100) }, quantity: 1 }],
      success_url: `${appUrl}/dashboard?payment=processing&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
      metadata: {
        userId: user.id,
        type,
        packageId: selectedPackage ? String(selectedPackage.id) : '',
        credits: String(targetCredits),
        durationMonths: selectedPackage ? String(selectedPackage.durationMonths) : '0',
      },
    });

    await db.insert(paymentTransactions).values({
      userId: user.id,
      gateway: 'STRIPE',
      gatewayTransactionId: checkout.id,
      amount: amountUsd.toFixed(2),
      currency: 'USD',
      status: 'PENDING',
      paymentType: type,
      packageId: selectedPackage?.id ?? null,
      creditsPurchased: targetCredits,
      rawPayload: {
        checkoutSessionId: checkout.id,
        mode: config.mode,
        packageSnapshot: selectedPackage ? {
          id: selectedPackage.id,
          name: selectedPackage.name,
          durationMonths: selectedPackage.durationMonths,
          contactCredits: selectedPackage.contactCredits,
          priceUsd: amountUsd.toFixed(2),
        } : null,
      },
    }).onConflictDoNothing();

    return NextResponse.json({ success: true, url: checkout.url, sessionId: checkout.id });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ success: false, error: 'Could not start secure checkout. Please try again.' }, { status: 500 });
  }
}
