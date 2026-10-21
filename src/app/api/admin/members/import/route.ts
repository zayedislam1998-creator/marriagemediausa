import { NextResponse } from 'next/server';
import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import { bulkImportMembersInDb, BulkImportMemberInput } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';

export async function POST(req: Request) {
  try {
    const session = await getVerifiedSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    await ensureDatabaseReady();
    const body = await req.json();

    const members: BulkImportMemberInput[] = Array.isArray(body.members) ? body.members : [];
    const defaultPackageId = typeof body.defaultPackageId === 'number' ? body.defaultPackageId : undefined;

    if (members.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No member records found to import.' },
        { status: 400 }
      );
    }

    if (members.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Maximum 500 members can be imported in a single batch.' },
        { status: 400 }
      );
    }

    // Apply default package ID if row doesn't specify one
    const enrichedMembers = members.map((m) => ({
      ...m,
      packageId: m.packageId ? Number(m.packageId) : defaultPackageId,
    }));

    const result = await bulkImportMembersInDb(enrichedMembers, session.userId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error in /api/admin/members/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during bulk import' },
      { status: 500 }
    );
  }
}
