import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentSession } from '@/lib/auth/session';
import { storageDriver } from '@/lib/storage/LocalStorageDriver';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await getCurrentSession();

  // Strict check: Only SUPER_ADMIN and MODERATOR can access private KYC documents
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MODERATOR')) {
    return new NextResponse('Forbidden: Access to private KYC vault restricted to verified staff.', {
      status: 403,
    });
  }

  const { filename } = await params;
  const safeFilename = path.basename(filename);
  const filePath = storageDriver.getPrivateFilePath(safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('KYC document not found.', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  let contentType = 'application/octet-stream';
  if (safeFilename.endsWith('.pdf')) contentType = 'application/pdf';
  else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
  else if (safeFilename.endsWith('.png')) contentType = 'image/png';
  else if (safeFilename.endsWith('.webp')) contentType = 'image/webp';

  return new NextResponse(fileStream as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Content-Disposition': `inline; filename="${safeFilename}"`,
    },
  });
}
