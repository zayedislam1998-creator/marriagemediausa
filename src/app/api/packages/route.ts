import { NextResponse } from 'next/server';
import { getAllPackagesFromDb } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { getVerifiedSession } from '@/lib/auth/verifiedSession';

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const dbPackages = await getAllPackagesFromDb();
    const includeInactive = new URL(req.url).searchParams.get('includeInactive') === '1';
    if (includeInactive) {
      const session = await getVerifiedSession();
      if (session?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'database',
      packages: includeInactive ? dbPackages : dbPackages.filter((p) => p.isActive),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error in /api/packages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
