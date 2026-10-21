import { NextResponse } from 'next/server';
import { getVerifiedSession } from '@/lib/auth/verifiedSession';
import {
  getAllCmsStoriesFromDb,
  getCmsArticlesFromDb,
  getAllCmsPageSectionsFromDb,
} from '@/db/queries';

export async function GET() {
  try {
    const session = await getVerifiedSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const [stories, articles, sections] = await Promise.all([
      getAllCmsStoriesFromDb(true),
      getCmsArticlesFromDb(true),
      getAllCmsPageSectionsFromDb(),
    ]);

    return NextResponse.json({
      success: true,
      stories,
      articles,
      sections,
    });
  } catch (error: any) {
    if (error?.digest === 'HANGING_PROMISE_REJECTION' || error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error fetching admin CMS data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch CMS data' },
      { status: 500 }
    );
  }
}
