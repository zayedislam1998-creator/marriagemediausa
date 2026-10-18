import domainSeed from '../../seed-data/marriagemediausa_domain_seed.json';

export interface Country {
  id: number;
  name: string;
  code: string;
  dial_code: string;
}

export interface USState {
  code: string;
  name: string;
}

export interface Package {
  id: number;
  name: string;
  duration_months: number;
  price_usd: number;
  contact_credits: number;
  daily_profile_view_limit: number;
  badge_title: string;
  features: string[];
}

export interface AuthenticProfile {
  profile_id: string;
  full_name: string;
  nick_name?: string;
  gender: 'MALE' | 'FEMALE';
  date_of_birth: string;
  age: number;
  looking_for: 'MALE' | 'FEMALE';
  marital_status: string;
  have_children: string;
  child_living_status: string;
  family_values: string;
  father_status: string;
  mother_status: string;
  brothers_count: string;
  sisters_count: string;
  sibling_position: string;
  height_feet_inches: string;
  height_cm: number;
  weight_kg: number;
  body_type: string;
  complexion: string;
  eyes_color: string;
  hair_color: string;
  blood_group: string;
  disability: string;
  eye_wear: string;
  religion: string;
  sect_mazhab: string;
  religiousness: string;
  pray_frequency: string;
  halal_diet: string;
  smoke: string;
  drink: string;
  wears_hijab_or_beard: boolean;
  mother_tongue: string;
  education_level: string;
  institution_name: string;
  field_of_study: string;
  profession: string;
  designation: string;
  employer_name: string;
  experience_years: string;
  annual_income: string;
  nationality: string;
  country_living_in: string;
  state_province: string;
  city: string;
  zip_code: string;
  residing_status: string;
  address_line?: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_phone_country_code: string;
  guardian_phone: string;
  guardian_verified: boolean;
  about_me: string;
  what_i_am_looking_for: string;
  hobbies_interests?: string;
  photo_privacy: 'PUBLIC' | 'BLURRED_PURDAH' | 'HIDDEN';
  completion_percentage: number;
  is_featured: boolean;
  kyc_status: string;
  is_approved: boolean;
  package_name: string;
  photo_url?: string;
}

export interface ProfileFilters {
  gender?: 'MALE' | 'FEMALE';
  country?: string;
  state?: string;
  minAge?: number;
  maxAge?: number;
  profession?: string;
  maritalStatus?: string;
  residingStatus?: string;
  query?: string;
}

export class DomainRepository {
  static getCountries(): Country[] {
    return domainSeed.countries as Country[];
  }

  static getUSStates(): USState[] {
    return domainSeed.us_states as USState[];
  }

  static getProfessions(): string[] {
    return domainSeed.professions;
  }

  static getEducationLevels(): string[] {
    return domainSeed.education_levels;
  }

  static getMotherTongues(): string[] {
    return domainSeed.mother_tongues;
  }

  static getSectsAndMazhabs(): string[] {
    return domainSeed.sects_and_mazhabs;
  }

  static getResidencyStatuses(): string[] {
    return domainSeed.residency_statuses;
  }

  static getPackages(): Package[] {
    return domainSeed.packages as Package[];
  }

  static getProfiles(filters?: ProfileFilters): AuthenticProfile[] {
    let list = (domainSeed.real_profiles_seed as AuthenticProfile[]).map((p) => ({
      ...p,
      photo_url: `/uploads/avatars/${p.profile_id}.webp`,
    }));

    if (!filters) return list;

    if (filters.gender) {
      list = list.filter((p) => p.gender === filters.gender);
    }
    if (filters.country) {
      list = list.filter((p) =>
        p.country_living_in.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }
    if (filters.state && filters.state !== "Doesn't Matter" && filters.state !== 'All') {
      list = list.filter(
        (p) => p.state_province.toLowerCase() === filters.state!.toLowerCase()
      );
    }
    if (filters.minAge) {
      list = list.filter((p) => p.age >= filters.minAge!);
    }
    if (filters.maxAge) {
      list = list.filter((p) => p.age <= filters.maxAge!);
    }
    if (filters.profession && filters.profession !== 'All') {
      list = list.filter((p) =>
        p.profession.toLowerCase().includes(filters.profession!.toLowerCase())
      );
    }
    if (filters.maritalStatus && filters.maritalStatus !== "Doesn't Matter") {
      list = list.filter((p) => p.marital_status === filters.maritalStatus);
    }
    if (filters.residingStatus && filters.residingStatus !== 'All') {
      list = list.filter((p) =>
        p.residing_status.toLowerCase().includes(filters.residingStatus!.toLowerCase())
      );
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q) ||
          p.about_me.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static getProfileById(profileId: string): AuthenticProfile | undefined {
    const p = (domainSeed.real_profiles_seed as AuthenticProfile[]).find(
      (p) => p.profile_id === profileId
    );
    if (!p) return undefined;
    return {
      ...p,
      photo_url: `/uploads/avatars/${p.profile_id}.webp`,
    };
  }

  /**
   * 0-100% Islamic Matrimonial Compatibility Algorithm
   * (Enforced by marriagemediausa-domain-guardian skill)
   */
  static calculateCompatibilityScore(
    candidate: AuthenticProfile,
    target: AuthenticProfile
  ): number {
    let score = 0;

    // 1. Age Compatibility (20 pts)
    const ageDiff = Math.abs(candidate.age - target.age);
    if (ageDiff <= 3) score += 20;
    else if (ageDiff <= 6) score += 15;
    else if (ageDiff <= 10) score += 10;
    else score += 5;

    // 2. Islamic Practice & Religiousness (25 pts)
    if (candidate.pray_frequency === target.pray_frequency) score += 10;
    else if (candidate.pray_frequency === 'ALWAYS' || target.pray_frequency === 'ALWAYS') score += 7;

    if (candidate.religiousness === target.religiousness) score += 10;
    else score += 5;

    if (candidate.halal_diet === target.halal_diet) score += 5;

    // 3. Location & US Residency (20 pts)
    if (candidate.country_living_in === target.country_living_in) {
      score += 10;
      if (candidate.state_province === target.state_province) score += 10;
      else score += 5;
    }

    // 4. Education & Profession (15 pts)
    if (candidate.education_level === target.education_level) score += 8;
    else score += 4;
    if (candidate.profession === target.profession) score += 7;
    else score += 5;

    // 5. Marital Status & Children (20 pts)
    if (candidate.marital_status === target.marital_status) score += 12;
    else score += 6;
    if (candidate.have_children === target.have_children) score += 8;
    else score += 4;

    return Math.min(100, score);
  }
}
