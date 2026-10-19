import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/lib/storage/mediaService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';

    let items = await MediaService.listMedia();

    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.originalName.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error('API /api/media GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list media items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const category = (formData.get('category') as any) || 'avatar';

    const uploadQueue: File[] = [];
    if (files && files.length > 0) {
      uploadQueue.push(...files);
    } else if (singleFile) {
      uploadQueue.push(singleFile);
    }

    if (uploadQueue.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided for upload' },
        { status: 400 }
      );
    }

    const uploadedItems = [];
    for (const file of uploadQueue) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const item = await MediaService.uploadMedia(buffer, file.name, category);
      uploadedItems.push(item);
    }

    return NextResponse.json({
      success: true,
      items: uploadedItems,
      uploadedCount: uploadedItems.length,
    });
  } catch (error: any) {
    console.error('API /api/media POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process and upload media' },
      { status: 500 }
    );
  }
}
