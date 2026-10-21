import { NextResponse } from 'next/server';
import { submitSuccessStoryInDb } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { z } from 'zod';

const storySubmissionSchema = z.object({
  brideName: z.string().min(2, 'Bride name is required'),
  groomName: z.string().min(2, 'Groom name is required'),
  weddingDate: z.string().optional(),
  profileId: z.string().optional(),
  storyBody: z.string().min(10, 'Story body must be at least 10 characters long'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();

    const parsed = storySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid story input',
        },
        { status: 400 }
      );
    }

    const { brideName, groomName, weddingDate, storyBody, imageUrl } = parsed.data;
    const coupleNames = `${brideName.trim()} & ${groomName.trim()}`;
    const title = `Alhamdulillah: ${coupleNames}'s Blessed Union`;

    const res = await submitSuccessStoryInDb({
      title,
      coupleNames,
      weddingDate: weddingDate || undefined,
      imageUrl: imageUrl || undefined,
      storyBody,
      isPublished: false, // Default to false until admin approval
    });

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Failed to submit success story' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      storyId: res.story?.id,
      message: 'MashaAllah! Your success story has been submitted for editorial review.',
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error in /api/stories/submit:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
