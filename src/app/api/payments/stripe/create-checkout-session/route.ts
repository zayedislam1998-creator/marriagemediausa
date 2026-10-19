import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';
import { db } from '@/db';
import { packages, paymentTransactions, userSubscriptions, walletLedger, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      userEmail,
      type,
      packageId,
      credits,
      customAmount,
      profileToken,
      payerName,
      payerPhone,
      city,
      stateProvince,
      country,
      postalCode,
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User is not authenticated' }, { status: 401 });
    }

    // Ensure targetUserId is a valid UUID in PostgreSQL
    let targetUserId = userId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUuid) {
      if (userEmail) {
        const [matchedUser] = await db.select().from(users).where(eq(users.email, userEmail));
        if (matchedUser) {
          targetUserId = matchedUser.id;
        } else {
          const [firstUser] = await db.select().from(users).limit(1);
          if (firstUser) targetUserId = firstUser.id;
        }
      } else {
        const [firstUser] = await db.select().from(users).limit(1);
        if (firstUser) targetUserId = firstUser.id;
      }
    }

    const config = await GatewayConfigService.getGatewayConfig('STRIPE');
    if (!config || !config.isActive) {
      return NextResponse.json(
        { success: false, error: 'Stripe gateway is currently disabled by administrator' },
        { status: 400 }
      );
    }

    const secretKey = config.secretKey;
    const isMockOrPlaceholder = !secretKey || secretKey.includes('placeholder') || secretKey.startsWith('sk_test_placeholder');

    let title = '';
    let description = '';
    let amountUsd = 0;
    let targetCredits = 0;
    let durationMonths = 1;

    if (type === 'MEMBERSHIP_SUBSCRIPTION') {
      if (!packageId) {
        return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
      }

      const [pkg] = await db.select().from(packages).where(eq(packages.id, Number(packageId)));
      if (!pkg) {
        return NextResponse.json({ success: false, error: 'Package not found in database' }, { status: 404 });
      }

      title = `MuslimBibah: ${pkg.name}`;
      description = `${pkg.name} (${pkg.durationMonths} Months) • ${pkg.contactCredits} Contact Credits • ${pkg.dailyProfileViewLimit} Daily Views`;
      amountUsd = parseFloat(pkg.priceUsd);
      targetCredits = pkg.contactCredits;
      durationMonths = pkg.durationMonths;
    } else if (type === 'WALLET_TOPUP') {
      targetCredits = Number(credits) || 10;
      amountUsd = Number(customAmount) || (targetCredits === 10 ? 15 : targetCredits === 30 ? 35 : targetCredits === 80 ? 75 : 150);
      title = `MuslimBibah: ${targetCredits} Contact Credits Pack`;
      description = `Instant unlock credits for candidate and guardian (Wali) phone numbers`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payment type' }, { status: 400 });
    }

    // Origin for redirect URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payerSnapshot = {
      profileToken: profileToken || null,
      payerName: payerName || null,
      payerEmail: userEmail || null,
      payerPhone: payerPhone || null,
      city: city || null,
      stateProvince: stateProvince || null,
      country: country || null,
      postalCode: postalCode || null,
    };

    // In local sandbox or when keys are placeholders, provide instant test fulfillment
    if (isMockOrPlaceholder) {
      const mockTxId = `sim_stripe_${Date.now()}`;
      await db.transaction(async (tx) => {
        const [txn] = await tx.insert(paymentTransactions).values({
          userId: targetUserId,
          gateway: 'STRIPE',
          gatewayTransactionId: mockTxId,
          amount: amountUsd.toFixed(2),
          feeAmount: '0.00',
          netAmount: amountUsd.toFixed(2),
          currency: 'USD',
          status: 'COMPLETED',
          paymentType: type,
          packageId: packageId ? Number(packageId) : null,
          creditsPurchased: targetCredits,
          rawPayload: { simulated: true, note: 'Simulated Sandbox Execution', payerDetails: payerSnapshot },
        }).returning();

        if (type === 'MEMBERSHIP_SUBSCRIPTION' && packageId) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

          const [existingSub] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, targetUserId));
          if (existingSub) {
            await tx.update(userSubscriptions).set({
              packageId: Number(packageId),
              status: 'ACTIVE',
              contactCreditsRemaining: existingSub.contactCreditsRemaining + targetCredits,
              expiresAt,
              paymentReference: mockTxId,
            }).where(eq(userSubscriptions.id, existingSub.id));
          } else {
            await tx.insert(userSubscriptions).values({
              userId: targetUserId,
              packageId: Number(packageId),
              status: 'ACTIVE',
              pricePaidUsd: amountUsd.toFixed(2),
              contactCreditsRemaining: targetCredits,
              expiresAt,
              paymentReference: mockTxId,
            });
          }
        }

        if (targetCredits > 0) {
          await tx.insert(walletLedger).values({
            userId: targetUserId,
            transactionType: type === 'MEMBERSHIP_SUBSCRIPTION' ? 'PACKAGE_ALLOWANCE' : 'CREDIT_PURCHASE',
            amount: targetCredits,
            notes: `${title} grant`,
          });
        }
      });

      return NextResponse.json({
        success: true,
        isSimulated: true,
        message: 'Sandbox transaction simulated instantly! Credits & package activated.',
        url: `${origin}/dashboard?payment=success&simulated=true`,
      });
    }

    // Live / Sandbox Stripe API
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: description,
            },
            unit_amount: Math.round(amountUsd * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      client_reference_id: targetUserId,
      metadata: {
        userId: targetUserId,
        packageId: packageId ? String(packageId) : '',
        type,
        credits: String(targetCredits),
        durationMonths: String(durationMonths),
        profileToken: profileToken ? String(profileToken) : '',
        payerName: payerName ? String(payerName) : '',
        payerPhone: payerPhone ? String(payerPhone) : '',
        location: [city, stateProvince, country].filter(Boolean).join(', '),
      },
    });

    // Record pending transaction
    await db.insert(paymentTransactions).values({
      userId: targetUserId,
      gateway: 'STRIPE',
      gatewayTransactionId: session.id,
      amount: amountUsd.toFixed(2),
      currency: 'USD',
      status: 'PENDING',
      paymentType: type,
      packageId: packageId ? Number(packageId) : null,
      creditsPurchased: targetCredits,
      rawPayload: { sessionId: session.id, created: session.created, payerDetails: payerSnapshot },
    }).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
