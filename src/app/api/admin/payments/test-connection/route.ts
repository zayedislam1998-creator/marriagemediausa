import { NextRequest, NextResponse } from 'next/server';
import { GatewayConfigService } from '@/lib/payments/gatewayConfigService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gateway, publicKey, secretKey, mode } = body;

    if (!gateway || !['STRIPE', 'PAYPAL'].includes(gateway)) {
      return NextResponse.json({ success: false, error: 'Invalid gateway specified' }, { status: 400 });
    }

    const testResult = await GatewayConfigService.testConnection(gateway, {
      publicKey,
      secretKey,
      mode,
    });

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error('Error in test-connection API:', error);
    return NextResponse.json(
      { success: false, latencyMs: 0, message: `Server error during test: ${error.message}` },
      { status: 500 }
    );
  }
}
