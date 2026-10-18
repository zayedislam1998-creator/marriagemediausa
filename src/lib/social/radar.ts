export interface ProfileVisitor {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorPhoto?: string;
  visitorAge: number;
  visitorProfession: string;
  visitorLocation: string;
  visitorResidency: string;
  viewedAt: string;
  compatibilityScore: number;
  isVerified: boolean;
}

// In-Memory visitor log store
let visitorLogStore: ProfileVisitor[] = [
  {
    id: 'vis-01',
    visitorId: '2026044927',
    visitorName: 'Engr. Tariq Mahmood',
    visitorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    visitorAge: 29,
    visitorProfession: 'Senior Cloud Solutions Architect',
    visitorLocation: 'Dallas, TX',
    visitorResidency: 'US Citizen',
    viewedAt: '2 hours ago',
    compatibilityScore: 94,
    isVerified: true,
  },
  {
    id: 'vis-02',
    visitorId: '2026044929',
    visitorName: 'Dr. Zayan Al-Rashid',
    visitorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    visitorAge: 30,
    visitorProfession: 'Cardiology Fellow / Physician',
    visitorLocation: 'Houston, TX',
    visitorResidency: 'Permanent Resident (Green Card)',
    viewedAt: '5 hours ago',
    compatibilityScore: 96,
    isVerified: true,
  },
  {
    id: 'vis-03',
    visitorId: '2026044931',
    visitorName: 'Omar Farooq, CPA',
    visitorPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    visitorAge: 31,
    visitorProfession: 'Audit Director (Big 4)',
    visitorLocation: 'Jersey City, NJ',
    visitorResidency: 'US Citizen',
    viewedAt: 'Yesterday',
    compatibilityScore: 89,
    isVerified: true,
  },
  {
    id: 'vis-04',
    visitorId: '2026044933',
    visitorName: 'Kamran Siddiq',
    visitorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    visitorAge: 28,
    visitorProfession: 'AI Research Scientist',
    visitorLocation: 'San Jose, CA',
    visitorResidency: 'H-1B Work Visa',
    viewedAt: '2 days ago',
    compatibilityScore: 91,
    isVerified: true,
  },
];

// Deduplication map: key = `${viewerId}:${targetProfileId}`, value = timestamp
const recentViewTimestamps: Record<string, number> = {};

export class VisitorRadarService {
  static getVisitors(): ProfileVisitor[] {
    return visitorLogStore;
  }

  static logProfileView(
    viewer: { id: string; name: string; photo?: string; age: number; profession: string; location: string; residency: string },
    targetProfileId: string
  ): boolean {
    const key = `${viewer.id}:${targetProfileId}`;
    const now = Date.now();
    const lastViewed = recentViewTimestamps[key];

    // Deduplicate within 24 hours (86,400,000 ms)
    if (lastViewed && now - lastViewed < 86400000) {
      return false; // Already logged today
    }

    recentViewTimestamps[key] = now;

    const newVisitor: ProfileVisitor = {
      id: `vis-${now}`,
      visitorId: viewer.id,
      visitorName: viewer.name,
      visitorPhoto: viewer.photo,
      visitorAge: viewer.age,
      visitorProfession: viewer.profession,
      visitorLocation: viewer.location,
      visitorResidency: viewer.residency,
      viewedAt: 'Just now',
      compatibilityScore: 93,
      isVerified: true,
    };

    visitorLogStore.unshift(newVisitor);
    return true;
  }
}
