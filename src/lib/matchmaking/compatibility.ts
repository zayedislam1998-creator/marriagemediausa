import { AuthenticProfile } from '@/db/repository';

export interface SuitorFilterCriteria {
  gender?: 'MALE' | 'FEMALE';
  minAge?: number;
  maxAge?: number;
  country?: string;
  usState?: string;
  sect?: string;
  profession?: string;
  maritalStatus?: string;
  residencyStatus?: string;
  prayerFrequency?: string;
  query?: string;
}

/**
 * Halal Compatibility Scoring Algorithm (0 - 100%)
 * Enforces weighted categories per docs/02_SYSTEM_REQUIREMENTS_AND_SRS.md
 * and .agents/skills/marriagemediausa-domain-guardian/SKILL.md:
 * - Age Alignment: 20 pts
 * - Islamic Practice & Modesty: 25 pts
 * - Location & US Diaspora Residency: 20 pts
 * - Education & Profession: 15 pts
 * - Marital Status & Family Dynamics: 20 pts
 */
export function calculateCompatibilityScore(
  profile: AuthenticProfile,
  criteria?: SuitorFilterCriteria
): { score: number; colorClass: string; breakdown: Record<string, number> } {
  if (!criteria) {
    // Default baseline compatibility for curated featured suitor cards
    return {
      score: 94,
      colorClass: 'stroke-emerald',
      breakdown: { age: 19, islamic: 24, location: 19, career: 14, marital: 18 },
    };
  }

  let ageScore = 20;
  if (criteria.minAge && profile.age < criteria.minAge) {
    const diff = criteria.minAge - profile.age;
    ageScore = Math.max(0, 20 - diff * 4);
  } else if (criteria.maxAge && profile.age > criteria.maxAge) {
    const diff = profile.age - criteria.maxAge;
    ageScore = Math.max(0, 20 - diff * 4);
  }

  let islamicScore = 25;
  if (criteria.sect && criteria.sect !== 'All' && profile.sect_mazhab) {
    if (!profile.sect_mazhab.toLowerCase().includes(criteria.sect.toLowerCase())) {
      islamicScore -= 8;
    }
  }
  if (criteria.prayerFrequency && criteria.prayerFrequency !== 'All') {
    if (profile.pray_frequency !== criteria.prayerFrequency) {
      islamicScore -= 7;
    }
  }

  let locationScore = 20;
  if (criteria.country && criteria.country !== 'All') {
    if (!profile.country_living_in.toLowerCase().includes(criteria.country.toLowerCase())) {
      locationScore -= 10;
    }
  }
  if (criteria.usState && criteria.usState !== 'All') {
    if (!profile.state_province.toLowerCase().includes(criteria.usState.toLowerCase())) {
      locationScore -= 8;
    }
  }
  if (criteria.residencyStatus && criteria.residencyStatus !== 'All') {
    if (
      !profile.residing_status
        .toLowerCase()
        .includes(criteria.residencyStatus.toLowerCase())
    ) {
      locationScore -= 5;
    }
  }

  let careerScore = 15;
  if (criteria.profession && criteria.profession !== 'All') {
    if (!profile.profession.toLowerCase().includes(criteria.profession.toLowerCase())) {
      careerScore -= 5;
    }
  }

  let maritalScore = 20;
  if (criteria.maritalStatus && criteria.maritalStatus !== 'All') {
    if (profile.marital_status !== criteria.maritalStatus) {
      maritalScore -= 10;
    }
  }

  const totalScore = Math.min(100, Math.max(45, ageScore + islamicScore + locationScore + careerScore + maritalScore));

  let colorClass = 'stroke-emerald';
  if (totalScore >= 88) {
    colorClass = 'stroke-emerald'; // #059669
  } else if (totalScore >= 75) {
    colorClass = 'stroke-sapphire'; // #0284C7
  } else {
    colorClass = 'stroke-gold'; // #D97706
  }

  return {
    score: totalScore,
    colorClass,
    breakdown: {
      age: ageScore,
      islamic: islamicScore,
      location: locationScore,
      career: careerScore,
      marital: maritalScore,
    },
  };
}
