import { NextResponse } from 'next/server';
import { submitContactInquiryInDb } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { z } from 'zod';

const contactSchema = z.object({
  type: z.enum(['CONTACT', 'WEDDING_SERVICE', 'GENERAL']).default('CONTACT'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(7, 'Please enter a valid phone number'),
  subject: z.string().optional(),
  cityState: z.string().optional(),
  serviceType: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid form input',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const res = await submitContactInquiryInDb(parsed.data);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || 'Failed to record your inquiry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: res.submission?.id,
      message: 'JazakAllah Khair! Your message has been received by our matrimonial support team.',
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error in /api/contact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
