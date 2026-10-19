import { NextRequest, NextResponse } from 'next/server';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';
import { db } from '@/db';
import { packages, paymentTransactions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      type,
      packageId,
      credits,
      customAmount,
      profileToken,
      payerName,
      payerEmail,
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
      if (payerEmail) {
        const [matchedUser] = await db.select().from(users).where(eq(users.email, payerEmail));
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

    const payerSnapshot = {
      profileToken: profileToken || null,
      payerName: payerName || null,
      payerEmail: payerEmail || null,
      payerPhone: payerPhone || null,
      city: city || null,
      stateProvince: stateProvince || null,
      country: country || null,
      postalCode: postalCode || null,
    };

    const config = await GatewayConfigService.getGatewayConfig('PAYPAL');
    if (!config || !config.isActive) {
      return NextResponse.json(
        { success: false, error: 'PayPal gateway is currently disabled by administrator' },
        { status: 400 }
      );
    }

    let title = '';
    let amountUsd = 0;
    let targetCredits = 0;

    if (type === 'MEMBERSHIP_SUBSCRIPTION') {
      if (!packageId) {
        return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
      }

      const [pkg] = await db.select().from(packages).where(eq(packages.id, Number(packageId)));
      if (!pkg) {
        return NextResponse.json({ success: false, error: 'Package not found in database' }, { status: 404 });
      }

      title = `MuslimBibah: ${pkg.name}`;
      amountUsd = parseFloat(pkg.priceUsd);
      targetCredits = pkg.contactCredits;
    } else if (type === 'WALLET_TOPUP') {
      targetCredits = Number(credits) || 10;
      amountUsd = Number(customAmount) || (targetCredits === 10 ? 15 : targetCredits === 30 ? 35 : targetCredits === 80 ? 75 : 150);
      title = `MuslimBibah: ${targetCredits} Contact Credits Pack`;
    }

    const clientId = config.publicKey;
    const clientSecret = config.secretKey;
    const isMock = !clientId || clientId.includes('placeholder') || !clientSecret || clientSecret.includes('placeholder');

    if (isMock) {
      // Simulate Sandbox order ID
      const mockOrderId = `SIM_PAYPAL_${Date.now()}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        isSimulated: true,
        amount: amountUsd.toFixed(2),
        payerDetails: payerSnapshot,
      });
    }

    // Call PayPal v2 Orders API
    const isSandbox = config.mode === 'TEST';
    const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
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
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`PayPal OAuth failed: ${tokenData.error_description || tokenData.error}`);
    }

    const customId = JSON.stringify({ userId, packageId, type, credits: targetCredits, profileToken: profileToken || '' });

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
            description: title,
            custom_id: customId,
          },
        ],
        application_context: {
          brand_name: 'MuslimBibah.com',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.id) {
      throw new Error(`PayPal Order Creation failed: ${orderData.message || JSON.stringify(orderData)}`);
    }

    // Record pending transaction
    await db.insert(paymentTransactions).values({
      userId: targetUserId,
      gateway: 'PAYPAL',
      gatewayTransactionId: orderData.id,
      amount: amountUsd.toFixed(2),
      currency: 'USD',
      status: 'PENDING',
      paymentType: type,
      packageId: packageId ? Number(packageId) : null,
      creditsPurchased: targetCredits,
      rawPayload: { ...orderData, payerDetails: payerSnapshot },
    }).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      links: orderData.links,
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
