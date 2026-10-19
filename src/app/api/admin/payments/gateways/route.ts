import { NextRequest, NextResponse } from 'next/server';
import { getAllGatewayConfigsFromDb, saveGatewayConfigInDb } from '@/db/queries';

export async function GET() {
  try {
    const configs = await getAllGatewayConfigsFromDb();
    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    console.error('Error fetching admin gateway configs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gateway, mode, isActive, publicKey, secretKey, webhookSecret, webhookId, settingsJson } = body;

    if (!gateway || !['STRIPE', 'PAYPAL'].includes(gateway)) {
      return NextResponse.json({ success: false, error: 'Invalid gateway specified' }, { status: 400 });
    }

    const result = await saveGatewayConfigInDb(gateway, {
      mode: mode || 'TEST',
      isActive: Boolean(isActive),
      publicKey: publicKey || '',
      secretKey: secretKey || '',
      webhookSecret: webhookSecret || '',
      webhookId: webhookId || '',
      settingsJson: settingsJson || {},
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${gateway} configuration saved successfully.` });
  } catch (error: any) {
    console.error('Error saving gateway config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
