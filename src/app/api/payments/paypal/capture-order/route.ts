import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';
import { getCurrentSession } from '@/lib/auth/session';
import { db } from '@/db';
import { paymentTransactions, userSubscriptions, users, walletLedger } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, error: 'Please sign in to capture this payment.' }, { status: 401 });
    const { orderId } = await req.json();
    if (typeof orderId !== 'string' || !/^[A-Z0-9-]{5,255}$/i.test(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid PayPal order ID.' }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(and(eq(users.id, session.userId), eq(users.isActive, true))).limit(1);
    if (!user) return NextResponse.json({ success: false, error: 'Account is unavailable.' }, { status: 403 });
    const [pending] = await db.select().from(paymentTransactions).where(and(
      eq(paymentTransactions.gateway, 'PAYPAL'),
      eq(paymentTransactions.gatewayTransactionId, orderId),
      eq(paymentTransactions.userId, user.id),
    )).limit(1);
    if (!pending) return NextResponse.json({ success: false, error: 'This checkout order does not belong to your account.' }, { status: 404 });
    if (pending.status === 'COMPLETED') return NextResponse.json({ success: true, alreadyFulfilled: true });
    if (pending.status !== 'PENDING') return NextResponse.json({ success: false, error: 'This payment is no longer pending.' }, { status: 409 });

    const config = await GatewayConfigService.getGatewayConfig('PAYPAL');
    if (!config?.isActive || !config.publicKey || !config.secretKey || config.secretKey.toLowerCase().includes('placeholder')) {
      return NextResponse.json({ success: false, error: 'PayPal is not configured for payment capture.' }, { status: 503 });
    }
    const baseUrl = config.mode === 'TEST' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const auth = Buffer.from(`${config.publicKey}:${config.secretKey}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials', cache: 'no-store',
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) throw new Error('PayPal authentication failed.');
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST', headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const capture = await captureRes.json();
    if (!captureRes.ok || capture.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'PayPal has not confirmed a completed payment.' }, { status: 402 });
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const captureDetails = purchaseUnit?.payments?.captures?.[0];
    const paidAmount = captureDetails?.amount || purchaseUnit?.amount;
    if (capture.purchase_units?.length !== 1 || paidAmount?.currency_code !== pending.currency ||
        Number(paidAmount?.value).toFixed(2) !== Number(pending.amount).toFixed(2) ||
        captureDetails?.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'The captured amount or currency does not match the recorded order.' }, { status: 409 });
    }
    let custom: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = JSON.parse(purchaseUnit.custom_id || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        custom = parsed as Record<string, unknown>;
      }
    } catch {
      custom = null;
    }
    if (!custom || custom.userId !== user.id || custom.type !== pending.paymentType ||
        (Number(custom.packageId) || null) !== (pending.packageId ?? null) ||
        Number(custom.credits) !== pending.creditsPurchased) {
      return NextResponse.json({ success: false, error: 'PayPal order details do not match this account and purchase.' }, { status: 409 });
    }

    const result = await db.transaction(async (tx) => {
      const [locked] = await tx.select().from(paymentTransactions)
        .where(eq(paymentTransactions.id, pending.id)).for('update').limit(1);
      if (!locked) throw new Error('Payment record was not found.');
      if (locked.status === 'COMPLETED') return { alreadyFulfilled: true };
      if (locked.status !== 'PENDING') throw new Error('Payment is no longer pending.');

      const [updated] = await tx.update(paymentTransactions).set({
        status: 'COMPLETED', updatedAt: new Date(), rawPayload: capture,
      }).where(and(eq(paymentTransactions.id, locked.id), eq(paymentTransactions.status, 'PENDING'))).returning();
      if (!updated) throw new Error('Payment was already processed.');

      if (locked.paymentType === 'MEMBERSHIP_SUBSCRIPTION' && locked.packageId) {
        const rawPayload = locked.rawPayload as { packageSnapshot?: {
          id?: number;
          priceUsd?: string;
          contactCredits?: number;
          durationMonths?: number;
        } } | null;
        const snapshot = rawPayload?.packageSnapshot;
        const snapshotDuration = snapshot?.durationMonths;
        if (!snapshot || snapshot.id !== locked.packageId || Number(snapshot.priceUsd).toFixed(2) !== Number(locked.amount).toFixed(2) ||
            snapshot.contactCredits !== locked.creditsPurchased || typeof snapshotDuration !== 'number' ||
            !Number.isInteger(snapshotDuration) || snapshotDuration < 1) {
          throw new Error('Paid membership order snapshot is invalid; payment requires review.');
        }
        await tx.update(userSubscriptions).set({ status: 'CANCELLED' }).where(and(
          eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, 'ACTIVE'),
        ));
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + snapshotDuration);
        await tx.insert(userSubscriptions).values({
          userId: user.id, packageId: locked.packageId, status: 'ACTIVE', pricePaidUsd: locked.amount,
          contactCreditsRemaining: locked.creditsPurchased, startedAt: now, expiresAt,
          paymentReference: orderId,
        });
      }
      if (locked.creditsPurchased > 0) {
        await tx.insert(walletLedger).values({
          userId: user.id,
          transactionType: locked.paymentType === 'MEMBERSHIP_SUBSCRIPTION' ? 'PACKAGE_ALLOWANCE' : 'CREDIT_PURCHASE',
          amount: locked.creditsPurchased,
          notes: `PayPal capture ${orderId}`,
        });
      }
      return { alreadyFulfilled: false };
    });

    return NextResponse.json({ success: true, alreadyFulfilled: result.alreadyFulfilled });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json({ success: false, error: 'Could not verify or record the PayPal payment.' }, { status: 500 });
  }
}
