import { NextResponse } from 'next/server';
import { getPublicProfilesFromDb, ProfileDbFilters } from '@/db/queries';
import { ensureDatabaseReady } from '@/db/auto-migrate';
import { calculateCompatibilityScore } from '@/lib/matchmaking/compatibility';

export async function GET(req: Request) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);

    const gender = searchParams.get('gender') as 'MALE' | 'FEMALE' | null;
    const country = searchParams.get('country') || undefined;
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const minAgeStr = searchParams.get('minAge');
    const maxAgeStr = searchParams.get('maxAge');
    const profession = searchParams.get('profession') || undefined;
    const educationLevel = searchParams.get('educationLevel') || undefined;
    const maritalStatus = searchParams.get('maritalStatus') || undefined;
    const sectMazhab = searchParams.get('sectMazhab') || undefined;
    const query = searchParams.get('q') || searchParams.get('query') || undefined;

    const filters: ProfileDbFilters = {
      gender: gender || undefined,
      country,
      state,
      city,
      minAge: minAgeStr ? parseInt(minAgeStr, 10) : undefined,
      maxAge: maxAgeStr ? parseInt(maxAgeStr, 10) : undefined,
      profession,
      educationLevel,
      maritalStatus,
      sectMazhab,
      query,
    };

    const profiles = await getPublicProfilesFromDb(filters);

    // Calculate dynamic two-way compatibility scores and matching insights
    const enriched = profiles.map((p) => {
      const matchCriteria = {
        gender: filters.gender,
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        country: filters.country,
        usState: filters.state,
        sect: filters.sectMazhab,
        profession: filters.profession,
        maritalStatus: filters.maritalStatus,
      };
      const compat = calculateCompatibilityScore(p, matchCriteria);
      return {
        ...p,
        compatibility: compat,
      };
    });

    return NextResponse.json({
      success: true,
      source: 'database',
      total: enriched.length,
      profiles: enriched,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_') || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Error in /api/profiles/search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search profiles' },
      { status: 500 }
    );
  }
}
