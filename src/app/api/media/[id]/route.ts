import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/lib/storage/mediaService';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Media ID required' }, { status: 400 });
    }

    const success = await MediaService.deleteMedia(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Media file not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Media file deleted successfully' });
  } catch (error: any) {
    console.error('API /api/media/[id] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete media' },
      { status: 500 }
    );
  }
}
