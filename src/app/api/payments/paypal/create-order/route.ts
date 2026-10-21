import { NextRequest, NextResponse } from 'next/server';
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
      amountUsd = Number(pkg.priceUsd);
      targetCredits = pkg.contactCredits;
    } else if (type === 'WALLET_TOPUP') {
      targetCredits = Number(credits);
      if (!walletPacks[targetCredits]) return NextResponse.json({ success: false, error: 'Choose one of the available credit packs.' }, { status: 400 });
      amountUsd = walletPacks[targetCredits];
      title = `MuslimBibah: ${targetCredits} Contact Credits`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payment type.' }, { status: 400 });
    }

    const config = await GatewayConfigService.getGatewayConfig('PAYPAL');
    if (!config?.isActive || !config.publicKey || !config.secretKey || config.secretKey.toLowerCase().includes('placeholder')) {
      return NextResponse.json({ success: false, error: 'PayPal is not configured for checkout. An administrator must add and verify the gateway credentials.' }, { status: 503 });
    }

    const baseUrl = config.mode === 'TEST' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const auth = Buffer.from(`${config.publicKey}:${config.secretKey}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials', cache: 'no-store',
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) throw new Error('PayPal could not authenticate these credentials.');

    const createRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
          description: title,
          custom_id: JSON.stringify({ userId: user.id, type, packageId: selectedPackage?.id ?? null, credits: targetCredits }),
        }],
        application_context: { brand_name: 'MuslimBibah.com', user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING' },
      }),
      cache: 'no-store',
    });
    const order = await createRes.json();
    if (!createRes.ok || !order.id) throw new Error('PayPal could not create a checkout order.');

    await db.insert(paymentTransactions).values({
      userId: user.id, gateway: 'PAYPAL', gatewayTransactionId: order.id,
      amount: amountUsd.toFixed(2), currency: 'USD', status: 'PENDING', paymentType: type,
      packageId: selectedPackage?.id ?? null, creditsPurchased: targetCredits,
      rawPayload: {
        orderId: order.id,
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

    return NextResponse.json({ success: true, orderId: order.id, links: order.links });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ success: false, error: 'Could not start secure checkout. Please try again.' }, { status: 500 });
  }
}
