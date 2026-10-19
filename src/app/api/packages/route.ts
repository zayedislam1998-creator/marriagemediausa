import { NextResponse } from 'next/server';
import { getAllPackagesFromDb } from '@/db/queries';
import { DomainRepository } from '@/db/repository';
import { ensureDatabaseReady } from '@/db/auto-migrate';

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const dbPackages = await getAllPackagesFromDb();

    // If database has packages, filter active packages
    if (dbPackages && dbPackages.length > 0) {
      const activePackages = dbPackages.filter((p) => p.isActive !== false);
      return NextResponse.json({
        success: true,
        source: 'database',
        packages: activePackages,
      });
    }

    // Fallback to repository active packages
    const fallback = DomainRepository.getPackages();
    return NextResponse.json({
      success: true,
      source: 'fallback',
      packages: fallback,
    });
  } catch (error: any) {
    console.error('Error in /api/packages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
