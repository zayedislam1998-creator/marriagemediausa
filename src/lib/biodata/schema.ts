import { z } from 'zod';

export const biodataSchema = z.object({
  // 1. Basic & Identity
  createdBy: z.string().default('self'),
  createdFor: z.string().default('self'),
  lookingFor: z.enum(['MALE', 'FEMALE']),
  fullName: z.string().min(2, 'Full legal name is required'),
  nickName: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid Date of Birth required (YYYY-MM-DD)'),
  age: z.coerce.number().min(18, 'Must be at least 18 years old').max(99),
  profileId: z.string().optional(),

  // 2. Marital & Family
  maritalStatus: z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER']),
  haveChildren: z.string().default('No'),
  childLivingStatus: z.string().default('No Child'),
  familyValues: z.string().default('Religious'),
  fatherStatus: z.string().default('Employed'),
  motherStatus: z.string().default('Homemaker'),
  brothersCount: z.string().default('0'),
  sistersCount: z.string().default('0'),
  siblingPosition: z.string().default('1'),

  // 3. Physical & Health
  heightFeetInches: z.string().min(2, 'Height in feet/inches required (e.g. 5\'6")'),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(35).max(180).optional(),
  bodyType: z.enum(['SLIM', 'AVERAGE', 'ATHLETIC', 'HEAVY']).default('AVERAGE'),
  complexion: z.enum(['VERY_FAIR', 'FAIR', 'WHEATISH', 'WHEATISH_MEDIUM', 'WHEATISH_BROWN', 'DARK']).default('FAIR'),
  eyesColor: z.string().default('Black'),
  hairColor: z.string().default('Black'),
  bloodGroup: z.string().optional(),
  disability: z.string().default('None'),
  eyeWear: z.string().default('None'),

  // 4. Islamic Lifestyle & Religious Practice
  religion: z.string().default('Islam'),
  sectMazhab: z.string().default('Sunni (Hanafi)'),
  religiousness: z.enum(['VERY_RELIGIOUS', 'RELIGIOUS', 'MODERATE', 'PRACTICING', 'AVERAGE', 'REVERT']).default('RELIGIOUS'),
  prayFrequency: z.enum(['ALWAYS', 'REGULARLY', 'SOMETIMES', 'JUMUAH_ONLY', 'RARELY']).default('ALWAYS'),
  fastingRamadan: z.string().default('ALWAYS'),
  quranReading: z.string().default('DAILY'),
  halalDiet: z.enum(['STRICTLY_HALAL', 'HALAL_PREFERRED', 'VEGETARIAN', 'ANY']).default('STRICTLY_HALAL'),
  smoke: z.enum(['NO', 'OCCASIONALLY', 'SOMETIMES', 'YES']).default('NO'),
  drink: z.enum(['NO', 'OCCASIONALLY', 'SOMETIMES', 'YES']).default('NO'),
  wearsHijabOrBeard: z.coerce.boolean().default(false),
  motherTongue: z.string().default('English'),

  // 5. Education & Professional Career
  educationLevel: z.string().min(2, 'Education level is required'),
  institutionName: z.string().min(2, 'University or institution name is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  profession: z.string().min(2, 'Profession is required'),
  designation: z.string().min(2, 'Job designation/title is required'),
  employerName: z.string().min(2, 'Employer or company is required'),
  experienceYears: z.string().default('3 years'),
  annualIncome: z.string().min(2, 'Annual income bracket is required'),

  // 6. Location & US Residency (US Diaspora Focus)
  nationality: z.string().default('United States'),
  countryLivingIn: z.string().default('United States (USA)'),
  stateProvince: z.string().min(2, 'State / Province is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(3, 'Postal or Zip code is required'),
  residingStatus: z.enum([
    'CITIZEN',
    'PERMANENT_RESIDENT',
    'WORK_PERMIT',
    'STUDENT_VISA',
    'BUSINESS_VISA',
    'MULTIPLE_VISA',
    'TEMPORARY_VISA',
    'OTHERS',
  ]).default('CITIZEN'),
  addressLine: z.string().optional(),

  // 7. Wali / Guardian (Mandatory Halal Obligation)
  guardianName: z.string().min(2, 'Wali / Guardian name is mandatory'),
  guardianRelation: z.string().min(2, 'Wali relation (Father, Brother, etc.) is mandatory'),
  guardianPhoneCountryCode: z.string().default('+1'),
  guardianPhone: z.string().min(7, 'Wali contact telephone is mandatory'),
  guardianEmail: z.string().email().optional().or(z.literal('')),
  guardianVerified: z.coerce.boolean().default(true),

  // 8. Partner Expectations & Narrative
  aboutMe: z.string().min(20, 'Please write at least 20 characters about yourself and religious values'),
  whatIAmLookingFor: z.string().min(20, 'Please describe your expectations for your future spouse'),
  hobbiesInterests: z.string().optional(),
  photoPrivacy: z.enum(['PUBLIC', 'BLURRED_PURDAH', 'HIDDEN']).default('PUBLIC'),

  // Partner Preferences criteria
  partnerAgeMin: z.coerce.number().min(18).default(20),
  partnerAgeMax: z.coerce.number().max(80).default(35),
  partnerMaritalStatus: z.string().default("Doesn't Matter"),
  partnerHeightMinCm: z.coerce.number().default(150),
  partnerHeightMaxCm: z.coerce.number().default(195),
  partnerPreferredCountry: z.string().default('United States (USA)'),
  partnerPreferredState: z.string().default("Doesn't Matter"),
  partnerPreferredResidency: z.string().default("Doesn't Matter"),
});

export type BiodataFormData = z.infer<typeof biodataSchema>;

/**
 * Calculates dynamic profile completion score (0-100%)
 */
export function calculateCompletionScore(data: Partial<BiodataFormData>): number {
  let score = 0;

  // 1. Basic Identity (15%)
  if (data.fullName && data.gender && data.dateOfBirth && data.age) score += 15;

  // 2. Marital & Family (10%)
  if (data.maritalStatus && data.familyValues && data.fatherStatus) score += 10;

  // 3. Physical & Health (10%)
  if (data.heightFeetInches && data.bodyType && data.complexion) score += 10;

  // 4. Islamic Practice (15%)
  if (data.sectMazhab && data.religiousness && data.prayFrequency && data.halalDiet) score += 15;

  // 5. Education & Career (15%)
  if (data.educationLevel && data.profession && data.institutionName && data.annualIncome) score += 15;

  // 6. Location & Residency (10%)
  if (data.countryLivingIn && data.stateProvince && data.city && data.residingStatus) score += 10;

  // 7. Wali Guardian (Mandatory for Halal marriage) (15%)
  if (data.guardianName && data.guardianRelation && data.guardianPhone) score += 15;

  // 8. Narrative & Partner Preferences (10%)
  if (data.aboutMe && data.whatIAmLookingFor && data.aboutMe.length >= 20) score += 10;

  return Math.min(100, Math.max(0, score));
}
