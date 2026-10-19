import { NextRequest, NextResponse } from 'next/server';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';
import { db } from '@/db';
import { packages, paymentTransactions, userSubscriptions, walletLedger, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userId, packageId, type, credits, customAmount, profileToken } = body;

    if (!orderId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing orderId or userId' }, { status: 400 });
    }

    // Ensure targetUserId is a valid UUID in PostgreSQL
    let targetUserId = userId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUuid) {
      const [firstUser] = await db.select().from(users).limit(1);
      if (firstUser) targetUserId = firstUser.id;
    }

    const config = await GatewayConfigService.getGatewayConfig('PAYPAL');
    const isMock = orderId.startsWith('SIM_PAYPAL_') || !config || config.publicKey.includes('placeholder');

    let creditsAmount = Number(credits) || 0;
    let durationMonths = 1;
    let amountTotal = Number(customAmount) || 0;

    if (packageId) {
      const [pkg] = await db.select().from(packages).where(eq(packages.id, Number(packageId)));
      if (pkg) {
        creditsAmount = pkg.contactCredits;
        durationMonths = pkg.durationMonths;
        amountTotal = parseFloat(pkg.priceUsd);
      }
    }

    if (isMock) {
      // Simulated sandbox capture
      await db.transaction(async (tx) => {
        await tx.insert(paymentTransactions).values({
          userId: targetUserId,
          gateway: 'PAYPAL',
          gatewayTransactionId: orderId,
          amount: amountTotal.toFixed(2),
          currency: 'USD',
          status: 'COMPLETED',
          paymentType: type || (packageId ? 'MEMBERSHIP_SUBSCRIPTION' : 'WALLET_TOPUP'),
          packageId: packageId ? Number(packageId) : null,
          creditsPurchased: creditsAmount,
          rawPayload: { simulated: true, orderId, profileToken },
        }).onConflictDoUpdate({
          target: paymentTransactions.gatewayTransactionId,
          set: { status: 'COMPLETED', updatedAt: new Date() },
        });

        if (packageId) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

          const [existingSub] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, targetUserId));
          if (existingSub) {
            await tx.update(userSubscriptions).set({
              packageId: Number(packageId),
              status: 'ACTIVE',
              contactCreditsRemaining: existingSub.contactCreditsRemaining + creditsAmount,
              expiresAt,
              paymentReference: orderId,
            }).where(eq(userSubscriptions.id, existingSub.id));
          } else {
            await tx.insert(userSubscriptions).values({
              userId: targetUserId,
              packageId: Number(packageId),
              status: 'ACTIVE',
              pricePaidUsd: amountTotal.toFixed(2),
              contactCreditsRemaining: creditsAmount,
              expiresAt,
              paymentReference: orderId,
            });
          }
        }

        if (creditsAmount > 0) {
          await tx.insert(walletLedger).values({
            userId: targetUserId,
            transactionType: packageId ? 'PACKAGE_ALLOWANCE' : 'CREDIT_PURCHASE',
            amount: creditsAmount,
            notes: `PayPal capture ${orderId}`,
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: 'PayPal payment captured & fulfilled successfully in sandbox mode!',
      });
    }

    // Live capture via PayPal REST API
    const isSandbox = config.mode === 'TEST';
    const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    const auth = Buffer.from(`${config.publicKey}:${config.secretKey}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    const tokenData = await tokenRes.json();

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      throw new Error(`PayPal Capture failed: ${captureData.status || captureData.message}`);
    }

    // Fulfill in DB
    await db.transaction(async (tx) => {
      await tx.insert(paymentTransactions).values({
        userId: targetUserId,
        gateway: 'PAYPAL',
        gatewayTransactionId: orderId,
        amount: amountTotal.toFixed(2),
        currency: 'USD',
        status: 'COMPLETED',
        paymentType: type || (packageId ? 'MEMBERSHIP_SUBSCRIPTION' : 'WALLET_TOPUP'),
        packageId: packageId ? Number(packageId) : null,
        creditsPurchased: creditsAmount,
        rawPayload: { ...captureData, profileToken },
      }).onConflictDoUpdate({
        target: paymentTransactions.gatewayTransactionId,
        set: { status: 'COMPLETED', updatedAt: new Date() },
      });

      if (packageId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

        const [existingSub] = await tx.select().from(userSubscriptions).where(eq(userSubscriptions.userId, targetUserId));
        if (existingSub) {
          await tx.update(userSubscriptions).set({
            packageId: Number(packageId),
            status: 'ACTIVE',
            contactCreditsRemaining: existingSub.contactCreditsRemaining + creditsAmount,
            expiresAt,
            paymentReference: orderId,
          }).where(eq(userSubscriptions.id, existingSub.id));
        } else {
          await tx.insert(userSubscriptions).values({
            userId: targetUserId,
            packageId: Number(packageId),
            status: 'ACTIVE',
            pricePaidUsd: amountTotal.toFixed(2),
            contactCreditsRemaining: creditsAmount,
            expiresAt,
            paymentReference: orderId,
          });
        }
      }

      if (creditsAmount > 0) {
        await tx.insert(walletLedger).values({
          userId: targetUserId,
          transactionType: packageId ? 'PACKAGE_ALLOWANCE' : 'CREDIT_PURCHASE',
          amount: creditsAmount,
          notes: `PayPal capture ${orderId}`,
        });
      }
    });

    return NextResponse.json({
      success: true,
      captureData,
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
