import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { paymentTransactions, userSubscriptions, walletLedger, processedWebhookEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const config = await GatewayConfigService.getGatewayConfig('STRIPE');
    if (!config || !config.webhookSecret) {
      console.warn('Stripe webhook received but webhookSecret is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const stripe = new Stripe(config.secretKey, { apiVersion: '2025-02-24.acacia' as any });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);
    } catch (err: any) {
      console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }

    // Idempotency deduplication check
    const isAlreadyProcessed = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(processedWebhookEvents)
        .where(eq(processedWebhookEvents.eventId, event.id));

      if (existing) return true;

      await tx.insert(processedWebhookEvents).values({
        eventId: event.id,
        gateway: 'STRIPE',
        eventType: event.type,
      });

      return false;
    });

    if (isAlreadyProcessed) {
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

    // Process Event Types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await fulfillCheckoutSession(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe] PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      }
      default:
        console.log(`[Stripe] Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Stripe Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const packageId = session.metadata?.packageId ? parseInt(session.metadata.packageId, 10) : null;
  const type = session.metadata?.type || 'MEMBERSHIP_SUBSCRIPTION';
  const creditsAmount = parseInt(session.metadata?.credits || '0', 10);
  const durationMonths = parseInt(session.metadata?.durationMonths || '1', 10);
  const amountTotal = (session.amount_total ?? 0) / 100;

  if (!userId) {
    console.error('Missing userId in Stripe session metadata');
    return;
  }

  await db.transaction(async (tx) => {
    // 1. Update or create transaction record
    await tx
      .insert(paymentTransactions)
      .values({
        userId,
        gateway: 'STRIPE',
        gatewayTransactionId: session.id,
        amount: amountTotal.toFixed(2),
        currency: (session.currency || 'usd').toUpperCase(),
        status: 'COMPLETED',
        paymentType: type as any,
        packageId: packageId,
        creditsPurchased: creditsAmount,
        rawPayload: session,
      })
      .onConflictDoUpdate({
        target: paymentTransactions.gatewayTransactionId,
        set: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });

    // 2. Fulfill Subscription if Package
    if (type === 'MEMBERSHIP_SUBSCRIPTION' && packageId) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      const [existingSub] = await tx
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId));

      if (existingSub) {
        await tx
          .update(userSubscriptions)
          .set({
            packageId,
            status: 'ACTIVE',
            pricePaidUsd: amountTotal.toFixed(2),
            contactCreditsRemaining: existingSub.contactCreditsRemaining + creditsAmount,
            expiresAt,
            paymentReference: session.id,
          })
          .where(eq(userSubscriptions.id, existingSub.id));
      } else {
        await tx.insert(userSubscriptions).values({
          userId,
          packageId,
          status: 'ACTIVE',
          pricePaidUsd: amountTotal.toFixed(2),
          contactCreditsRemaining: creditsAmount,
          expiresAt,
          paymentReference: session.id,
        });
      }
    }

    // 3. Credit Wallet Ledger
    if (creditsAmount > 0) {
      await tx.insert(walletLedger).values({
        userId,
        transactionType: type === 'MEMBERSHIP_SUBSCRIPTION' ? 'PACKAGE_ALLOWANCE' : 'CREDIT_PURCHASE',
        amount: creditsAmount,
        notes: `Stripe fulfillment session ${session.id}`,
      });
    }
  });

  console.log(`[Stripe Webhook] Successfully fulfilled payment for user ${userId} (${creditsAmount} credits)`);
}
